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

// ─── IT Dashboard ─────────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:it'])->prefix('it')->name('it.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard/ITDashboard');
    })->name('dashboard');
});

// ─── CC Dashboard ─────────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:cc'])->prefix('cc')->name('cc.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard/CCDashboard');
    })->name('dashboard');
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
        return Inertia::render('Dashboard/UserProfile');
    })->name('dashboard.profile');
    
    // API endpoint for dashboard chart
    Route::get('/api/dashboard/budget-vs-actual', [\App\Http\Controllers\DashboardController::class, 'getBudgetVsActual'])->name('api.dashboard.budget_vs_actual');
    Route::get('/api/dashboard/commitment-items', [\App\Http\Controllers\DashboardController::class, 'getCommitmentItems'])->name('api.dashboard.commitment_items');
    Route::get('/api/dashboard/cost-composition', [\App\Http\Controllers\DashboardController::class, 'getCostComposition'])->name('api.dashboard.cost_composition');
    Route::get('/api/dashboard/kpi', [\App\Http\Controllers\DashboardController::class, 'getKpiCards'])->name('api.dashboard.kpi');
    Route::get('/api/dashboard/fund-centers', [\App\Http\Controllers\DashboardController::class, 'getFundCenters'])->name('api.dashboard.fund_centers');
    Route::get('/api/dashboard/top-variances', [\App\Http\Controllers\DashboardController::class, 'getTopVariances'])->name('api.dashboard.top_variances');
    Route::get('/api/dashboard/monthly-trend', [\App\Http\Controllers\DashboardController::class, 'getMonthlyTrend'])->name('api.dashboard.monthly_trend');
    Route::get('/api/dashboard/variance-details', [\App\Http\Controllers\DashboardController::class, 'getVarianceDetails'])->name('api.dashboard.variance_details');
});


require __DIR__.'/auth.php';
