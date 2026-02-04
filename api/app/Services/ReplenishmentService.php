<?php

namespace App\Services;

use App\Enums\DraftStatus;
use App\Enums\TransaksiKategori;
use App\Models\Transaksi;
use App\Models\TransaksiShadow;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReplenishmentService
{
    public function __construct(
        private NotificationService $notificationService
    ) {
    }

    /**
     * Get pending pengeluaran yang belum diisi kembali
     */
    public function getPending(?int $cabangId = null, ?int $unitId = null): array
    {
        $query = Transaksi::belumDiisi()
            ->with(['cabang', 'unit', 'user'])
            ->orderBy('tanggal');

        if ($cabangId) {
            $query->forCabang($cabangId);
        }
        if ($unitId) {
            $query->forUnit($unitId);
        }

        $transaksi = $query->get();
        $total = $transaksi->sum('jumlah');

        return [
            'transaksi' => $transaksi,
            'total' => $total,
        ];
    }

    /**
     * Proses pengisian kembali
     */
    public function process(array $data, User $user): Transaksi
    {
        return DB::transaction(function () use ($data, $user) {
            $cabangId = $data['cabang_id'];
            $unitId = $data['unit_id'] ?? null;

            // Get pending pengeluaran
            $query = Transaksi::belumDiisi()->forCabang($cabangId);
            if ($unitId) {
                $query->forUnit($unitId);
            }
            $pendingTransaksi = $query->get();

            if ($pendingTransaksi->isEmpty()) {
                throw new \Exception('Tidak ada pengeluaran yang perlu diisi kembali.');
            }

            $totalPengisian = $pendingTransaksi->sum('jumlah');

            // Create pengisian transaksi
            $pengisian = Transaksi::create([
                'cabang_id' => $cabangId,
                'unit_id' => $unitId,
                'tanggal' => $data['tanggal'],
                'no_bukti' => $data['no_bukti'] ?? null,
                'keterangan' => $data['keterangan'] ?? 'Pengisian kembali kas kecil',
                'kategori' => TransaksiKategori::PENGISIAN,
                'jumlah' => $totalPengisian,
                'user_id' => $user->id,
            ]);

            // Update pengeluaran dengan id_pengisian
            foreach ($pendingTransaksi as $trx) {
                $trx->update(['id_pengisian' => $pengisian->id]);
            }

            // Send notification
            $this->notificationService->notifyPengisianCompleted($pengisian, $pendingTransaksi->count());

            return $pengisian;
        });
    }

    /**
     * Get history pengisian
     */
    public function getHistory(?int $cabangId = null, ?int $unitId = null, int $limit = 10): array
    {
        $query = Transaksi::pengisian()
            ->with(['cabang', 'unit', 'user', 'transaksiDiisi'])
            ->orderByDesc('tanggal');

        if ($cabangId) {
            $query->forCabang($cabangId);
        }
        if ($unitId) {
            $query->forUnit($unitId);
        }

        return $query->limit($limit)->get()->map(function ($pengisian) {
            return [
                'id' => $pengisian->id,
                'tanggal' => $pengisian->tanggal->format('Y-m-d'),
                'no_bukti' => $pengisian->no_bukti,
                'jumlah' => $pengisian->jumlah,
                'keterangan' => $pengisian->keterangan,
                'transaksi_count' => $pengisian->transaksiDiisi->count(),
                'user' => $pengisian->user,
                'created_at' => $pengisian->created_at->toISOString(),
            ];
        })->toArray();
    }
}
