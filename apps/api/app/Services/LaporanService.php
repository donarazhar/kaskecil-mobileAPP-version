<?php

namespace App\Services;

use App\Enums\TransaksiKategori;
use App\Models\Cabang;
use App\Models\Transaksi;
use App\Models\AkunMataAnggaran;
use Illuminate\Support\Facades\DB;

class LaporanService
{
    public function getBukuKas(array $filters): array
    {
        $cabangId = $filters['cabang_id'] ?? null;
        $unitId = $filters['unit_id'] ?? null;
        $from = $filters['from'] ?? null;
        $to = $filters['to'] ?? null;

        // Get saldo awal (sum of transactions before the start date)
        $saldoAwal = 0;
        if ($from) {
            $query = Transaksi::whereDate('tanggal', '<', $from);
            if ($cabangId)
                $query->forCabang($cabangId);
            if ($unitId)
                $query->forUnit($unitId);

            $pembentukan = (clone $query)->pembentukan()->sum('jumlah');
            $pengisian = (clone $query)->pengisian()->sum('jumlah');
            $pengeluaran = (clone $query)->pengeluaran()->sum('jumlah');
            $saldoAwal = $pembentukan + $pengisian - $pengeluaran;
        }

        // Get transactions in date range
        $query = Transaksi::with(['cabang', 'unit', 'user'])
            ->orderBy('tanggal')
            ->orderBy('created_at');

        if ($cabangId)
            $query->forCabang($cabangId);
        if ($unitId)
            $query->forUnit($unitId);
        if ($from)
            $query->whereDate('tanggal', '>=', $from);
        if ($to)
            $query->whereDate('tanggal', '<=', $to);

        $transaksi = $query->get();

        $totalMasuk = $transaksi->filter(fn($t) => $t->kategori !== TransaksiKategori::PENGELUARAN)->sum('jumlah');
        $totalKeluar = $transaksi->filter(fn($t) => $t->kategori === TransaksiKategori::PENGELUARAN)->sum('jumlah');
        $saldoAkhir = $saldoAwal + $totalMasuk - $totalKeluar;

        return [
            'periode' => [
                'from' => $from,
                'to' => $to,
            ],
            'cabang' => $cabangId ? Cabang::find($cabangId) : null,
            'saldo_awal' => $saldoAwal,
            'total_masuk' => $totalMasuk,
            'total_keluar' => $totalKeluar,
            'saldo_akhir' => $saldoAkhir,
            'transaksi' => $transaksi,
        ];
    }

    public function getRekapAnggaran(array $filters): array
    {
        $cabangId = $filters['cabang_id'] ?? null;
        $unitId = $filters['unit_id'] ?? null;
        $tahun = $filters['tahun'] ?? date('Y');

        // Start query with relations
        $query = AkunMataAnggaran::with(['akunAas.unit.cabang']);

        // Filter by Cabang (via AkunAAS -> Unit -> Cabang)
        if ($cabangId) {
            $query->whereHas('akunAas.unit', function ($q) use ($cabangId) {
                $q->where('cabang_id', $cabangId);
            });
        }

        // Filter by Unit (via AkunAAS -> Unit)
        if ($unitId) {
            $query->whereHas('akunAas', function ($q) use ($unitId) {
                $q->where('unit_id', $unitId);
            });
        }

        // Only active Akun AAS
        $query->whereHas('akunAas', function ($q) {
            $q->active();
        });

        $mataAnggaran = $query->get();

        // Calculate realisasi for each mata anggaran
        $result = $mataAnggaran->map(function ($ma) {
            $unitId = $ma->akunAas->unit_id;

            // Transaksi is linked by kode_matanggaran string
            // We must filter by the specific Unit to ensure we sum correctly for this item
            $realisasi = Transaksi::pengeluaran()
                ->where('kode_matanggaran', $ma->kode_matanggaran)
                ->where('unit_id', $unitId)
                ->sum('jumlah');

            // In simplified schema, 'saldo' is the current remaining balance
            $sisa = $ma->saldo;
            // Derived Pagu (Limit) = Remaining + Spent
            $pagu = $sisa + $realisasi;

            $persentase = $pagu > 0 ? round(($realisasi / $pagu) * 100, 2) : 0;

            return [
                'kode' => $ma->kode_matanggaran,
                'nama' => $ma->nama_matanggaran,
                'pagu' => $pagu,
                'realisasi' => $realisasi,
                'sisa' => $sisa,
                'persentase' => $persentase,
            ];
        });

        return [
            'tahun' => $tahun,
            'cabang' => $cabangId ? Cabang::find($cabangId) : null,
            'mata_anggaran' => $result,
            'total_pagu' => $result->sum('pagu'),
            'total_realisasi' => $result->sum('realisasi'),
            'total_sisa' => $result->sum('sisa'),
        ];
    }

    public function getChartData(array $filters): array
    {
        $cabangId = $filters['cabang_id'] ?? null;
        $unitId = $filters['unit_id'] ?? null;
        $period = $filters['period'] ?? '30d';

        $days = match ($period) {
            '7d' => 7,
            '30d' => 30,
            '1y' => 365,
            default => 30,
        };

        $startDate = now()->subDays($days);

        $query = Transaksi::selectRaw('DATE(tanggal) as tanggal, SUM(jumlah) as total')
            ->where('kategori', TransaksiKategori::PENGELUARAN)
            ->where('tanggal', '>=', $startDate)
            ->groupBy(DB::raw('DATE(tanggal)'))
            ->orderBy('tanggal');

        if ($cabangId)
            $query->where('cabang_id', $cabangId);
        if ($unitId)
            $query->where('unit_id', $unitId);

        return $query->get()->map(fn($item) => [
            'tanggal' => $item->tanggal,
            'total' => (float) $item->total,
        ])->toArray();
    }

    public function getTopAnggaran(array $filters, int $limit = 5): array
    {
        $cabangId = $filters['cabang_id'] ?? null;
        $unitId = $filters['unit_id'] ?? null;

        $query = Transaksi::query()
            ->selectRaw('
                akun_aas.id as akun_id,
                akun_aas.kode_akun,
                akun_aas.nama_akun,
                SUM(transaksi.jumlah) as total
            ')
            ->join('akun_matanggaran', 'transaksi.kode_matanggaran', '=', 'akun_matanggaran.kode_matanggaran')
            ->join('akun_aas', 'akun_matanggaran.akun_aas_id', '=', 'akun_aas.id')
            ->where('transaksi.kategori', TransaksiKategori::PENGELUARAN)
            ->groupBy('akun_aas.id', 'akun_aas.kode_akun', 'akun_aas.nama_akun')
            ->orderByDesc('total')
            ->limit($limit);

        if ($cabangId)
            $query->where('transaksi.cabang_id', $cabangId);
        if ($unitId)
            $query->where('transaksi.unit_id', $unitId);

        $result = $query->get();
        // Calculate grand total for percentage calculation
        // We need a separate query for grand total of filtered transactions to calculate correct percentage
        $totalQuery = Transaksi::where('kategori', TransaksiKategori::PENGELUARAN);
        if ($cabangId)
            $totalQuery->where('cabang_id', $cabangId);
        if ($unitId)
            $totalQuery->where('unit_id', $unitId);
        $grandTotal = $totalQuery->sum('jumlah');

        return $result->map(function ($item) use ($grandTotal) {
            return [
                'kode_matanggaran' => $item->kode_akun, // Keep key for frontend compatibility or change frontend
                'nama_matanggaran' => $item->nama_akun,
                'total' => (float) $item->total,
                'percentage' => $grandTotal > 0 ? round(($item->total / $grandTotal) * 100, 2) : 0,
            ];
        })->toArray();
    }
}
