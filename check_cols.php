<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$res = \Illuminate\Support\Facades\DB::select("SELECT column_name FROM information_schema.columns WHERE table_name = 'TBL_T_BUDGET_DAILY'");
print_r($res);
