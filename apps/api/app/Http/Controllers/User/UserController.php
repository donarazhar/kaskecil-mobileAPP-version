<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function __construct(
        private FileUploadService $uploadService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();

        $query = User::with(['role', 'cabang', 'unit'])
            ->orderBy('nama');

        // Filter access based on role
        if (!$authUser->isSuperAdmin()) {
            $query->where('cabang_id', $authUser->cabang_id);
            if ($authUser->isAdminUnit()) {
                $query->where('unit_id', $authUser->unit_id);
            }
        }

        // Filters
        if ($request->has('cabang_id') && $authUser->isSuperAdmin()) {
            $query->where('cabang_id', $request->cabang_id);
        }
        if ($request->has('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }
        if ($request->has('role_id')) {
            $query->where('role_id', $request->role_id);
        }
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $perPage = $request->input('per_page', 15);
        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
            'cabang_id' => 'nullable|exists:cabang,id',
            'unit_id' => 'nullable|exists:unit,id',
            'telepon' => 'nullable|string|max:20',
            'foto' => 'nullable|file|max:2048|mimes:jpg,jpeg,png',
        ]);

        $userData = [
            'nama' => $validated['nama'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'cabang_id' => $validated['cabang_id'] ?? null,
            'unit_id' => $validated['unit_id'] ?? null,
            'telepon' => $validated['telepon'] ?? null,
            'is_active' => true,
        ];

        if ($request->hasFile('foto')) {
            $userData['foto'] = $this->uploadService->upload($request->file('foto'), 'users');
        }

        $user = User::create($userData);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dibuat.',
            'data' => new UserResource($user->load(['role', 'cabang', 'unit'])),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new UserResource($user->load(['role', 'cabang', 'unit'])),
        ]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'role_id' => 'sometimes|exists:roles,id',
            'cabang_id' => 'nullable|exists:cabang,id',
            'unit_id' => 'nullable|exists:unit,id',
            'telepon' => 'nullable|string|max:20',
            'is_active' => 'sometimes|boolean',
            'foto' => 'nullable|file|max:2048|mimes:jpg,jpeg,png',
        ]);

        $updateData = collect($validated)->except(['password', 'foto'])->toArray();

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        if ($request->hasFile('foto')) {
            if ($user->foto) {
                $this->uploadService->delete($user->foto);
            }
            $updateData['foto'] = $this->uploadService->upload($request->file('foto'), 'users');
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil diperbarui.',
            'data' => new UserResource($user->fresh()->load(['role', 'cabang', 'unit'])),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Super Admin user cannot be deleted.',
            ], 403);
        }

        if ($user->foto) {
            $this->uploadService->delete($user->foto);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus.',
        ]);
    }

    public function toggleStatus(User $user): JsonResponse
    {
        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'success' => true,
            'message' => $user->is_active ? 'User diaktifkan.' : 'User dinonaktifkan.',
            'data' => new UserResource($user->fresh()->load(['role', 'cabang', 'unit'])),
        ]);
    }
}
