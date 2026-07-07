<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect root to login
Route::get('/', function () {
    return redirect()->route('login');
});

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard/AdminDashboard');
    })->name('dashboard');
});

// ─── Manajemen Pengguna (Protected by Permission) ─────────────────────────────
Route::middleware(['auth', 'permission:admin.users.index'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/users', function () {
        return app(\App\Http\Controllers\AdminUserController::class)->index();
    })->name('users.index');
    Route::get('/users/search-karyawan', [\App\Http\Controllers\AdminUserController::class, 'searchKaryawan'])->name('users.search_karyawan');
    Route::post('/users', [\App\Http\Controllers\AdminUserController::class, 'store'])->name('users.store');
    Route::delete('/users/{user}', [\App\Http\Controllers\AdminUserController::class, 'destroy'])->name('users.destroy');
    Route::post('/users/{user}/reset-password', [\App\Http\Controllers\AdminUserController::class, 'resetPassword'])->name('users.reset_password');
});

// ─── Pengaturan Sistem (Protected by Permission) ──────────────────────────────
Route::middleware(['auth', 'permission:admin.settings'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/settings', function () {
        $setting = \App\Models\Setting::where('key', 'running_text')->first();
        $themeSetting = \App\Models\Setting::where('key', 'theme_mode')->first();
        $permissionsSetting = \App\Models\Setting::where('key', 'role_permissions')->first();
        return Inertia::render('Admin/Settings', [
            'runningText' => $setting ? $setting->value : '',
            'themeMode' => $themeSetting ? $themeSetting->value : 'dark',
            'rolePermissions' => $permissionsSetting && $permissionsSetting->value ? json_decode($permissionsSetting->value, true) : [],
            'customRoles' => \App\Models\User::getCustomRoles(),
            'availableRoles' => \App\Models\User::getAvailableRoles(),
            'customFeatures' => \App\Models\User::getCustomFeatures(),
            'availableFeatures' => \App\Models\User::getAvailableFeatures(),
            'appFeaturesDictionary' => \App\Models\User::getAppFeaturesDictionary()
        ]);
    })->name('settings');
    Route::post('/settings/running-text', [\App\Http\Controllers\AdminUserController::class, 'updateRunningText'])->name('settings.running_text.update');
    Route::post('/settings/theme', [\App\Http\Controllers\AdminUserController::class, 'updateTheme'])->name('settings.theme.update');
    Route::post('/settings/permissions', [\App\Http\Controllers\AdminUserController::class, 'updateMenuPermissions'])->name('settings.permissions.update');
    Route::post('/settings/roles', [\App\Http\Controllers\AdminUserController::class, 'storeRole'])->name('settings.roles.store');
    Route::delete('/settings/roles/{role}', [\App\Http\Controllers\AdminUserController::class, 'destroyRole'])->name('settings.roles.destroy');
    Route::post('/settings/features', [\App\Http\Controllers\AdminUserController::class, 'storeFeature'])->name('settings.features.store');
    Route::delete('/settings/features/{feature}', [\App\Http\Controllers\AdminUserController::class, 'destroyFeature'])->name('settings.features.destroy');
});



// ─── User Dashboard ───────────────────────────────────────────────────────────
Route::middleware(['auth'])->prefix('user')->name('user.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard/UserDashboard');
    })->name('dashboard');
});

// ─── Profile (all authenticated) ─────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Custom Dashboard Profile Page
    Route::get('/dashboard/profile', function () {
        $user = auth()->user();
        
        $hrdInfo = null;
        if ($user && $user->nik) {
            try {
                $hrdInfo = \Illuminate\Support\Facades\DB::connection('sqlsrv_second')->table('TKaryawan as k')
                    ->leftJoin('TJabatan as j', 'k.KodeJB', '=', 'j.KodeJB')
                    ->leftJoin('tdepartement as d', 'k.KodeDP', '=', 'd.KodeDP')
                    ->where('k.NIK', $user->nik)
                    ->where('k.aktif', 0)
                    ->select('j.Nama as jabatan', 'd.Nama as departemen')
                    ->first();
            } catch (\Exception $e) {
                // Ignore DB error
            }
        }

        return Inertia::render('Dashboard/UserProfile', [
            'jabatan' => $hrdInfo ? $hrdInfo->jabatan : '-',
            'departemen' => $hrdInfo ? $hrdInfo->departemen : '-',
        ]);
    })->name('dashboard.profile');
    Route::post('/dashboard/profile/avatar', [\App\Http\Controllers\DashboardProfileController::class, 'updateAvatar'])->name('dashboard.profile.avatar');
    Route::post('/dashboard/profile/password', [\App\Http\Controllers\DashboardProfileController::class, 'updatePassword'])->name('dashboard.profile.password');
    Route::patch('/dashboard/profile/info', [\App\Http\Controllers\DashboardProfileController::class, 'updateInfo'])->name('dashboard.profile.info');
    
    // API endpoint for dashboard chart
    Route::get('/api/dashboard/budget-vs-actual', [\App\Http\Controllers\DashboardController::class, 'getBudgetVsActual'])->name('api.dashboard.budget_vs_actual');
    Route::get('/api/dashboard/commitment-items', [\App\Http\Controllers\DashboardController::class, 'getCommitmentItems'])->name('api.dashboard.commitment_items');
    Route::get('/api/dashboard/cost-composition', [\App\Http\Controllers\DashboardController::class, 'getCostComposition'])->name('api.dashboard.cost_composition');
    Route::get('/api/dashboard/kpi', [\App\Http\Controllers\DashboardController::class, 'getKpiCards'])->name('api.dashboard.kpi');
    Route::get('/api/settings/running-text', [\App\Http\Controllers\DashboardController::class, 'getRunningText'])->name('api.settings.running_text');
    Route::get('/api/dashboard/fund-centers', [\App\Http\Controllers\DashboardController::class, 'getFundCenters'])->name('api.dashboard.fund_centers');
    Route::get('/api/dashboard/top-variances', [\App\Http\Controllers\DashboardController::class, 'getTopVariances'])->name('api.dashboard.top_variances');
    Route::get('/api/dashboard/summary-table', [\App\Http\Controllers\DashboardController::class, 'getSummaryTable'])->name('api.dashboard.summary_table');
    Route::get('/api/dashboard/monthly-trend', [\App\Http\Controllers\DashboardController::class, 'getMonthlyTrend'])->name('api.dashboard.monthly_trend');
    Route::get('/api/dashboard/variance-details', [\App\Http\Controllers\DashboardController::class, 'getVarianceDetails'])->name('api.dashboard.variance_details');
    Route::get('/api/dashboard/clear-cache', [\App\Http\Controllers\DashboardController::class, 'clearCache'])->name('api.dashboard.clear_cache');
});

// Setup utility route for cPanel / aaPanel users
Route::get('/setup/storage-link', function () {
    \Illuminate\Support\Facades\Artisan::call('storage:link');
    return 'Storage Linked Successfully! You can close this page.';
});


require __DIR__.'/auth.php';
