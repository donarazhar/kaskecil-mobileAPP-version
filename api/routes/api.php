<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\Master\AkunAASController;
use App\Http\Controllers\Master\CabangController;
use App\Http\Controllers\Master\InstansiController;
use App\Http\Controllers\Master\MataAnggaranController;
use App\Http\Controllers\Master\UnitController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Transaksi\DraftController;
use App\Http\Controllers\Transaksi\PengisianController;
use App\Http\Controllers\Transaksi\TransaksiController;
use App\Http\Controllers\User\RoleController;
use App\Http\Controllers\User\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ==========================================
// Public Routes (No Auth Required)
// ==========================================
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

Route::get('/laporan/cetaklaporan', [LaporanController::class, 'cetakLaporan']);

// ==========================================
// Protected Routes (Auth Required)
// ==========================================
Route::middleware(['auth:sanctum'])->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
        Route::put('/update-profile', [AuthController::class, 'updateProfile']);
        Route::post('/fcm-token', [AuthController::class, 'updateFcmToken']);
    });

    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('/summary', [DashboardController::class, 'summary']);
        Route::get('/chart', [DashboardController::class, 'chart']);
        Route::get('/recent', [DashboardController::class, 'recent']);
        Route::get('/top-anggaran', [DashboardController::class, 'topAnggaran']);
        Route::get('/pending-approvals', [DashboardController::class, 'pendingApprovals']);
    });

    // Cabang
    Route::prefix('cabang')->group(function () {
        Route::get('/', [CabangController::class, 'index']);
        Route::post('/', [CabangController::class, 'store'])->middleware('role:super_admin');
        Route::get('/{cabang}', [CabangController::class, 'show']);
        Route::put('/{cabang}', [CabangController::class, 'update'])->middleware('role:super_admin');
        Route::delete('/{cabang}', [CabangController::class, 'destroy'])->middleware('role:super_admin');
        Route::get('/{cabang}/summary', [CabangController::class, 'summary']);
    });

    // Unit
    Route::prefix('unit')->group(function () {
        Route::get('/', [UnitController::class, 'index']);
        Route::post('/', [UnitController::class, 'store'])->middleware('role:super_admin');
        Route::get('/{unit}', [UnitController::class, 'show']);
        Route::put('/{unit}', [UnitController::class, 'update'])->middleware('role:super_admin');
        Route::delete('/{unit}', [UnitController::class, 'destroy'])->middleware('role:super_admin');
        Route::get('/{unit}/summary', [UnitController::class, 'summary']);
    });

    // Transaksi
    Route::prefix('transaksi')->group(function () {
        Route::get('/', [TransaksiController::class, 'index']);
        Route::post('/', [TransaksiController::class, 'store']);
        Route::get('/{transaksi}', [TransaksiController::class, 'show']);
        Route::put('/{transaksi}', [TransaksiController::class, 'update']);
        Route::delete('/{transaksi}', [TransaksiController::class, 'destroy']);
        Route::post('/cairkan/{shadowId}', [TransaksiController::class, 'cairkan']);
    });

    // Draft
    Route::prefix('draft')->group(function () {
        Route::get('/', [DraftController::class, 'index']);
        Route::post('/', [DraftController::class, 'store']);
        Route::get('/{draft}', [DraftController::class, 'show']);
        Route::put('/{draft}', [DraftController::class, 'update']);
        Route::delete('/{draft}', [DraftController::class, 'destroy']);
        Route::post('/{draft}/submit', [DraftController::class, 'submit']);
        Route::post('/{draft}/approve', [DraftController::class, 'approve'])
            ->middleware('role:super_admin,admin_unit');
        Route::post('/{draft}/reject', [DraftController::class, 'reject'])
            ->middleware('role:super_admin,admin_unit');
    });

    // Pengisian
    Route::prefix('pengisian')->group(function () {
        Route::get('/pending', [PengisianController::class, 'pending']);
        Route::post('/process', [PengisianController::class, 'process'])
            ->middleware('role:super_admin');
        Route::get('/history', [PengisianController::class, 'history']);
        Route::get('/{id}', [PengisianController::class, 'show']);
    });

    // Master Data
    Route::prefix('master')->group(function () {
        // Akun AAS - Admin Unit can manage their own unit's akun
        Route::prefix('akun-aas')->group(function () {
            Route::get('/', [AkunAASController::class, 'index']);
            Route::post('/', [AkunAASController::class, 'store'])->middleware('role:super_admin,admin_unit');
            Route::put('/{akunAas}', [AkunAASController::class, 'update'])->middleware('role:super_admin,admin_unit');
            Route::delete('/{akunAas}', [AkunAASController::class, 'destroy'])->middleware('role:super_admin,admin_unit');
        });

        // Mata Anggaran - Admin Unit can manage their own unit's mata anggaran
        Route::prefix('mata-anggaran')->group(function () {
            Route::get('/', [MataAnggaranController::class, 'index']);
            Route::post('/', [MataAnggaranController::class, 'store'])
                ->middleware('role:super_admin,admin_unit');
            Route::put('/{mataAnggaran}', [MataAnggaranController::class, 'update'])
                ->middleware('role:super_admin,admin_unit');
            Route::delete('/{mataAnggaran}', [MataAnggaranController::class, 'destroy'])
                ->middleware('role:super_admin,admin_unit');
        });

        // Instansi
        Route::get('/instansi', [InstansiController::class, 'show']);
        Route::put('/instansi', [InstansiController::class, 'update'])->middleware('role:super_admin');
    });

    // Users
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store'])
            ->middleware('role:super_admin');
        Route::get('/{user}', [UserController::class, 'show']);
        Route::put('/{user}', [UserController::class, 'update'])
            ->middleware('role:super_admin');
        Route::delete('/{user}', [UserController::class, 'destroy'])
            ->middleware('role:super_admin');
        Route::post('/{user}/toggle-status', [UserController::class, 'toggleStatus'])
            ->middleware('role:super_admin');
    });

    // Roles
    Route::get('/roles', [RoleController::class, 'index']);

    // Laporan
    Route::prefix('laporan')->group(function () {
        Route::get('/buku-kas', [LaporanController::class, 'bukuKas']);
        Route::get('/rekap-anggaran', [LaporanController::class, 'rekapAnggaran']);
        Route::get('/export/pdf', [LaporanController::class, 'exportPdf']);
        Route::get('/export/excel', [LaporanController::class, 'exportExcel']);
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::put('/{notification}/read', [NotificationController::class, 'read']);
        Route::put('/read-all', [NotificationController::class, 'readAll']);
        Route::delete('/{notification}', [NotificationController::class, 'destroy']);
    });
});
