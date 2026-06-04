<?php

namespace App\Providers;

use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Redirect authenticated users (guest middleware) to their role-based dashboard
        RedirectIfAuthenticated::redirectUsing(function ($request) {
            $user = Auth::user();

            if ($user) {
                return route($user->getDashboardRoute());
            }

            return '/';
        });
    }
}
