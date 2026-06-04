<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$controller = app()->make(\App\Http\Controllers\DashboardController::class);

$req1 = new \Illuminate\Http\Request();
$req1->merge(['filter' => 'monthly']);
$res1 = $controller->getCostComposition($req1);
echo "No filter: " . json_decode($res1->getContent())->total . "\n";

$req2 = new \Illuminate\Http\Request();
$req2->merge(['fund_center' => 'F34', 'filter' => 'monthly']);
$res2 = $controller->getCostComposition($req2);
echo "F34: " . json_decode($res2->getContent())->total . "\n";

$req3 = new \Illuminate\Http\Request();
$req3->merge(['fund_center' => 'F54', 'filter' => 'monthly']);
$res3 = $controller->getCostComposition($req3);
echo "F54: " . json_decode($res3->getContent())->total . "\n";
