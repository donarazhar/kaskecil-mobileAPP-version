<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Instansi;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InstansiController extends Controller
{
    public function __construct(
        private FileUploadService $uploadService
    ) {
    }

    public function show(): JsonResponse
    {
        $instansi = Instansi::first();

        if (!$instansi) {
            $instansi = Instansi::create(['nama_instansi' => 'Nama Instansi']);
        }

        return response()->json([
            'success' => true,
            'data' => $instansi,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama_instansi' => 'sometimes|string|max:255',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'logo' => 'nullable|file|max:2048|mimes:jpg,jpeg,png',
            'kepala_instansi' => 'nullable|string|max:255',
            'nip_kepala' => 'nullable|string|max:50',
        ]);

        $instansi = Instansi::first();

        if (!$instansi) {
            $instansi = Instansi::create(['nama_instansi' => 'Nama Instansi']);
        }

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($instansi->logo) {
                $this->uploadService->delete($instansi->logo);
            }
            $validated['logo'] = $this->uploadService->upload($request->file('logo'), 'instansi');
        }

        $instansi->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Instansi berhasil diperbarui.',
            'data' => $instansi->fresh(),
        ]);
    }
}
