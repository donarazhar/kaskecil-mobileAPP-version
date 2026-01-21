<?php

namespace App\Http\Middleware;

use App\Models\Unit;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUnitAccess
{
    /**
     * Handle an incoming request.
     * Memeriksa apakah user dapat mengakses unit tertentu
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $unitId = $request->route('unit') ?? $request->input('unit_id');

        if (!$unitId) {
            return $next($request);
        }

        if (!$user->canAccessUnit((int) $unitId)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke unit ini.',
            ], 403);
        }

        return $next($request);
    }
}
