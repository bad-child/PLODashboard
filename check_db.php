<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$res = \Illuminate\Support\Facades\DB::select('SELECT * FROM "TBL_M_CommitmentItem" LIMIT 1');
print_r($res);
