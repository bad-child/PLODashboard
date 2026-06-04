<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $sql = <<<SQL
        CREATE OR REPLACE VIEW "VW_PARENT_ACTUAL" AS
        SELECT 
            a."Cluster",
            a."FundCenter",
            m_parent."CommitmentItem" AS "CommitmentItem", 
            m_parent."Description" AS "DescCommit",
            MAX(a."GLAccount") AS "GLAccount", 
            a."ValType",
            a."Bulan",
            a."Tahun",
            SUM(COALESCE(a."ActualCost", 0)) AS "ActualCost",
            SUM(COALESCE(a."D01", 0)) AS "D01",
            SUM(COALESCE(a."D02", 0)) AS "D02",
            SUM(COALESCE(a."D03", 0)) AS "D03",
            SUM(COALESCE(a."D04", 0)) AS "D04",
            SUM(COALESCE(a."D05", 0)) AS "D05",
            SUM(COALESCE(a."D06", 0)) AS "D06",
            SUM(COALESCE(a."D07", 0)) AS "D07",
            SUM(COALESCE(a."D08", 0)) AS "D08",
            SUM(COALESCE(a."D09", 0)) AS "D09",
            SUM(COALESCE(a."D10", 0)) AS "D10",
            SUM(COALESCE(a."D11", 0)) AS "D11",
            SUM(COALESCE(a."D12", 0)) AS "D12",
            SUM(COALESCE(a."D13", 0)) AS "D13",
            SUM(COALESCE(a."D14", 0)) AS "D14",
            SUM(COALESCE(a."D15", 0)) AS "D15",
            SUM(COALESCE(a."D16", 0)) AS "D16",
            SUM(COALESCE(a."D17", 0)) AS "D17",
            SUM(COALESCE(a."D18", 0)) AS "D18",
            SUM(COALESCE(a."D19", 0)) AS "D19",
            SUM(COALESCE(a."D20", 0)) AS "D20",
            SUM(COALESCE(a."D21", 0)) AS "D21",
            SUM(COALESCE(a."D22", 0)) AS "D22",
            SUM(COALESCE(a."D23", 0)) AS "D23",
            SUM(COALESCE(a."D24", 0)) AS "D24",
            SUM(COALESCE(a."D25", 0)) AS "D25",
            SUM(COALESCE(a."D26", 0)) AS "D26",
            SUM(COALESCE(a."D27", 0)) AS "D27",
            SUM(COALESCE(a."D28", 0)) AS "D28",
            SUM(COALESCE(a."D29", 0)) AS "D29",
            SUM(COALESCE(a."D30", 0)) AS "D30",
            SUM(COALESCE(a."D31", 0)) AS "D31"
        FROM "TBL_T_ACTUAL_DAILY" a
        LEFT JOIN "TBL_M_Commitment_Group" m_child 
            ON TRIM(a."CommitmentItem") = TRIM(m_child."CommitmentItem") 
            AND m_child."Type" = 'Child'
        LEFT JOIN "TBL_M_Commitment_Group" m_parent 
            ON m_child."Code" = m_parent."Code" 
            AND m_parent."Type" = 'Parent'
        WHERE 
            m_parent."CommitmentItem" IS NOT NULL
        GROUP BY 
            a."Cluster",
            a."FundCenter",
            m_parent."CommitmentItem",
            m_parent."Description",
            a."ValType",
            a."Bulan",
            a."Tahun"
        SQL;
        
        DB::statement($sql);
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS "VW_PARENT_ACTUAL"');
    }
};
