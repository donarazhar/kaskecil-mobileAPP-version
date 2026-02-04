<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Resources\CabangResource;
use App\Models\Cabang;
use App\Models\Instansi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CabangController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Cabang::with('instansi')->orderBy('nama_cabang');

        if ($request->has('active_only')) {
            $query->active();
        }

        $cabang = $query->get();

        return response()->json([
            'success' => true,
            'data' => CabangResource::collection($cabang),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode_cabang' => 'required|string|max:20|unique:cabang,kode_cabang',
            'nama_cabang' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'kepala_cabang' => 'nullable|string|max:255',
            'nip_kepala' => 'nullable|string|max:50',
            'plafon_kas' => 'nullable|numeric|min:0',
        ]);

        // Get default instansi
        $instansi = Instansi::first();
        if (!$instansi) {
            $instansi = Instansi::create(['nama_instansi' => 'Default Instansi']);
        }

        $cabang = Cabang::create([
            ...$validated,
            'instansi_id' => $instansi->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cabang berhasil dibuat.',
            'data' => new CabangResource($cabang),
        ], 201);
    }

    public function show(Cabang $cabang): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new CabangResource($cabang->load('instansi')),
        ]);
    }

    public function update(Request $request, Cabang $cabang): JsonResponse
    {
        $validated = $request->validate([
            'kode_cabang' => 'sometimes|string|max:20|unique:cabang,kode_cabang,' . $cabang->id,
            'nama_cabang' => 'sometimes|string|max:255',
            'alamat' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'kepala_cabang' => 'nullable|string|max:255',
            'nip_kepala' => 'nullable|string|max:50',
            'plafon_kas' => 'nullable|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $cabang->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cabang berhasil diperbarui.',
            'data' => new CabangResource($cabang->fresh()),
        ]);
    }

    public function destroy(Cabang $cabang): JsonResponse
    {
        $cabang->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cabang berhasil dihapus.',
        ]);
    }

    public function summary(Cabang $cabang): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'cabang' => new CabangResource($cabang),
                'plafon' => (float) $cabang->plafon_kas,
                'saldo' => (float) $cabang->saldo,
                'unit_count' => $cabang->unit()->count(),
                'user_count' => $cabang->users()->count(),
            ],
        ]);
    }
}
