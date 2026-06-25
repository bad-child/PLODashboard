<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Setting;

class CheckMenuPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Akses ditolak.');
        }

        // Admin always has access to everything
        if ($user->isAdmin()) {
            return $next($request);
        }

        // Check dynamic permissions
        $setting = Setting::where('key', 'role_permissions')->first();
        if ($setting && $setting->value) {
            $permissions = json_decode($setting->value, true) ?? [];
            $role = $user->role;
            
            // Permissions structure: [ 'it' => ['admin.users.index', 'admin.settings'], 'cc' => [...] ]
            if (isset($permissions[$role]) && in_array($permission, $permissions[$role])) {
                return $next($request);
            }
        }

        abort(403, 'Akses ditolak. Role Anda tidak memiliki izin untuk halaman ini.');
    }
}
