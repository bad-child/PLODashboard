<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $theme = \Illuminate\Support\Facades\Cache::remember('theme_mode', 60, function () {
            $setting = \App\Models\Setting::where('key', 'theme_mode')->first();
            return $setting ? $setting->value : 'dark';
        });
        
        $rolePermissions = \Illuminate\Support\Facades\Cache::remember('role_permissions', 60, function () {
            $setting = \App\Models\Setting::where('key', 'role_permissions')->first();
            return $setting && $setting->value ? json_decode($setting->value, true) : [];
        });

        // Determine user permissions for frontend
        $userPermissions = [];
        $user = $request->user();
        if ($user) {
            if ($user->isAdmin()) {
                // Admin implicitly has all configured permissions
                $userPermissions = array_keys(\App\Models\User::getAvailableFeatures());
            } else {
                $userPermissions = $rolePermissions[$user->role] ?? [];
            }
        }
        
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'permissions' => $userPermissions,
            ],
            'theme' => $theme,
        ];
    }
}
