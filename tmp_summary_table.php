    public function getSummaryTable(Request $request)
    {
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

            for ($i = $dayStart; $i <= $dayEnd; $i++) {
                $colName = 'D' . str_pad($i, 2, '0', STR_PAD_LEFT);
                $columns[] = $colName;
                $actualQuery->selectRaw("SUM(\"$colName\") as \"$colName\"");
                $budgetQuery->selectRaw("SUM(\"$colName\") as \"$colName\"");
            }
            $actualQuery->select('DescCommit')->groupBy('DescCommit');
            $budgetQuery->select('DescCommit')->groupBy('DescCommit');

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
                $groupedActual[$r->DescCommit][$r->Bulan] = (float) $r->total;
            }

            $groupedBudget = [];
            foreach ($budgetResults as $r) {
                $groupedBudget[$r->DescCommit][$r->Bulan] = (float) $r->total;
            }

            $allDesc = array_unique(array_merge(array_keys($groupedActual), array_keys($groupedBudget)));

            foreach ($allDesc as $desc) {
                $item = [
                    'DescCommit' => $desc,
                    'Plan' => [],
                    'Actual' => []
                ];
                foreach ($columns as $col) {
                    $item['Plan'][$col] = isset($groupedBudget[$desc][$col]) ? $groupedBudget[$desc][$col] : 0;
                    $item['Actual'][$col] = isset($groupedActual[$desc][$col]) ? $groupedActual[$desc][$col] : 0;
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

        return response()->json([
            'columns' => $columns,
            'data' => $data
        ]);
    }
