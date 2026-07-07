<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        $privacyPolicySetting = \App\Models\Setting::where('key', 'privacy_policy')->first();
        
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'privacyPolicy' => $privacyPolicySetting ? $privacyPolicySetting->value : null,
        ]);
    }

    /**
     * Handle an incoming authentication request.
     * Redirect to role-based dashboard after login.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = Auth::user();
        
        // Record login activity
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
            'last_login_device' => $request->userAgent(),
        ]);

        $dashboardRoute = $user->getDashboardRoute();

        return redirect()->intended(route($dashboardRoute, absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
