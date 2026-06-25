<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NoTimeLimit
{
    /**
     * Remove PHP execution time limit for dashboard routes
     * so heavy SQL Server queries and slow connections don't timeout.
     */
    public function handle(Request $request, Closure $next): Response
    {
        set_time_limit(0);
        ini_set('max_execution_time', '0');

        return $next($request);
    }
}
