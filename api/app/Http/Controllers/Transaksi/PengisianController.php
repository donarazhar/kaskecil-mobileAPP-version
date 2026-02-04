<?php

namespace App\Http\Controllers\Transaksi;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransaksiResource;
use App\Services\ReplenishmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PengisianController extends Controller
{
    public function __construct(
        private ReplenishmentService $replenishmentService
    ) {
    }

    public function pending(Request $request): JsonResponse
    {
        $user = $request->user();
        $cabangId = $request->input('cabang_id', $user->cabang_id);
        $unitId = $request->input('unit_id', $user->unit_id);

        if (!$user->isSuperAdmin()) {
            $cabangId = $user->cabang_id;
            if (!$user->isAdminCabang()) {
                $unitId = $user->unit_id;
            }
        }

        $result = $this->replenishmentService->getPending($cabangId, $unitId);

        return response()->json([
            'success' => true,
            'data' => [
                'transaksi' => TransaksiResource::collection($result['transaksi']),
                'total' => $result['total'],
            ],
        ]);
    }

    public function process(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'cabang_id' => 'required|exists:cabang,id',
            'unit_id' => 'nullable|exists:unit,id',
            'tanggal' => 'required|date',
            'no_bukti' => 'nullable|string|max:50',
            'keterangan' => 'nullable|string',
        ]);

        // Check access
        if (!$user->isSuperAdmin() && $user->cabang_id != $validated['cabang_id']) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk cabang ini.',
            ], 403);
        }

        try {
            $pengisian = $this->replenishmentService->process($validated, $user);

            return response()->json([
                'success' => true,
                'message' => 'Pengisian kembali berhasil diproses.',
                'data' => new TransaksiResource($pengisian->load(['cabang', 'unit', 'user', 'transaksiDiisi'])),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function history(Request $request): JsonResponse
    {
        $user = $request->user();
        $cabangId = $request->input('cabang_id', $user->cabang_id);
        $unitId = $request->input('unit_id', $user->unit_id);

        if (!$user->isSuperAdmin()) {
            $cabangId = $user->cabang_id;
        }

        $history = $this->replenishmentService->getHistory($cabangId, $unitId);

        return response()->json([
            'success' => true,
            'data' => $history,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $pengisian = \App\Models\Transaksi::with(['cabang', 'unit', 'user', 'transaksiDiisi'])
            ->pengisian()
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'pengisian' => new TransaksiResource($pengisian),
                'transaksi_diisi' => TransaksiResource::collection($pengisian->transaksiDiisi),
            ],
        ]);
    }
}
