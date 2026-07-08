<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\UserLog;
use Illuminate\Support\Facades\Auth;

class LogUserActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Call the next middleware/controller first to get the response
        $response = $next($request);

        // Optionally, don't log GET requests for static assets or specific routes if needed.
        // For now, we log everything except perhaps debugbar/telescope/horizon.
        $url = $request->fullUrl();
        if (!str_contains($url, '/_debugbar') && !str_contains($url, '/build/') && !str_contains($url, '/api/dashboard/monthly-trend')) {
            try {
                UserLog::create([
                    'user_id' => Auth::id(), // returns null if not logged in
                    'method' => $request->method(),
                    'url' => substr($url, 0, 2000), // restrict length
                    'ip_address' => $request->ip(),
                    'user_agent' => substr($request->userAgent(), 0, 1000),
                    'payload' => json_encode($request->except(['password', 'password_confirmation', '_token'])),
                ]);
            } catch (\Exception $e) {
                // Silently ignore log insertion failures to not break the app
                \Log::error("Failed to write to UserLog: " . $e->getMessage());
            }
        }

        return $response;
    }
}
