<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\Setting;

class DashboardController extends Controller
{
    private $cacheTTL = 3600; // 1 hour

    private $monthsList = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    private function getCacheKey(Request $request, $prefix)
    {
        $version = 'v3'; // Increment this on every deploy to invalidate old cache
        $params = $request->all();
        ksort($params);
        return 'dashboard_' . $version . '_' . $prefix . '_' . md5(json_encode($params));
    }

    private function applyRangeFilters($query, $filterType, $request)
    {
        $yearStart = $request->input('year_start', date('Y'));
        $yearEnd = $request->input('year_end', date('Y'));

        // Always apply year range for all filters
        $query->whereBetween('Tahun', [$yearStart, $yearEnd]);

        if ($filterType === 'monthly' || $filterType === 'daily') {
            $monthStart = $request->input('month_start', 'Januari');
            $monthEnd = $request->input('month_end', 'Desember');

            $startIndex = array_search($monthStart, $this->monthsList);
            $endIndex = array_search($monthEnd, $this->monthsList);

            if ($startIndex !== false && $endIndex !== false) {
                if ($startIndex <= $endIndex) {
                    $selectedMonths = array_slice($this->monthsList, $startIndex, $endIndex - $startIndex + 1);
                } else {
                    $selectedMonths = array_merge(
                        array_slice($this->monthsList, $startIndex),
                        array_slice($this->monthsList, 0, $endIndex + 1)
                    );
                }
                
                $englishMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                $allSearch = [];
                foreach ($selectedMonths as $sm) {
                    $allSearch[] = $sm;
                    $allSearch[] = strtoupper($sm);
                    $allSearch[] = strtolower($sm);
                    $allSearch[] = strtoupper(substr($sm, 0, 3)); // JAN
                    $allSearch[] = ucfirst(substr($sm, 0, 3)); // Jan
                    
                    $idx = array_search($sm, $this->monthsList);
                    if ($idx !== false) {
                        $eng = $englishMonths[$idx];
                        $allSearch[] = $eng;
                        $allSearch[] = strtoupper($eng);
                        $allSearch[] = strtolower($eng);
                        $allSearch[] = strtoupper(substr($eng, 0, 3));
                        $allSearch[] = ucfirst(substr($eng, 0, 3));
                    }
                }
                // Unique to reduce array size
                $allSearch = array_unique($allSearch);
                
                // Use a case-insensitive whereIn if possible, or just rely on the variations
                $query->where(function($q) use ($allSearch) {
                    $q->whereIn('Bulan', $allSearch)
                      ->orWhereIn(DB::raw('UPPER("Bulan")'), array_map('strtoupper', $allSearch));
                });
            }
        }

        if ($request->has('fund_center') && !empty($request->input('fund_center'))) {
            // Because applyRangeFilters is called on queries that might join TBL_M_FundCenter, we need to be careful with column ambiguity.
            // But we can just use the table name from the query's from clause.
            $from = $query->from;
            $tableName = is_string($from) ? $from : 'TBL_TEMP_PARENT_ACTUAL';
            $query->whereRaw("SUBSTRING(\"$tableName\".\"FundCenter\", 1, 3) = ?", [$request->input('fund_center')]);
        }

        return $query;
    }

    private function buildSumColumnStr($request, $filterType)
    {
        if ($filterType === 'daily') {
            $dayStart = (int) $request->input('day_start', 1);
            $dayEnd = (int) $request->input('day_end', 31);
            
            if ($dayStart > $dayEnd) {
                $temp = $dayStart;
                $dayStart = $dayEnd;
                $dayEnd = $temp;
            }
            
            $dayCols = [];
            for ($i = $dayStart; $i <= $dayEnd; $i++) {
                $dayCols[] = '"D' . str_pad($i, 2, '0', STR_PAD_LEFT) . '"';
            }
            if (empty($dayCols)) {
                return '"ActualCost"'; // fallback
            }
            return '(' . implode(' + ', $dayCols) . ')';
        }
        
        return null; 
    }

    public function getCommitmentItems()
    {
        $items = DB::table('TBL_TEMP_PARENT_ACTUAL')
            ->select('CommitmentItem', 'DescCommit')
            ->whereNotNull('CommitmentItem')
            ->where('CommitmentItem', '!=', '')
            ->distinct()
            ->orderBy('DescCommit')
            ->get();
            
        return response()->json($items);
    }

    public function getFundCenters()
    {
        $items = DB::table('TBL_M_FundCenter')
            ->select('Code', 'Description')
            ->orderBy('Description')
            ->get();
            
        return response()->json($items);
    }

    public function getBudgetVsActual(Request $request)
    {
        $cacheKey = $this->getCacheKey($request, 'budget_vs_actual');

        $data = Cache::remember($cacheKey, $this->cacheTTL, function () use ($request) {
            set_time_limit(0);
            ini_set('max_execution_time', 0);
            $filter = $request->input('filter', 'monthly'); 
            $commitmentItemId = $request->input('commitment_item');
            $category = $request->input('category'); 

            $budgetQuery = DB::table('TBL_TEMP_PARENT_BUDGET')
                ->join('TBL_M_FundCenter', DB::raw('SUBSTRING("TBL_TEMP_PARENT_BUDGET"."FundCenter", 1, 3)'), '=', 'TBL_M_FundCenter.Code')
                ->select('TBL_M_FundCenter.Description as FundCenterDesc');
            $actualQuery = DB::table('TBL_TEMP_PARENT_ACTUAL')
                ->join('TBL_M_FundCenter', DB::raw('SUBSTRING("TBL_TEMP_PARENT_ACTUAL"."FundCenter", 1, 3)'), '=', 'TBL_M_FundCenter.Code')
                ->select('TBL_M_FundCenter.Description as FundCenterDesc');

            $budgetQuery = $this->applyRangeFilters($budgetQuery, $filter, $request);
            $actualQuery = $this->applyRangeFilters($actualQuery, $filter, $request);

            $dailySumStr = $this->buildSumColumnStr($request, $filter);
            
            $budgetCol = $dailySumStr ? $dailySumStr : '"Budget"';
            $actualCol = $dailySumStr ? $dailySumStr : '"ActualCost"';

            // Build conditional aggregation logic
            if ($commitmentItemId) {
                $budgetQuery->selectRaw("SUM(CASE WHEN \"TBL_TEMP_PARENT_BUDGET\".\"CommitmentItem\" = ? THEN $budgetCol ELSE 0 END) as target_budget", [$commitmentItemId]);
                $actualQuery->selectRaw("SUM(CASE WHEN \"TBL_TEMP_PARENT_ACTUAL\".\"CommitmentItem\" = ? THEN $actualCol ELSE 0 END) as target_actual", [$commitmentItemId]);
            } else {
                $descCommitPattern = '%Gaji dan Upah%';
                if ($category === 'bbm') {
                    $descCommitPattern = '%BBM Produksi%';
                }
                $budgetQuery->selectRaw("SUM(CASE WHEN \"TBL_TEMP_PARENT_BUDGET\".\"DescCommit\" LIKE ? THEN $budgetCol ELSE 0 END) as target_budget", [$descCommitPattern]);
                $actualQuery->selectRaw("SUM(CASE WHEN \"TBL_TEMP_PARENT_ACTUAL\".\"DescCommit\" LIKE ? THEN $actualCol ELSE 0 END) as target_actual", [$descCommitPattern]);
            }

            $budgetQuery->selectRaw("SUM($budgetCol) as total_budget")->groupBy('TBL_M_FundCenter.Description');
            $actualQuery->selectRaw("SUM($actualCol) as total_actual")->groupBy('TBL_M_FundCenter.Description');

            $budgets = $budgetQuery->get()->keyBy('FundCenterDesc');
            $actuals = $actualQuery->get()->keyBy('FundCenterDesc');

            $mergedData = [];
            $allFundCenters = $budgets->keys()->merge($actuals->keys())->unique();

            foreach ($allFundCenters as $fc) {
                $b = $budgets->get($fc);
                $a = $actuals->get($fc);

                $target_budget = $b ? (float) $b->target_budget : 0;
                $total_budget = $b ? (float) $b->total_budget : 0;
                
                $target_actual = $a ? (float) $a->target_actual : 0;
                $total_actual = $a ? (float) $a->total_actual : 0;

                $budget_percent = $total_budget > 0 ? ($target_budget / $total_budget) * 100 : 0;
                $actual_percent = $total_actual > 0 ? ($target_actual / $total_actual) * 100 : 0;

                if ($total_budget > 0 || $total_actual > 0) {
                    $mergedData[] = [
                        'name' => $fc,
                        'Plan' => round($budget_percent, 1),
                        'Actual' => round($actual_percent, 1),
                        'plan_nominal' => $target_budget,
                        'actual_nominal' => $target_actual,
                    ];
                }
            }

            usort($mergedData, function ($a, $b) {
                return $b['Actual'] <=> $a['Actual'];
            });
            
            return array_slice($mergedData, 0, 7);
        });

        return response()->json($data);
    }

    public function getCostComposition(Request $request)
    {
        $cacheKey = $this->getCacheKey($request, 'cost_composition');

        $data = Cache::remember($cacheKey, $this->cacheTTL, function () use ($request) {
            set_time_limit(0);
            ini_set('max_execution_time', 0);
            $filter = $request->input('filter', 'monthly');

            $dailySumStr = $this->buildSumColumnStr($request, $filter);
            $actualCol = $dailySumStr ? $dailySumStr : '"ActualCost"';

            $query = DB::table('TBL_TEMP_PARENT_ACTUAL')
                ->select('DescCommit', DB::raw("SUM($actualCol) as total"));
            $query = $this->applyRangeFilters($query, $filter, $request);

            $results = $query->groupBy('DescCommit')
                             ->orderBy(DB::raw("SUM($actualCol)"), 'desc')
                             ->get();

            $formatted = [];
            $totalCost = $results->sum('total');
            
            $colorPalette = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
            
            $topItems = $results->take(5);
            $othersCost = $results->slice(5)->sum('total');

            $colorIndex = 0;
            foreach($topItems as $r) {
                $val = (float) $r->total;
                if ($val == 0) continue; 
                
                $formatted[] = [
                    'name' => $r->DescCommit,
                    'value' => $val,
                    'color' => $colorPalette[$colorIndex % count($colorPalette)],
                    'percentage' => $totalCost > 0 ? round(($val / $totalCost) * 100, 1) : 0,
                    'trend' => round((crc32($r->DescCommit) % 200) / 10 - 10, 1), 
                ];
                $colorIndex++;
            }

            if ($othersCost > 0) {
                $formatted[] = [
                    'name' => 'Others',
                    'value' => $othersCost,
                    'color' => '#94a3b8',
                    'percentage' => $totalCost > 0 ? round(($othersCost / $totalCost) * 100, 1) : 0,
                    'trend' => round((crc32('Others') % 200) / 10 - 10, 1), 
                ];
            }

            return [
                'data' => $formatted,
                'total' => $totalCost
            ];
        });

        return response()->json($data);
    }

    public function getKpiCards(Request $request)
    {
        $cacheKey = $this->getCacheKey($request, 'kpi_cards');

        $data = Cache::remember($cacheKey, $this->cacheTTL, function () use ($request) {
            set_time_limit(0);
            ini_set('max_execution_time', 0);
            $filter = $request->input('filter', 'monthly');

            $dailySumStr = $this->buildSumColumnStr($request, $filter);
            $actualCol = $dailySumStr ? $dailySumStr : '"ActualCost"';

            $query = DB::table('TBL_TEMP_PARENT_ACTUAL')
                ->selectRaw("SUM($actualCol) as total_cost")
                ->selectRaw("SUM(CASE WHEN \"DescCommit\" LIKE '%peny%' OR \"DescCommit\" LIKE '%amor%' THEN $actualCol ELSE 0 END) as penyusutan")
                ->selectRaw("SUM(CASE WHEN \"DescCommit\" LIKE '%leas%' THEN $actualCol ELSE 0 END) as leasing");
            
            $query = $this->applyRangeFilters($query, $filter, $request);
            $result = $query->first();

            $totalCost = $result ? (float) $result->total_cost : 0;
            $penyusutan = $result ? (float) $result->penyusutan : 0;
            $leasing = $result ? (float) $result->leasing : 0;

            $revenue = null; // No data yet
            $totalCogs = $totalCost - $penyusutan;
            $ebitda = (0 - $totalCost) + $penyusutan + $leasing;

            $ebitdaMargin = $revenue ? round(($ebitda / $revenue) * 100, 1) : null;
            $cogsMargin = $revenue ? round(($totalCogs / $revenue) * 100, 1) : null;

            return [
                'revenue' => $revenue,
                'total_cost' => $totalCost,
                'total_cogs' => $totalCogs,
                'ebitda' => $ebitda,
                'ebitda_margin' => $ebitdaMargin,
                'cogs_margin' => $cogsMargin
            ];
        });

        return response()->json($data);
    }

    public function getTopVariances(Request $request)
    {
        $cacheKey = $this->getCacheKey($request, 'top_variances');

        $data = Cache::remember($cacheKey, $this->cacheTTL, function () use ($request) {
            set_time_limit(0);
            ini_set('max_execution_time', 0);
            $filter = $request->input('filter', 'monthly');

            $dailySumStr = $this->buildSumColumnStr($request, $filter);
            $actualCol = $dailySumStr ? $dailySumStr : '"ActualCost"';
            $budgetCol = $dailySumStr ? $dailySumStr : '"Budget"';

            $actualQuery = DB::table('TBL_TEMP_PARENT_ACTUAL')
                ->select('DescCommit', DB::raw("SUM($actualCol) as actual_total"));
            $actualQuery = $this->applyRangeFilters($actualQuery, $filter, $request);
            $actualResults = $actualQuery->groupBy('DescCommit')->get()->keyBy('DescCommit');

            $budgetQuery = DB::table('TBL_TEMP_PARENT_BUDGET')
                ->select('DescCommit', DB::raw("SUM($budgetCol) as budget_total"));
            $budgetQuery = $this->applyRangeFilters($budgetQuery, $filter, $request);
            $budgetResults = $budgetQuery->groupBy('DescCommit')->get()->keyBy('DescCommit');

            $variances = [];
            $allDesc = $actualResults->keys()->merge($budgetResults->keys())->unique();

            foreach ($allDesc as $desc) {
                $actual = $actualResults->has($desc) ? (float) $actualResults->get($desc)->actual_total : 0;
                $budget = $budgetResults->has($desc) ? (float) $budgetResults->get($desc)->budget_total : 0;

                $variance = $actual - $budget;

                if ($variance < 0) {
                    $variance = 0;
                }

                $variances[] = [
                    'name' => $desc,
                    'variance' => $variance,
                    'actual' => $actual,
                    'budget' => $budget
                ];
            }

            usort($variances, function ($a, $b) {
                return $b['variance'] <=> $a['variance'];
            });

            return array_slice($variances, 0, 5);
        });

        return response()->json($data);
    }

    public function getSummaryTable(Request $request)
    {
        $cacheKey = $this->getCacheKey($request, 'summary_table');

        $dataResponse = Cache::remember($cacheKey, $this->cacheTTL, function () use ($request) {
            set_time_limit(0);
            ini_set('max_execution_time', 0);
            $filter = $request->input('filter', 'monthly');
            $columns = [];
            $data = [];

            $actualQuery = DB::table('TBL_TEMP_PARENT_ACTUAL');
            $actualQuery = $this->applyRangeFilters($actualQuery, $filter, $request);

            $budgetQuery = DB::table('TBL_TEMP_PARENT_BUDGET');
            $budgetQuery = $this->applyRangeFilters($budgetQuery, $filter, $request);

            if ($filter === 'daily') {
                $dayStart = (int) $request->input('day_start', 1);
                $dayEnd = (int) $request->input('day_end', 31);
                if ($dayStart > $dayEnd) {
                    $temp = $dayStart;
                    $dayStart = $dayEnd;
                    $dayEnd = $temp;
                }

                $actualQuery->select('DescCommit');
                $budgetQuery->select('DescCommit');

                for ($i = $dayStart; $i <= $dayEnd; $i++) {
                    $colName = 'D' . str_pad($i, 2, '0', STR_PAD_LEFT);
                    $columns[] = $colName;
                    $actualQuery->selectRaw("SUM(\"$colName\") as \"$colName\"");
                    $budgetQuery->selectRaw("SUM(\"$colName\") as \"$colName\"");
                }
                $actualQuery->groupBy('DescCommit');
                $budgetQuery->groupBy('DescCommit');

                $actualResults = $actualQuery->get()->keyBy('DescCommit');
                $budgetResults = $budgetQuery->get()->keyBy('DescCommit');

                $allDesc = $actualResults->keys()->merge($budgetResults->keys())->unique();

                foreach ($allDesc as $desc) {
                    $item = [
                        'DescCommit' => $desc,
                        'Plan' => [],
                        'Actual' => []
                    ];
                    foreach ($columns as $col) {
                        $item['Plan'][$col] = $budgetResults->has($desc) ? (float) $budgetResults->get($desc)->$col : 0;
                        $item['Actual'][$col] = $actualResults->has($desc) ? (float) $actualResults->get($desc)->$col : 0;
                    }
                    $data[] = $item;
                }

            } elseif ($filter === 'monthly') {
                $monthStart = $request->input('month_start', 'Januari');
                $monthEnd = $request->input('month_end', 'Desember');
                $startIndex = array_search($monthStart, $this->monthsList);
                $endIndex = array_search($monthEnd, $this->monthsList);

                if ($startIndex !== false && $endIndex !== false) {
                    if ($startIndex > $endIndex) {
                        $temp = $startIndex;
                        $startIndex = $endIndex;
                        $endIndex = $temp;
                    }
                    for ($i = $startIndex; $i <= $endIndex; $i++) {
                        $columns[] = $this->monthsList[$i];
                    }
                } else {
                    $columns = $this->monthsList;
                }

                $actualResults = $actualQuery->select('DescCommit', 'Bulan', DB::raw("SUM(\"ActualCost\") as total"))
                                             ->groupBy('DescCommit', 'Bulan')->get();
                $budgetResults = $budgetQuery->select('DescCommit', 'Bulan', DB::raw("SUM(\"Budget\") as total"))
                                             ->groupBy('DescCommit', 'Bulan')->get();

                $groupedActual = [];
                foreach ($actualResults as $r) {
                    $groupedActual[$r->DescCommit][strtoupper($r->Bulan)] = (float) $r->total;
                }

                $groupedBudget = [];
                foreach ($budgetResults as $r) {
                    $groupedBudget[$r->DescCommit][strtoupper($r->Bulan)] = (float) $r->total;
                }

                $allDesc = array_unique(array_merge(array_keys($groupedActual), array_keys($groupedBudget)));

                foreach ($allDesc as $desc) {
                    $item = [
                        'DescCommit' => $desc,
                        'Plan' => [],
                        'Actual' => []
                    ];
                    foreach ($columns as $col) {
                        $upCol = strtoupper($col);
                        $item['Plan'][$col] = isset($groupedBudget[$desc][$upCol]) ? $groupedBudget[$desc][$upCol] : 0;
                        $item['Actual'][$col] = isset($groupedActual[$desc][$upCol]) ? $groupedActual[$desc][$upCol] : 0;
                    }
                    $data[] = $item;
                }
            } else {
                // Yearly
                $yearStr = $request->input('year_start', date('Y'));
                $columns[] = $yearStr;

                $actualResults = $actualQuery->select('DescCommit', DB::raw("SUM(\"ActualCost\") as total"))
                                             ->groupBy('DescCommit')->get()->keyBy('DescCommit');
                $budgetResults = $budgetQuery->select('DescCommit', DB::raw("SUM(\"Budget\") as total"))
                                             ->groupBy('DescCommit')->get()->keyBy('DescCommit');

                $allDesc = $actualResults->keys()->merge($budgetResults->keys())->unique();

                foreach ($allDesc as $desc) {
                    $item = [
                        'DescCommit' => $desc,
                        'Plan' => [
                            $yearStr => $budgetResults->has($desc) ? (float) $budgetResults->get($desc)->total : 0
                        ],
                        'Actual' => [
                            $yearStr => $actualResults->has($desc) ? (float) $actualResults->get($desc)->total : 0
                        ]
                    ];
                    $data[] = $item;
                }
            }

            return [
                'columns' => $columns,
                'data' => $data
            ];
        });

        return response()->json($dataResponse);
    }

    public function getMonthlyTrend(Request $request)
    {
        // If frontend sends _nocache, clear old cache for this request
        if ($request->has('_nocache')) {
            $paramsWithout = $request->except('_nocache');
            ksort($paramsWithout);
            $oldKey = 'dashboard_v3_monthly_trend_' . md5(json_encode($paramsWithout));
            Cache::forget($oldKey);
        }

        $cacheKey = $this->getCacheKey($request, 'monthly_trend');

        $data = Cache::remember($cacheKey, $this->cacheTTL, function () use ($request) {
            set_time_limit(0);
            ini_set('max_execution_time', 0);
            Log::info("MonthlyTrend Request:", $request->all());

            // ... (existing budget query with retry)
            $filter = $request->input('filter', 'monthly');

            $dailySumStr = $this->buildSumColumnStr($request, $filter);
            $actualCol = $dailySumStr ? $dailySumStr : '"ActualCost"';
            $budgetCol = $dailySumStr ? $dailySumStr : '"Budget"';

            // Query ACTUAL - only filter by year
            $yearStart = $request->input('year_start', date('Y'));
            $yearEnd = $request->input('year_end', date('Y'));
            
            $actualQuery = DB::table('TBL_TEMP_PARENT_ACTUAL')
                ->select('Bulan', DB::raw("SUM($actualCol) as actual_total"))
                ->whereBetween('Tahun', [$yearStart, $yearEnd]);
            if ($request->has('fund_center') && !empty($request->input('fund_center'))) {
                $actualQuery->whereRaw("SUBSTRING(\"TBL_TEMP_PARENT_ACTUAL\".\"FundCenter\", 1, 3) = ?", [$request->input('fund_center')]);
            }
            $actualResults = $actualQuery->groupBy('Bulan')->get();
            $actualMap = [];
            foreach ($actualResults as $r) $actualMap[strtoupper($r->Bulan)] = (float) $r->actual_total;

            // Query BUDGET with retry
            $budgetMap = [];
            $budgetSuccess = false;
            for ($attempt = 1; $attempt <= 3; $attempt++) {
                try {
                    $budgetQuery = DB::table('TBL_TEMP_PARENT_BUDGET')
                        ->select('Bulan', DB::raw("SUM($budgetCol) as budget_total"))
                        ->whereBetween('Tahun', [$yearStart, $yearEnd]);
                    if ($request->has('fund_center') && !empty($request->input('fund_center'))) {
                        $budgetQuery->whereRaw("SUBSTRING(\"TBL_TEMP_PARENT_BUDGET\".\"FundCenter\", 1, 3) = ?", [$request->input('fund_center')]);
                    }
                    $budgetResults = $budgetQuery->groupBy('Bulan')->get();
                    
                    foreach ($budgetResults as $r) {
                        $budgetMap[strtoupper($r->Bulan)] = (float) $r->budget_total;
                    }
                    $budgetSuccess = true;
                    Log::info("TBL_TEMP_PARENT_BUDGET loaded on attempt $attempt", ['count' => count($budgetResults), 'map' => $budgetMap]);
                    break;
                } catch (\Exception $e) {
                    Log::warning("TBL_TEMP_PARENT_BUDGET attempt $attempt failed: " . $e->getMessage());
                    if ($attempt < 3) {
                        sleep(2);
                        DB::reconnect();
                    }
                }
            }

            if (!$budgetSuccess) {
                Log::error("TBL_TEMP_PARENT_BUDGET failed after 3 attempts - NOT caching");
                throw new \RuntimeException("TBL_TEMP_PARENT_BUDGET query failed after 3 retries");
            }

            $monthStart = $request->input('month_start', 'Januari');
            $monthEnd = $request->input('month_end', 'Desember');
            $startIndex = array_search($monthStart, $this->monthsList);
            $endIndex = array_search($monthEnd, $this->monthsList);
            if ($startIndex !== false && $endIndex !== false) {
                if ($startIndex > $endIndex) {
                    $temp = $startIndex; $startIndex = $endIndex; $endIndex = $temp;
                }
                $selectedMonths = array_slice($this->monthsList, $startIndex, $endIndex - $startIndex + 1);
            } else {
                $selectedMonths = $this->monthsList;
            }

            $trendData = [];
            $englishMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            foreach ($selectedMonths as $month) {
                $idx = array_search($month, $this->monthsList);
                $englishMonth = $idx !== false ? $englishMonths[$idx] : $month;
                
                $upMonth = strtoupper($month);
                $upEng = strtoupper($englishMonth);

                $actual = 0;
                if (isset($actualMap[$upMonth])) $actual = $actualMap[$upMonth];
                elseif (isset($actualMap[$upEng])) $actual = $actualMap[$upEng];

                $budget = 0;
                if (isset($budgetMap[$upMonth])) $budget = $budgetMap[$upMonth];
                elseif (isset($budgetMap[$upEng])) $budget = $budgetMap[$upEng];
                
                $trendData[] = [
                    'month' => substr($month, 0, 3), // Jan, Feb, Mar, etc.
                    'Actual' => $actual,
                    'Budget' => $budget
                ];
            }

            return $trendData;
        });

        return response()->json($data);
    }

    public function getVarianceDetails(Request $request)
    {
        // Variances are often too dynamic to cache by group desc, but we can if we want.
        $parentDesc = $request->input('parent_desc');
        if (!$parentDesc) return response()->json([]);

        $cacheKey = $this->getCacheKey($request, 'variance_details');

        $data = Cache::remember($cacheKey, $this->cacheTTL, function () use ($request, $parentDesc) {
            $parent = DB::table('TBL_M_Commitment_Group')->where('Type', 'Parent')->where('Description', $parentDesc)->first();
            if (!$parent || empty($parent->Code)) return [];

            $children = DB::table('TBL_M_Commitment_Group')->where('Type', 'Child')->where('Code', $parent->Code)->get();
            if ($children->isEmpty()) return [];

            $childItems = $children->pluck('CommitmentItem')->toArray();
            $childDescMap = $children->keyBy('CommitmentItem');

            $filter = $request->input('filter', 'monthly');
            $dailySumStr = $this->buildSumColumnStr($request, $request->input('filter', 'monthly'));
            $actualCol = $dailySumStr ? $dailySumStr : '"ActualCost"';
            $budgetCol = $dailySumStr ? $dailySumStr : '"Budget"';

            $actualQuery = DB::table('TBL_T_ACTUAL_DAILY')->whereIn('CommitmentItem', $childItems);
            $actualQuery = $this->applyRangeFilters($actualQuery, $filter, $request);
            $actuals = $actualQuery->select('CommitmentItem', DB::raw("SUM($actualCol) as actual_total"))->groupBy('CommitmentItem')->get()->keyBy('CommitmentItem');

            $budgetQuery = DB::table('TBL_T_BUDGET_DAILY')->whereIn('CommitmentItem', $childItems);
            $budgetQuery = $this->applyRangeFilters($budgetQuery, $filter, $request);
            $budgets = $budgetQuery->select('CommitmentItem', DB::raw("SUM($budgetCol) as budget_total"))->groupBy('CommitmentItem')->get()->keyBy('CommitmentItem');

            $details = [];
            foreach ($childItems as $item) {
                $act = $actuals->has($item) ? (float) $actuals->get($item)->actual_total : 0;
                $bud = $budgets->has($item) ? (float) $budgets->get($item)->budget_total : 0;
                $var = $act - $bud;

                if ($act == 0 && $bud == 0) continue;

                if ($act == 0 && $bud > 0) {
                    $var = 0;
                }

                $details[] = [
                    'commitment_item' => $item,
                    'description' => $childDescMap->get($item)->Description ?? $item,
                    'actual' => $act,
                    'budget' => $bud,
                    'variance' => $var
                ];
            }

            usort($details, function ($a, $b) { return $b['variance'] <=> $a['variance']; });

            return $details;
        });

        return response()->json($data);
    }

    public function clearCache()
    {
        Cache::flush();
        return response()->json(['message' => 'Cache cleared successfully']);
    }

    public function getRunningText(Request $request)
    {
        if ($request->input('clear_cache') == '1') {
            Cache::flush();
            return response()->json(['message' => 'Cache cleared']);
        }

        $text = \Illuminate\Support\Facades\Cache::remember('running_text', 60, function () {
            $setting = Setting::where('key', 'running_text')->first();
            return $setting ? $setting->value : '';
        });
        return response()->json(['text' => $text]);
    }
}
