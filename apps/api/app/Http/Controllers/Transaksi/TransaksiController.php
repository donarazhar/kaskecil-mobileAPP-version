<?php

namespace App\Http\Controllers\Transaksi;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransaksiResource;
use App\Models\Transaksi;
use App\Models\TransaksiShadow;
use App\Services\TransaksiService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransaksiController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private TransaksiService $transaksiService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Transaksi::with(['cabang', 'unit', 'user', 'mataAnggaran.akunAas'])
            ->orderByDesc('tanggal')
            ->orderByDesc('created_at');

        // Filter by access
        if (!$user->isSuperAdmin()) {
            $query->where('cabang_id', $user->cabang_id);
            if (!$user->isAdminCabang()) {
                $query->where('unit_id', $user->unit_id);
            }
        }

        // Apply filters
        if ($request->has('cabang_id') && $user->isSuperAdmin()) {
            $query->where('cabang_id', $request->cabang_id);
        }
        if ($request->has('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }
        if ($request->has('kategori')) {
            $query->where('kategori', $request->kategori);
        }
        if ($request->has('from')) {
            $query->whereDate('tanggal', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->whereDate('tanggal', '<=', $request->to);
        }
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('keterangan', 'like', "%{$request->search}%")
                    ->orWhere('no_bukti', 'like', "%{$request->search}%");
            });
        }

        $perPage = $request->input('per_page', 15);
        $transaksi = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => TransaksiResource::collection($transaksi),
            'meta' => [
                'current_page' => $transaksi->currentPage(),
                'from' => $transaksi->firstItem(),
                'last_page' => $transaksi->lastPage(),
                'per_page' => $transaksi->perPage(),
                'to' => $transaksi->lastItem(),
                'total' => $transaksi->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cabang_id' => 'required|exists:cabang,id',
            'unit_id' => 'nullable|exists:unit,id',
            'tanggal' => 'required|date',
            'no_bukti' => 'nullable|string|max:50',
            'keterangan' => 'required|string',
            'kategori' => 'required|in:pembentukan,pengeluaran,pengisian',
            'jumlah' => 'required|numeric|min:0',
            'kode_matanggaran' => 'nullable|string|max:20',
            'lampiran' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf',
            'lampiran2' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf',
            'lampiran3' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf',
        ]);

        $transaksi = $this->transaksiService->create($validated, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dibuat.',
            'data' => new TransaksiResource($transaksi->load(['cabang', 'unit', 'user'])),
        ], 201);
    }

    public function show(Transaksi $transaksi): JsonResponse
    {
        $this->authorize('view', $transaksi);

        return response()->json([
            'success' => true,
            'data' => new TransaksiResource($transaksi->load(['cabang', 'unit', 'user'])),
        ]);
    }

    public function update(Request $request, Transaksi $transaksi): JsonResponse
    {
        $this->authorize('update', $transaksi);

        $validated = $request->validate([
            'tanggal' => 'sometimes|date',
            'no_bukti' => 'nullable|string|max:50',
            'keterangan' => 'sometimes|string',
            'jumlah' => 'sometimes|numeric|min:0',
            'kode_matanggaran' => 'nullable|string|max:20',
            'lampiran' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf',
            'lampiran2' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf',
            'lampiran3' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf',
        ]);

        $transaksi = $this->transaksiService->update($transaksi, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil diperbarui.',
            'data' => new TransaksiResource($transaksi->load(['cabang', 'unit', 'user'])),
        ]);
    }

    public function destroy(Transaksi $transaksi): JsonResponse
    {
        $this->authorize('delete', $transaksi);

        $this->transaksiService->delete($transaksi);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dihapus.',
        ]);
    }

    /**
     * Cairkan pengisian kas (move from transaksi_shadow to transaksi)
     */
    public function cairkan(int $shadowId): JsonResponse
    {
        $transaksi = $this->transaksiService->cairkan($shadowId);

        return response()->json([
            'success' => true,
            'message' => 'Pengisian kas berhasil dicairkan.',
            'data' => new TransaksiResource($transaksi->load(['cabang', 'unit', 'user'])),
        ]);
    }
}
