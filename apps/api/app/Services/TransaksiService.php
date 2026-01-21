<?php

namespace App\Services;

use App\Enums\TransaksiKategori;
use App\Models\Cabang;
use App\Models\Transaksi;
use App\Models\TransaksiShadow;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TransaksiService
{
    public function __construct(
        private FileUploadService $uploadService,
        private NotificationService $notificationService
    ) {
    }

    public function create(array $data, User $user): Transaksi|TransaksiShadow
    {
        return DB::transaction(function () use ($data, $user) {
            // Handle file uploads
            $lampiran = $this->handleLampiran($data);

            // If kategori is 'pengisian', save to transaksi_shadow
            if ($data['kategori'] === 'pengisian') {
                $transaksi = TransaksiShadow::create([
                    'cabang_id' => $data['cabang_id'],
                    'unit_id' => $data['unit_id'] ?? null,
                    'tanggal' => $data['tanggal'],
                    'no_bukti' => $data['no_bukti'] ?? null,
                    'keterangan' => $data['keterangan'],
                    'kategori' => $data['kategori'],
                    'jumlah' => $data['jumlah'],
                    'kode_matanggaran' => $data['kode_matanggaran'] ?? null,
                    'lampiran' => $lampiran['lampiran'] ?? null,
                    'lampiran2' => $lampiran['lampiran2'] ?? null,
                    'lampiran3' => $lampiran['lampiran3'] ?? null,
                    'user_id' => $user->id,
                    'status' => 'draft', // Status draft for pengisian
                ]);
            } else {
                // Auto-generate no_bukti for pengeluaran if not provided
                $noBukti = $data['no_bukti'] ?? null;
                if (empty($noBukti) && $data['kategori'] === 'pengeluaran') {
                    $noBukti = $this->generateNoBukti($data['unit_id'] ?? null);
                }

                // For other categories, save directly to transaksi
                $transaksi = Transaksi::create([
                    'cabang_id' => $data['cabang_id'],
                    'unit_id' => $data['unit_id'] ?? null,
                    'tanggal' => $data['tanggal'],
                    'no_bukti' => $noBukti,
                    'keterangan' => $data['keterangan'],
                    'kategori' => $data['kategori'],
                    'jumlah' => $data['jumlah'],
                    'kode_matanggaran' => $data['kode_matanggaran'] ?? null,
                    'lampiran' => $lampiran['lampiran'] ?? null,
                    'lampiran2' => $lampiran['lampiran2'] ?? null,
                    'lampiran3' => $lampiran['lampiran3'] ?? null,
                    'user_id' => $user->id,
                ]);

                // Update saldo mata anggaran jika pengeluaran
                if ($transaksi->kategori === TransaksiKategori::PENGELUARAN && $transaksi->kode_matanggaran) {
                    $this->updateSaldoMataAnggaran($transaksi);
                }
            }

            return $transaksi;
        });
    }

    public function update(Transaksi $transaksi, array $data): Transaksi
    {
        return DB::transaction(function () use ($transaksi, $data) {
            $updateData = [
                'tanggal' => $data['tanggal'] ?? $transaksi->tanggal,
                'no_bukti' => $data['no_bukti'] ?? $transaksi->no_bukti,
                'keterangan' => $data['keterangan'] ?? $transaksi->keterangan,
                'jumlah' => $data['jumlah'] ?? $transaksi->jumlah,
                'kode_matanggaran' => $data['kode_matanggaran'] ?? $transaksi->kode_matanggaran,
            ];

            // Handle new lampiran uploads
            $lampiran = $this->handleLampiran($data);
            if (!empty($lampiran)) {
                $updateData = array_merge($updateData, $lampiran);
            }

            $transaksi->update($updateData);

            return $transaksi->fresh();
        });
    }

    public function delete(Transaksi $transaksi): bool
    {
        return DB::transaction(function () use ($transaksi) {
            // Delete lampiran files
            if ($transaksi->lampiran) {
                $this->uploadService->delete($transaksi->lampiran);
            }
            if ($transaksi->lampiran2) {
                $this->uploadService->delete($transaksi->lampiran2);
            }
            if ($transaksi->lampiran3) {
                $this->uploadService->delete($transaksi->lampiran3);
            }

            return $transaksi->delete();
        });
    }

    public function getSummary(?int $cabangId = null, ?int $unitId = null): array
    {
        $query = Transaksi::query();

        if ($cabangId) {
            $query->forCabang($cabangId);
        }
        if ($unitId) {
            $query->forUnit($unitId);
        }

        $pembentukan = (clone $query)->pembentukan()->sum('jumlah');
        $pengisian = (clone $query)->pengisian()->sum('jumlah');
        $pengeluaran = (clone $query)->pengeluaran()->sum('jumlah');

        $plafon = 0;
        if ($unitId) {
            $plafon = Unit::find($unitId)?->plafon_kas ?? 0;
        } elseif ($cabangId) {
            $plafon = Cabang::find($cabangId)?->plafon_kas ?? 0;
        } else {
            // Global view (Super Admin) - sum all active Cabang plafon
            $plafon = Cabang::where('is_active', true)->sum('plafon_kas');
        }

        // Sisa kas = (Plafon (Pembentukan) + Pengisian) - Pengeluaran
        $sisaKas = ($plafon + $pengisian) - $pengeluaran;

        // Persentase pemakaian dari Plafon (jika ada)
        $persentasePemakaian = $plafon > 0 ? round(($pengeluaran / $plafon) * 100, 2) : 0;

        // Hitung total draft pengisian
        $shadowQuery = TransaksiShadow::query();
        if ($cabangId) {
            $shadowQuery->forCabang($cabangId);
        }
        if ($unitId) {
            $shadowQuery->forUnit($unitId);
        }
        $totalDraftPengisian = $shadowQuery->where('kategori', TransaksiKategori::PENGISIAN)->sum('jumlah');

        // Hitung ringkasan bulanan (3 bulan awal tahun berjalan: Jan, Feb, Mar)
        $monthlySummary = [];
        $startOfYear = now()->startOfYear();

        for ($i = 0; $i < 3; $i++) {
            $date = $startOfYear->copy()->addMonths($i);
            $monthStart = $date->copy()->startOfMonth();
            $monthEnd = $date->copy()->endOfMonth();

            $monthQuery = Transaksi::whereBetween('tanggal', [$monthStart, $monthEnd]);
            if ($cabangId)
                $monthQuery->forCabang($cabangId);
            if ($unitId)
                $monthQuery->forUnit($unitId);

            $monthTransactions = $monthQuery->get();

            // Format bulan menjadi 01/2026, 02/2026, dst
            $formattedMonth = $date->format('m/Y');

            $monthlySummary[] = [
                'month' => $formattedMonth,
                'pengeluaran' => $monthTransactions->where('kategori', TransaksiKategori::PENGELUARAN)->sum('jumlah'),
                'pengisian' => $monthTransactions->where('kategori', TransaksiKategori::PENGISIAN)->sum('jumlah'),
            ];
        }

        return [
            'plafon' => $plafon,
            'total_pengeluaran' => $pengeluaran,
            'sisa_kas' => $sisaKas,
            'persentase_pemakaian' => $persentasePemakaian,
            'total_draft_pengisian' => $totalDraftPengisian,
            'monthly_summary' => $monthlySummary,
        ];
    }

    private function handleLampiran(array $data): array
    {
        $result = [];

        if (isset($data['lampiran']) && $data['lampiran']) {
            $result['lampiran'] = $this->uploadService->upload($data['lampiran'], 'transaksi');
        }
        if (isset($data['lampiran2']) && $data['lampiran2']) {
            $result['lampiran2'] = $this->uploadService->upload($data['lampiran2'], 'transaksi');
        }
        if (isset($data['lampiran3']) && $data['lampiran3']) {
            $result['lampiran3'] = $this->uploadService->upload($data['lampiran3'], 'transaksi');
        }

        return $result;
    }

    private function updateSaldoMataAnggaran(Transaksi $transaksi): void
    {
        // Implementation for updating mata anggaran saldo
    }

    /**
     * Generate auto no_bukti for pengeluaran transactions
     * Format: BKK-YYYYMM-XXXXX (BKK = Bukti Kas Keluar)
     */
    private function generateNoBukti(?int $unitId = null): string
    {
        $prefix = 'BKK';
        $yearMonth = now()->format('Ym');

        // Get the last transaction number for this month
        $lastTransaksi = Transaksi::where('no_bukti', 'like', "{$prefix}-{$yearMonth}-%")
            ->where('kategori', 'pengeluaran')
            ->when($unitId, fn($q) => $q->where('unit_id', $unitId))
            ->orderByDesc('no_bukti')
            ->first();

        if ($lastTransaksi && preg_match("/{$prefix}-{$yearMonth}-(\d+)/", $lastTransaksi->no_bukti, $matches)) {
            $nextNumber = intval($matches[1]) + 1;
        } else {
            $nextNumber = 1;
        }

        return sprintf('%s-%s-%05d', $prefix, $yearMonth, $nextNumber);
    }

    /**
     * Cairkan pengisian kas (move from transaksi_shadow to transaksi)
     */
    public function cairkan(int $shadowId): Transaksi
    {
        return DB::transaction(function () use ($shadowId) {
            // Find the shadow transaction
            $shadow = TransaksiShadow::findOrFail($shadowId);

            // Verify it's a pengisian
            if ($shadow->kategori !== TransaksiKategori::PENGISIAN) {
                throw new \Exception('Hanya transaksi pengisian yang dapat dicairkan');
            }

            // Create transaksi from shadow
            $transaksi = Transaksi::create([
                'cabang_id' => $shadow->cabang_id,
                'unit_id' => $shadow->unit_id,
                'tanggal' => $shadow->tanggal,
                'no_bukti' => $shadow->no_bukti,
                'keterangan' => $shadow->keterangan,
                'kategori' => $shadow->kategori,
                'jumlah' => $shadow->jumlah,
                'kode_matanggaran' => $shadow->kode_matanggaran,
                'lampiran' => $shadow->lampiran,
                'lampiran2' => $shadow->lampiran2,
                'lampiran3' => $shadow->lampiran3,
                'user_id' => $shadow->user_id,
            ]);

            // Delete from shadow table
            $shadow->delete();

            return $transaksi;
        });
    }
    /**
     * Get summary per unit for Super Admin dashboard
     */
    public function getUnitSummaries(?int $cabangId = null): array
    {
        $query = Unit::with('cabang');

        if ($cabangId) {
            $query->where('cabang_id', $cabangId);
        }

        $units = $query
            ->withSum([
                'transaksi as total_pengeluaran' => function ($query) {
                    $query->where('kategori', TransaksiKategori::PENGELUARAN);
                }
            ], 'jumlah')
            ->withSum([
                'transaksi as total_pengisian' => function ($query) {
                    $query->where('kategori', TransaksiKategori::PENGISIAN);
                }
            ], 'jumlah')
            ->withSum([
                'transaksiShadow as total_draft' => function ($query) {
                    $query->where('kategori', TransaksiKategori::PENGISIAN);
                }
            ], 'jumlah')
            ->get();

        return $units->map(function ($unit) {
            $plafon = $unit->plafon_kas;
            $pengeluaran = $unit->total_pengeluaran ?? 0;
            $pengisian = $unit->total_pengisian ?? 0;
            $draft = $unit->total_draft ?? 0;

            // Sisa kas = (Plafon + Pengisian) - Pengeluaran
            $sisaKas = ($plafon + $pengisian) - $pengeluaran;
            $persentase = $plafon > 0 ? round(($pengeluaran / $plafon) * 100, 2) : 0;

            return [
                'id' => $unit->id,
                'nama_unit' => $unit->nama_unit,
                'kode_unit' => $unit->kode_unit,
                'cabang' => $unit->cabang->nama_cabang,
                'plafon' => $plafon,
                'total_pengeluaran' => $pengeluaran,
                'total_pengisian' => $pengisian,
                'total_draft' => $draft,
                'sisa_kas' => $sisaKas,
                'persentase_pemakaian' => $persentase,
            ];
        })->toArray();
    }
}
