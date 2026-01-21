<?php

namespace App\Http\Controllers;

use App\Http\Resources\TransaksiResource;
use App\Models\TransaksiShadow;
use App\Services\LaporanService;
use App\Services\TransaksiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private TransaksiService $transaksiService,
        private LaporanService $laporanService
    ) {
    }

    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $cabangId = $request->input('cabang_id', $user->cabang_id);
        $unitId = $request->input('unit_id', $user->unit_id);

        // Non-super admin can only see their own scope
        if (!$user->isSuperAdmin()) {
            $cabangId = $user->cabang_id;
            if (!$user->isAdminCabang()) {
                $unitId = $user->unit_id;
            }
        }

        $summary = $this->transaksiService->getSummary($cabangId, $unitId);

        // Add pending approvals count for admins
        if ($user->hasMinRole(\App\Enums\UserRole::ADMIN_UNIT)) {
            $pendingQuery = TransaksiShadow::pending();
            if ($cabangId)
                $pendingQuery->forCabang($cabangId);
            if ($unitId)
                $pendingQuery->forUnit($unitId);
            $summary['pending_approvals'] = $pendingQuery->count();
        }

        // Add unit summaries for super admin
        if ($user->isSuperAdmin()) {
            $summary['unit_summaries'] = $this->transaksiService->getUnitSummaries($cabangId);
        }

        return response()->json([
            'success' => true,
            'data' => $summary,
        ]);
    }

    public function chart(Request $request): JsonResponse
    {
        $user = $request->user();

        $filters = [
            'cabang_id' => $request->input('cabang_id', $user->cabang_id),
            'unit_id' => $request->input('unit_id', $user->unit_id),
            'period' => $request->input('period', '30d'),
        ];

        if (!$user->isSuperAdmin()) {
            $filters['cabang_id'] = $user->cabang_id;
            if (!$user->isAdminCabang()) {
                $filters['unit_id'] = $user->unit_id;
            }
        }

        $data = $this->laporanService->getChartData($filters);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function recent(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = $request->input('limit', 5);

        $query = \App\Models\Transaksi::with(['cabang', 'unit', 'user'])
            ->orderByDesc('created_at')
            ->limit($limit);

        if (!$user->isSuperAdmin()) {
            $query->where('cabang_id', $user->cabang_id);
            if (!$user->isAdminCabang()) {
                $query->where('unit_id', $user->unit_id);
            }
        } else {
            if ($request->has('cabang_id')) {
                $query->where('cabang_id', $request->cabang_id);
            }
            if ($request->has('unit_id')) {
                $query->where('unit_id', $request->unit_id);
            }
        }

        return response()->json([
            'success' => true,
            'data' => TransaksiResource::collection($query->get()),
        ]);
    }

    public function topAnggaran(Request $request): JsonResponse
    {
        $user = $request->user();

        $filters = [
            'cabang_id' => $request->input('cabang_id', $user->cabang_id),
            'unit_id' => $request->input('unit_id', $user->unit_id),
        ];

        if (!$user->isSuperAdmin()) {
            $filters['cabang_id'] = $user->cabang_id;
        }

        $data = $this->laporanService->getTopAnggaran($filters);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function pendingApprovals(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = TransaksiShadow::pending()
            ->with(['cabang', 'unit', 'user'])
            ->orderBy('created_at');

        if (!$user->isSuperAdmin()) {
            $query->where('cabang_id', $user->cabang_id);
            if ($user->isAdminUnit()) {
                $query->where('unit_id', $user->unit_id);
            }
        }

        return response()->json([
            'success' => true,
            'data' => \App\Http\Resources\DraftResource::collection($query->get()),
        ]);
    }
}
