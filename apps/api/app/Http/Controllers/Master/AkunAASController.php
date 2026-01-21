<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\AkunAAS;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AkunAASController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Ensure role is loaded
        if (!$user->relationLoaded('role')) {
            $user->load('role');
        }

        $query = AkunAAS::orderBy('kode_akun');

        // Filter by unit_id
        // Priority: 1) Explicit filter from request, 2) Auto-filter for non-SuperAdmin
        $isSuperAdmin = $user->role && $user->role->name === 'super_admin';

        if ($request->filled('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        } elseif (!$isSuperAdmin) {
            // Non-SuperAdmin users can only see their own unit's data
            if ($user->unit_id) {
                $query->where('unit_id', $user->unit_id);
            } else {
                // If admin_unit has no unit_id assigned, return empty
                return response()->json([
                    'success' => true,
                    'data' => [],
                ]);
            }
        }

        if ($request->has('active_only')) {
            $query->active();
        }

        $akun = $query->get();

        return response()->json([
            'success' => true,
            'data' => $akun,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'unit_id' => 'required|exists:unit,id',
            'kode_akun' => [
                'required',
                'string',
                'max:20',
                function ($attribute, $value, $fail) use ($request) {
                    $exists = AkunAAS::where('unit_id', $request->unit_id)
                        ->where('kode_akun', $value)
                        ->exists();
                    if ($exists) {
                        $fail('Kode akun sudah digunakan untuk unit ini.');
                    }
                },
            ],
            'nama_akun' => 'required|string|max:255',
            'jenis' => 'required|in:debet,kredit',
        ]);

        $akun = AkunAAS::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Akun AAS berhasil dibuat.',
            'data' => $akun,
        ], 201);
    }

    public function update(Request $request, AkunAAS $akunAas): JsonResponse
    {
        $validated = $request->validate([
            'kode_akun' => [
                'sometimes',
                'string',
                'max:20',
                function ($attribute, $value, $fail) use ($request, $akunAas) {
                    $exists = AkunAAS::where('unit_id', $akunAas->unit_id)
                        ->where('kode_akun', $value)
                        ->where('id', '!=', $akunAas->id)
                        ->exists();
                    if ($exists) {
                        $fail('Kode akun sudah digunakan untuk unit ini.');
                    }
                },
            ],
            'nama_akun' => 'sometimes|string|max:255',
            'jenis' => 'sometimes|in:debet,kredit',
            'is_active' => 'sometimes|boolean',
        ]);

        $akunAas->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Akun AAS berhasil diperbarui.',
            'data' => $akunAas->fresh(),
        ]);
    }

    public function destroy(AkunAAS $akunAas): JsonResponse
    {
        $akunAas->delete();

        return response()->json([
            'success' => true,
            'message' => 'Akun AAS berhasil dihapus.',
        ]);
    }
}
