<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$r = \Illuminate\Support\Facades\DB::select("SELECT name FROM HRD.sys.tables");
echo json_encode($r);
