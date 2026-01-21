<?php

namespace App\Http\Controllers\Transaksi;

use App\Enums\DraftStatus;
use App\Enums\TransaksiKategori;
use App\Http\Controllers\Controller;
use App\Http\Resources\DraftResource;
use App\Models\Transaksi;
use App\Models\TransaksiShadow;
use App\Services\FileUploadService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DraftController extends Controller
{
    public function __construct(
        private FileUploadService $uploadService,
        private NotificationService $notificationService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = TransaksiShadow::with(['cabang', 'unit', 'user', 'approver', 'mataAnggaran.akunAas'])
            ->orderByDesc('created_at');

        if (!$user->isSuperAdmin()) {
            $query->where('cabang_id', $user->cabang_id);
            if ($user->isPetugas()) {
                $query->where('user_id', $user->id);
            } elseif ($user->isAdminUnit()) {
                $query->where('unit_id', $user->unit_id);
            }
        }

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('cabang_id') && $user->isSuperAdmin()) {
            $query->where('cabang_id', $request->cabang_id);
        }
        if ($request->has('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }
        if ($request->has('kategori')) {
            $query->where('kategori', $request->kategori);
        }
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('keterangan', 'like', "%{$request->search}%")
                    ->orWhere('no_bukti', 'like', "%{$request->search}%");
            });
        }

        $perPage = $request->input('per_page', 15);
        $drafts = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => DraftResource::collection($drafts),
            'meta' => [
                'current_page' => $drafts->currentPage(),
                'last_page' => $drafts->lastPage(),
                'per_page' => $drafts->perPage(),
                'total' => $drafts->total(),
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
            'jumlah' => 'required|numeric|min:0',
            'kode_matanggaran' => 'nullable|string|max:20',
            'lampiran' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf',
            'lampiran2' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf',
            'lampiran3' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf',
        ]);

        $lampiran = [];
        if ($request->hasFile('lampiran')) {
            $lampiran['lampiran'] = $this->uploadService->upload($request->file('lampiran'), 'drafts');
        }
        if ($request->hasFile('lampiran2')) {
            $lampiran['lampiran2'] = $this->uploadService->upload($request->file('lampiran2'), 'drafts');
        }
        if ($request->hasFile('lampiran3')) {
            $lampiran['lampiran3'] = $this->uploadService->upload($request->file('lampiran3'), 'drafts');
        }

        $draft = TransaksiShadow::create([
            ...$validated,
            ...$lampiran,
            'kategori' => $request->kategori ?? 'pengeluaran',
            'status' => DraftStatus::DRAFT,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Draft berhasil dibuat.',
            'data' => new DraftResource($draft->load(['cabang', 'unit', 'user'])),
        ], 201);
    }

    public function show(TransaksiShadow $draft): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new DraftResource($draft->load(['cabang', 'unit', 'user', 'approver'])),
        ]);
    }

    public function update(Request $request, TransaksiShadow $draft): JsonResponse
    {
        if (!$draft->canEdit()) {
            return response()->json([
                'success' => false,
                'message' => 'Draft tidak dapat diedit karena status saat ini.',
            ], 422);
        }

        $validated = $request->validate([
            'tanggal' => 'sometimes|date',
            'no_bukti' => 'nullable|string|max:50',
            'keterangan' => 'sometimes|string',
            'jumlah' => 'sometimes|numeric|min:0',
            'kode_matanggaran' => 'nullable|string|max:20',
        ]);

        $draft->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Draft berhasil diperbarui.',
            'data' => new DraftResource($draft->fresh()->load(['cabang', 'unit', 'user'])),
        ]);
    }

    public function destroy(TransaksiShadow $draft): JsonResponse
    {
        if (!$draft->canEdit()) {
            return response()->json([
                'success' => false,
                'message' => 'Draft tidak dapat dihapus karena status saat ini.',
            ], 422);
        }

        // Delete lampiran files
        $this->uploadService->deleteMultiple([
            $draft->lampiran,
            $draft->lampiran2,
            $draft->lampiran3,
        ]);

        $draft->delete();

        return response()->json([
            'success' => true,
            'message' => 'Draft berhasil dihapus.',
        ]);
    }

    public function submit(TransaksiShadow $draft): JsonResponse
    {
        if (!$draft->canSubmit()) {
            return response()->json([
                'success' => false,
                'message' => 'Draft tidak dapat disubmit karena status saat ini.',
            ], 422);
        }

        $draft->update(['status' => DraftStatus::PENDING]);

        $this->notificationService->notifyDraftSubmitted($draft);

        return response()->json([
            'success' => true,
            'message' => 'Draft berhasil disubmit untuk persetujuan.',
            'data' => new DraftResource($draft->fresh()->load(['cabang', 'unit', 'user'])),
        ]);
    }

    public function approve(Request $request, TransaksiShadow $draft): JsonResponse
    {
        if (!$draft->canApprove()) {
            return response()->json([
                'success' => false,
                'message' => 'Draft tidak dapat disetujui karena status saat ini.',
            ], 422);
        }

        $validated = $request->validate([
            'catatan' => 'nullable|string',
        ]);

        DB::transaction(function () use ($draft, $request, $validated) {
            // Update draft status
            $draft->update([
                'status' => DraftStatus::APPROVED,
                'catatan_approval' => $validated['catatan'] ?? null,
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);

            // Create actual transaksi
            Transaksi::create([
                'cabang_id' => $draft->cabang_id,
                'unit_id' => $draft->unit_id,
                'tanggal' => $draft->tanggal,
                'no_bukti' => $draft->no_bukti,
                'keterangan' => $draft->keterangan,
                'kategori' => TransaksiKategori::PENGELUARAN,
                'jumlah' => $draft->jumlah,
                'kode_matanggaran' => $draft->kode_matanggaran,
                'lampiran' => $draft->lampiran,
                'lampiran2' => $draft->lampiran2,
                'lampiran3' => $draft->lampiran3,
                'user_id' => $draft->user_id,
            ]);
        });

        $this->notificationService->notifyDraftApproved($draft->fresh());

        return response()->json([
            'success' => true,
            'message' => 'Draft berhasil disetujui dan transaksi telah dibuat.',
            'data' => new DraftResource($draft->fresh()->load(['cabang', 'unit', 'user', 'approver'])),
        ]);
    }

    public function reject(Request $request, TransaksiShadow $draft): JsonResponse
    {
        if (!$draft->canApprove()) {
            return response()->json([
                'success' => false,
                'message' => 'Draft tidak dapat ditolak karena status saat ini.',
            ], 422);
        }

        $validated = $request->validate([
            'catatan' => 'nullable|string',
        ]);

        $draft->update([
            'status' => DraftStatus::REJECTED,
            'catatan_approval' => $validated['catatan'] ?? null,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        $this->notificationService->notifyDraftRejected($draft->fresh());

        return response()->json([
            'success' => true,
            'message' => 'Draft berhasil ditolak.',
            'data' => new DraftResource($draft->fresh()->load(['cabang', 'unit', 'user', 'approver'])),
        ]);
    }
}
