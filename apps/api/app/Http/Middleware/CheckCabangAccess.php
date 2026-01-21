<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckCabangAccess
{
    /**
     * Handle an incoming request.
     * Memeriksa apakah user dapat mengakses cabang tertentu
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $cabangId = $request->route('cabang') ?? $request->input('cabang_id');

        if (!$cabangId) {
            return $next($request);
        }

        if (!$user->canAccessCabang((int) $cabangId)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke cabang ini.',
            ], 403);
        }

        return $next($request);
    }
}
