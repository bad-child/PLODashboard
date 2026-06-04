<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$req = new \Illuminate\Http\Request();
$req->merge(['fund_center' => 'F34', 'filter' => 'monthly']);

$controller = app()->make(\App\Http\Controllers\DashboardController::class);

$reflection = new \ReflectionClass(\App\Http\Controllers\DashboardController::class);
$method = $reflection->getMethod('applyRangeFilters');
$method->setAccessible(true);

$query = \Illuminate\Support\Facades\DB::table('TBL_T_ACTUAL_DAILY');
$query = $method->invoke($controller, $query, 'monthly', $req);

echo $query->toSql() . "\n";
echo json_encode($query->getBindings()) . "\n";
