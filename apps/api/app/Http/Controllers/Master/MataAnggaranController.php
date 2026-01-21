<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\AkunMataAnggaran;
use App\Models\AkunAAS;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MataAnggaranController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Ensure role is loaded
        if (!$user->relationLoaded('role')) {
            $user->load('role');
        }

        $query = AkunMataAnggaran::with('akunAas.unit')
            ->orderBy('kode_matanggaran');

        // Filter by unit_id through akun_aas relationship
        // Priority: 1) Explicit filter from request, 2) Auto-filter for non-SuperAdmin
        $isSuperAdmin = $user->role && $user->role->name === 'super_admin';

        if ($request->filled('unit_id')) {
            $query->whereHas('akunAas', function ($q) use ($request) {
                $q->where('unit_id', $request->unit_id);
            });
        } elseif (!$isSuperAdmin) {
            // Non-SuperAdmin users can only see their own unit's data
            if ($user->unit_id) {
                $query->whereHas('akunAas', function ($q) use ($user) {
                    $q->where('unit_id', $user->unit_id);
                });
            } else {
                // If admin_unit has no unit_id assigned, return empty
                return response()->json([
                    'success' => true,
                    'data' => [],
                ]);
            }
        }

        $mataAnggaran = $query->get();

        return response()->json([
            'success' => true,
            'data' => $mataAnggaran,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode_matanggaran' => 'required|string|max:25',
            'akun_aas_id' => 'required|integer|exists:akun_aas,id',
            'saldo' => 'nullable|integer|min:0',
        ]);

        // Check unique constraint
        $exists = AkunMataAnggaran::where('kode_matanggaran', $validated['kode_matanggaran'])
            ->where('akun_aas_id', $validated['akun_aas_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Kode mata anggaran sudah digunakan untuk akun AAS ini.',
            ], 422);
        }

        $mataAnggaran = AkunMataAnggaran::create([
            'kode_matanggaran' => $validated['kode_matanggaran'],
            'akun_aas_id' => $validated['akun_aas_id'],
            'saldo' => $validated['saldo'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mata anggaran berhasil dibuat.',
            'data' => $mataAnggaran->load('akunAas.unit'),
        ], 201);
    }

    public function update(Request $request, AkunMataAnggaran $mataAnggaran): JsonResponse
    {
        $validated = $request->validate([
            'kode_matanggaran' => 'sometimes|string|max:25',
            'akun_aas_id' => 'sometimes|integer|exists:akun_aas,id',
            'saldo' => 'sometimes|integer|min:0',
        ]);

        $mataAnggaran->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Mata anggaran berhasil diperbarui.',
            'data' => $mataAnggaran->fresh()->load('akunAas.unit'),
        ]);
    }

    public function destroy(AkunMataAnggaran $mataAnggaran): JsonResponse
    {
        $mataAnggaran->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mata anggaran berhasil dihapus.',
        ]);
    }
}
