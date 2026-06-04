<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$req = new \Illuminate\Http\Request();
$ctrl = new \App\Http\Controllers\DashboardController();
print_r(json_decode($ctrl->getCostComposition($req)->getContent(), true));
