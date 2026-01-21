<?php

namespace App\Http\Controllers;

use App\Services\LaporanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LaporanController extends Controller
{
    public function __construct(
        private LaporanService $laporanService
    ) {
    }

    public function bukuKas(Request $request): JsonResponse
    {
        $user = $request->user();

        $filters = [
            'cabang_id' => $request->input('cabang_id', $user->cabang_id),
            'unit_id' => $request->input('unit_id', $user->unit_id),
            'from' => $request->input('from'),
            'to' => $request->input('to'),
        ];

        if (!$user->isSuperAdmin()) {
            $filters['cabang_id'] = $user->cabang_id;
            if (!$user->isAdminCabang()) {
                $filters['unit_id'] = $user->unit_id;
            }
        }

        $data = $this->laporanService->getBukuKas($filters);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function rekapAnggaran(Request $request): JsonResponse
    {
        $user = $request->user();

        $filters = [
            'cabang_id' => $request->input('cabang_id', $user->cabang_id),
            'unit_id' => $request->input('unit_id', $user->unit_id),
            'tahun' => $request->input('tahun', date('Y')),
        ];

        if (!$user->isSuperAdmin()) {
            $filters['cabang_id'] = $user->cabang_id;
            $filters['unit_id'] = $user->unit_id;
        }

        $data = $this->laporanService->getRekapAnggaran($filters);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function cetakLaporan(Request $request)
    {
        $request->validate([
            'tanggalawal' => 'required|date',
            'tanggalakhir' => 'required|date|after_or_equal:tanggalawal',
        ]);

        $periodeawal = $request->tanggalawal;
        $periodeakhir = $request->tanggalakhir;

        // Query Data
        // Transaksi -> AkunMataAnggaran (via kode_matanggaran) -> AkunAAS (via akun_aas_id)
        $query = \App\Models\Transaksi::query()
            ->leftJoin('akun_matanggaran', 'transaksi.kode_matanggaran', '=', 'akun_matanggaran.kode_matanggaran')
            ->leftJoin('akun_aas', 'akun_matanggaran.akun_aas_id', '=', 'akun_aas.id')
            ->select(
                'transaksi.*',
                'transaksi.keterangan as perincian', // Alias keterangan to perincian
                'akun_aas.kode_akun as kode_aas',
                'akun_aas.nama_akun as nama_aas',
                'akun_matanggaran.kode_matanggaran'
            )
            ->whereBetween('transaksi.tanggal', [$periodeawal, $periodeakhir])
            ->where('transaksi.kategori', 'pengeluaran') // Only expenditure
            ->orderBy('akun_matanggaran.kode_matanggaran', 'asc')
            ->orderBy('akun_aas.kode_akun', 'asc');

        $user = $request->user();

        // If user is not authenticated via standard middleware (because of window.open), check token param
        if (!$user && $request->has('token')) {
            $token = $request->token;
            $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($accessToken) {
                $user = $accessToken->tokenable;
            }
        }

        // Ensure authentication if $user is null (e.g., if session not shared)
        // If route is public or API token not passed in window.open, $user is null.
        // For printing, we might need to rely on query param token or just proceed if it's an internal tool.
        // Given 'Belum muncul datanya', if $user is null, the previous code skipped filters so it should have shown ALL data.
        // The issue was likely the JOIN failing because 'akun_aas_id' didn't exist in transaksis.

        if ($user) {
            if ($user->isSuperAdmin()) {
                if ($request->filled('cabang_id')) {
                    $query->where('transaksi.cabang_id', $request->cabang_id);
                }
                if ($request->filled('unit_id')) {
                    $query->where('transaksi.unit_id', $request->unit_id);
                }
            } else {
                if ($user->cabang_id) {
                    $query->where('transaksi.cabang_id', $user->cabang_id);
                }
                if ($user->unit_id) {
                    $query->where('transaksi.unit_id', $user->unit_id);
                }
            }
        }

        $pengeluaranbulanini = $query->get();
        $totalpengeluaran = $query->sum('jumlah');

        // Signature Data
        $kepalaUnit = 'H. Tatang Komara'; // Default
        $staffUnit = 'Donarsi Y'; // Default
        $jabatanKepala = 'Kepala Kantor';

        if ($user) {
            $staffUnit = $user->nama;

            if ($user->unit) {
                $kepalaUnit = $user->unit->kepala_unit ?? $kepalaUnit;
                // Optional: Adjust title if needed, e.g. 'Kepala Unit ' . $user->unit->nama_unit
                $jabatanKepala = 'Kepala Unit ' . $user->unit->nama_unit;
            } elseif ($user->cabang) {
                // Fallback or specific logic for Cabang/Super Admin
            }
        }



        $isSuperAdmin = $user ? $user->isSuperAdmin() : false;

        $topExpenses = [];
        $dailyTrend = [];

        if ($isSuperAdmin) {
            // Aggregate Top Expenses by Account Name
            $topExpenses = $pengeluaranbulanini
                ->groupBy('nama_aas')
                ->map(fn($group) => $group->sum('jumlah'))
                ->sortDesc()
                ->take(10) // Top 10 expenses
                ->toArray();

            // Aggregate Daily Trend
            $dailyTrend = $pengeluaranbulanini
                ->groupBy(function ($item) {
                    return date('Y-m-d', strtotime($item->tanggal));
                })
                ->map(fn($group) => $group->sum('jumlah'))
                ->sortKeys() // Ensure dates are chronological
                ->toArray();
        }

        $namaCabang = null;
        $namaUnit = null;

        if ($user) {
            $cabangId = $isSuperAdmin ? $request->cabang_id : $user->cabang_id;
            $unitId = $isSuperAdmin ? $request->unit_id : $user->unit_id;

            if ($cabangId) {
                $cabang = \App\Models\Cabang::find($cabangId);
                $namaCabang = $cabang ? $cabang->nama_cabang : null;
            }

            if ($unitId) {
                $unit = \App\Models\Unit::find($unitId);
                $namaUnit = $unit ? $unit->nama_unit : null;
            }
        }

        $instansi = \App\Models\Instansi::first();

        $viewName = $isSuperAdmin ? 'laporan.cetak_superadmin' : 'laporan.cetak_unit';

        return view($viewName, compact(
            'periodeawal',
            'periodeakhir',
            'pengeluaranbulanini',
            'totalpengeluaran',
            'kepalaUnit',
            'staffUnit',
            'jabatanKepala',
            'isSuperAdmin',
            'topExpenses',
            'dailyTrend',
            'namaCabang',
            'namaUnit',
            'instansi'
        ));
    }

    public function exportPdf(Request $request)
    {
        // TODO: Implement PDF export using DomPDF or similar
        return response()->json([
            'success' => false,
            'message' => 'PDF export belum diimplementasikan.',
        ], 501);
    }

    public function exportExcel(Request $request)
    {
        // TODO: Implement Excel export using Laravel Excel
        return response()->json([
            'success' => false,
            'message' => 'Excel export belum diimplementasikan.',
        ], 501);
    }
}
