<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request2 = Illuminate\Http\Request::create('/api/dashboard/monthly_trend', 'GET', [
    'filter' => 'monthly',
    'year_start' => '2026',
    'year_end' => '2026',
    'month_start' => 'Januari',
    'month_end' => 'Mei',
    'day_start' => '01',
    'day_end' => '10',
    'fund_center' => '',
]);
$controller = new App\Http\Controllers\DashboardController();
echo "TREND BROWSER EXACT:\n";
echo json_encode($controller->getMonthlyTrend($request2)->getData());

echo "BUDGET BULAN:\n";
echo json_encode(Illuminate\Support\Facades\DB::select("SELECT DISTINCT Bulan, LEN(Bulan) as len FROM TBL_TEMP_PARENT_BUDGET"));
