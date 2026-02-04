<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $userRole = $user->role?->name;

        if (!$userRole) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak memiliki role.',
            ], 403);
        }

        // Super admin dapat akses semua
        if ($userRole === UserRole::SUPER_ADMIN->value) {
            return $next($request);
        }

        // Cek apakah role user ada di daftar roles yang diizinkan
        if (in_array($userRole, $roles)) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Anda tidak memiliki akses ke resource ini.',
        ], 403);
    }
}
