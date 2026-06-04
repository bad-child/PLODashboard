<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$req = new \Illuminate\Http\Request();
$req->merge(['fund_center' => 'F34', 'filter' => 'monthly']);

$controller = app()->make(\App\Http\Controllers\DashboardController::class);
$res = $controller->getCostComposition($req);
echo json_encode($res->getData(), JSON_PRETTY_PRINT);
