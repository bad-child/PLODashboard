<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    private $monthsList = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

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
                if ($startIndex > $endIndex) {
                    // Swap if user selected e.g., Des to Jan
                    $temp = $startIndex;
                    $startIndex = $endIndex;
                    $endIndex = $temp;
                }
                $selectedMonths = array_slice($this->monthsList, $startIndex, $endIndex - $startIndex + 1);
                $query->whereIn('Bulan', $selectedMonths);
            }
        }

        if ($request->has('fund_center') && !empty($request->input('fund_center'))) {
            // Because applyRangeFilters is called on queries that might join TBL_M_FundCenter, we need to be careful with column ambiguity.
            // But we can just use the table name from the query's from clause.
            $from = $query->from;
            $tableName = is_string($from) ? $from : 'VW_PARENT_ACTUAL';
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
        $items = DB::table('VW_PARENT_ACTUAL')
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
        $filter = $request->input('filter', 'monthly'); 
        $commitmentItemId = $request->input('commitment_item');
        $category = $request->input('category'); 

        $budgetQuery = DB::table('VW_PARENT_BUDGET')
            ->join('TBL_M_FundCenter', DB::raw('SUBSTRING("VW_PARENT_BUDGET"."FundCenter", 1, 3)'), '=', 'TBL_M_FundCenter.Code')
            ->select('TBL_M_FundCenter.Description as FundCenterDesc');
        $actualQuery = DB::table('VW_PARENT_ACTUAL')
            ->join('TBL_M_FundCenter', DB::raw('SUBSTRING("VW_PARENT_ACTUAL"."FundCenter", 1, 3)'), '=', 'TBL_M_FundCenter.Code')
            ->select('TBL_M_FundCenter.Description as FundCenterDesc');

        $budgetQuery = $this->applyRangeFilters($budgetQuery, $filter, $request);
        $actualQuery = $this->applyRangeFilters($actualQuery, $filter, $request);

        $dailySumStr = $this->buildSumColumnStr($request, $filter);
        
        $budgetCol = $dailySumStr ? $dailySumStr : '"Budget"';
        $actualCol = $dailySumStr ? $dailySumStr : '"ActualCost"';

        // Build conditional aggregation logic
        if ($commitmentItemId) {
            $budgetQuery->selectRaw("SUM(CASE WHEN \"VW_PARENT_BUDGET\".\"CommitmentItem\" = ? THEN $budgetCol ELSE 0 END) as target_budget", [$commitmentItemId]);
            $actualQuery->selectRaw("SUM(CASE WHEN \"VW_PARENT_ACTUAL\".\"CommitmentItem\" = ? THEN $actualCol ELSE 0 END) as target_actual", [$commitmentItemId]);
        } else {
            $descCommitPattern = '%Gaji dan Upah%';
            if ($category === 'bbm') {
                $descCommitPattern = '%BBM Produksi%';
            }
            $budgetQuery->selectRaw("SUM(CASE WHEN \"VW_PARENT_BUDGET\".\"DescCommit\" LIKE ? THEN $budgetCol ELSE 0 END) as target_budget", [$descCommitPattern]);
            $actualQuery->selectRaw("SUM(CASE WHEN \"VW_PARENT_ACTUAL\".\"DescCommit\" LIKE ? THEN $actualCol ELSE 0 END) as target_actual", [$descCommitPattern]);
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
        
        $mergedData = array_slice($mergedData, 0, 7);
        return response()->json($mergedData);
    }

    public function getCostComposition(Request $request)
    {
        $filter = $request->input('filter', 'monthly');

        $dailySumStr = $this->buildSumColumnStr($request, $filter);
        $actualCol = $dailySumStr ? $dailySumStr : '"ActualCost"';

        $query = DB::table('VW_PARENT_ACTUAL')
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

        return response()->json([
            'data' => $formatted,
            'total' => $totalCost
        ]);
    }

    public function getKpiCards(Request $request)
    {
        $filter = $request->input('filter', 'monthly');

        $dailySumStr = $this->buildSumColumnStr($request, $filter);
        $actualCol = $dailySumStr ? $dailySumStr : '"ActualCost"';

        $query = DB::table('VW_PARENT_ACTUAL')
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

        return response()->json([
            'revenue' => $revenue,
            'total_cost' => $totalCost,
            'total_cogs' => $totalCogs,
            'ebitda' => $ebitda,
            'ebitda_margin' => $ebitdaMargin,
            'cogs_margin' => $cogsMargin
        ]);
    }

    public function getTopVariances(Request $request)
    {
        $filter = $request->input('filter', 'monthly');

        $dailySumStr = $this->buildSumColumnStr($request, $filter);
        $actualCol = $dailySumStr ? $dailySumStr : '"ActualCost"';
        $budgetCol = $dailySumStr ? $dailySumStr : '"Budget"';

        $actualQuery = DB::table('VW_PARENT_ACTUAL')
            ->select('DescCommit', DB::raw("SUM($actualCol) as actual_total"));
        $actualQuery = $this->applyRangeFilters($actualQuery, $filter, $request);
        $actualResults = $actualQuery->groupBy('DescCommit')->get()->keyBy('DescCommit');

        $budgetQuery = DB::table('VW_PARENT_BUDGET')
            ->select('DescCommit', DB::raw("SUM($budgetCol) as budget_total"));
        $budgetQuery = $this->applyRangeFilters($budgetQuery, $filter, $request);
        $budgetResults = $budgetQuery->groupBy('DescCommit')->get()->keyBy('DescCommit');

        $variances = [];
        $allDesc = $actualResults->keys()->merge($budgetResults->keys())->unique();

        foreach ($allDesc as $desc) {
            $actual = $actualResults->has($desc) ? (float) $actualResults->get($desc)->actual_total : 0;
            $budget = $budgetResults->has($desc) ? (float) $budgetResults->get($desc)->budget_total : 0;

            $variance = $actual - $budget;

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

        $top5 = array_slice($variances, 0, 5);

        return response()->json($top5);
    }

    public function getMonthlyTrend(Request $request)
    {
        $filter = $request->input('filter', 'monthly');

        $dailySumStr = $this->buildSumColumnStr($request, $filter);
        $actualCol = $dailySumStr ? $dailySumStr : '"ActualCost"';
        $budgetCol = $dailySumStr ? $dailySumStr : '"Budget"';

        $actualQuery = DB::table('VW_PARENT_ACTUAL')
            ->select('Bulan', DB::raw("SUM($actualCol) as actual_total"));
        $actualQuery = $this->applyRangeFilters($actualQuery, $filter, $request);
        $actualResults = $actualQuery->groupBy('Bulan')->get()->keyBy('Bulan');

        $budgetQuery = DB::table('VW_PARENT_BUDGET')
            ->select('Bulan', DB::raw("SUM($budgetCol) as budget_total"));
        $budgetQuery = $this->applyRangeFilters($budgetQuery, $filter, $request);
        $budgetResults = $budgetQuery->groupBy('Bulan')->get()->keyBy('Bulan');

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
        foreach ($selectedMonths as $month) {
            $actual = $actualResults->has($month) ? (float) $actualResults->get($month)->actual_total : 0;
            $budget = $budgetResults->has($month) ? (float) $budgetResults->get($month)->budget_total : 0;
            
            $trendData[] = [
                'month' => substr($month, 0, 3), // Jan, Feb, Mar, etc.
                'Actual' => $actual,
                'Budget' => $budget
            ];
        }

        return response()->json($trendData);
    }

    public function getVarianceDetails(Request $request)
    {
        $parentDesc = $request->input('parent_desc');
        if (!$parentDesc) return response()->json([]);

        $parent = DB::table('TBL_M_Commitment_Group')->where('Type', 'Parent')->where('Description', $parentDesc)->first();
        if (!$parent || empty($parent->Code)) return response()->json([]);

        $children = DB::table('TBL_M_Commitment_Group')->where('Type', 'Child')->where('Code', $parent->Code)->get();
        if ($children->isEmpty()) return response()->json([]);

        $childItems = $children->pluck('CommitmentItem')->toArray();
        $childDescMap = $children->keyBy('CommitmentItem');

        $filter = $request->input('filter', 'monthly');
        $dailySumStr = $this->buildSumColumnStr($request, $filter);
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

            $details[] = [
                'commitment_item' => $item,
                'description' => $childDescMap->get($item)->Description ?? $item,
                'actual' => $act,
                'budget' => $bud,
                'variance' => $var
            ];
        }

        usort($details, function ($a, $b) { return $b['variance'] <=> $a['variance']; });

        return response()->json($details);
    }
}
