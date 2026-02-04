<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Resources\UnitResource;
use App\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Unit::with('cabang')->orderBy('nama_unit');

        // Filter by cabang_id
        if ($request->has('cabang_id')) {
            $query->where('cabang_id', $request->cabang_id);
        } elseif (!$user->isSuperAdmin()) {
            $query->where('cabang_id', $user->cabang_id);
        }

        if ($request->has('active_only')) {
            $query->active();
        }

        $units = $query->get();

        return response()->json([
            'success' => true,
            'data' => UnitResource::collection($units),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cabang_id' => 'required|exists:cabang,id',
            'kode_unit' => 'required|string|max:20',
            'nama_unit' => 'required|string|max:255',
            'kepala_unit' => 'nullable|string|max:255',
            'nip_kepala' => 'nullable|string|max:50',
            'plafon_kas' => 'nullable|numeric|min:0',
        ]);

        // Check unique constraint
        $exists = Unit::where('cabang_id', $validated['cabang_id'])
            ->where('kode_unit', $validated['kode_unit'])
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Kode unit sudah digunakan di cabang ini.',
            ], 422);
        }

        $unit = Unit::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Unit berhasil dibuat.',
            'data' => new UnitResource($unit->load('cabang')),
        ], 201);
    }

    public function show(Unit $unit): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new UnitResource($unit->load('cabang')),
        ]);
    }

    public function update(Request $request, Unit $unit): JsonResponse
    {
        $validated = $request->validate([
            'cabang_id' => 'sometimes|exists:cabang,id',
            'kode_unit' => 'sometimes|string|max:20',
            'nama_unit' => 'sometimes|string|max:255',
            'kepala_unit' => 'nullable|string|max:255',
            'nip_kepala' => 'nullable|string|max:50',
            'plafon_kas' => 'nullable|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        // Check unique constraint if kode_unit or cabang_id is being updated
        $targetCabangId = $validated['cabang_id'] ?? $unit->cabang_id;
        $targetKodeUnit = $validated['kode_unit'] ?? $unit->kode_unit;

        if ($targetKodeUnit !== $unit->kode_unit || $targetCabangId !== $unit->cabang_id) {
            $exists = Unit::where('cabang_id', $targetCabangId)
                ->where('kode_unit', $targetKodeUnit)
                ->where('id', '!=', $unit->id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kode unit sudah digunakan di cabang ini.',
                ], 422);
            }
        }

        $unit->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Unit berhasil diperbarui.',
            'data' => new UnitResource($unit->fresh()->load('cabang')),
        ]);
    }

    public function destroy(Unit $unit): JsonResponse
    {
        $unit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Unit berhasil dihapus.',
        ]);
    }

    public function summary(Unit $unit): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'unit' => new UnitResource($unit->load('cabang')),
                'plafon' => (float) $unit->plafon_kas,
                'saldo' => (float) $unit->saldo,
                'user_count' => $unit->users()->count(),
            ],
        ]);
    }
}
