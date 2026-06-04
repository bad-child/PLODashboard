<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$res = \Illuminate\Support\Facades\DB::table('TBL_T_ACTUAL_DAILY')->select(\Illuminate\Support\Facades\DB::raw('SUBSTRING("FundCenter", 1, 3) as fc'))->distinct()->pluck('fc');
dump($res);
