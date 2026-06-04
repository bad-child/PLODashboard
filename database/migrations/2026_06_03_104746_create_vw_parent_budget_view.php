<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $sql = <<<SQL
        CREATE OR REPLACE VIEW "VW_PARENT_BUDGET" AS
        SELECT 
            b."Cluster",
            MAX(b."Rlndr") AS "Rlndr",
            b."FundCenter",
            map."ParentItem" AS "CommitmentItem", 
            map."ParentDesc" AS "DescCommit",
            b."Bulan",
            b."Tahun",
            MAX(b."Process") AS "Process",
            'Parent' AS "Type",
            SUM(COALESCE(b."Budget", 0)) AS "Budget",
            SUM(COALESCE(b."D01", 0)) AS "D01", SUM(COALESCE(b."D02", 0)) AS "D02", SUM(COALESCE(b."D03", 0)) AS "D03",
            SUM(COALESCE(b."D04", 0)) AS "D04", SUM(COALESCE(b."D05", 0)) AS "D05", SUM(COALESCE(b."D06", 0)) AS "D06",
            SUM(COALESCE(b."D07", 0)) AS "D07", SUM(COALESCE(b."D08", 0)) AS "D08", SUM(COALESCE(b."D09", 0)) AS "D09",
            SUM(COALESCE(b."D10", 0)) AS "D10", SUM(COALESCE(b."D11", 0)) AS "D11", SUM(COALESCE(b."D12", 0)) AS "D12",
            SUM(COALESCE(b."D13", 0)) AS "D13", SUM(COALESCE(b."D14", 0)) AS "D14", SUM(COALESCE(b."D15", 0)) AS "D15",
            SUM(COALESCE(b."D16", 0)) AS "D16", SUM(COALESCE(b."D17", 0)) AS "D17", SUM(COALESCE(b."D18", 0)) AS "D18",
            SUM(COALESCE(b."D19", 0)) AS "D19", SUM(COALESCE(b."D20", 0)) AS "D20", SUM(COALESCE(b."D21", 0)) AS "D21",
            SUM(COALESCE(b."D22", 0)) AS "D22", SUM(COALESCE(b."D23", 0)) AS "D23", SUM(COALESCE(b."D24", 0)) AS "D24",
            SUM(COALESCE(b."D25", 0)) AS "D25", SUM(COALESCE(b."D26", 0)) AS "D26", SUM(COALESCE(b."D27", 0)) AS "D27",
            SUM(COALESCE(b."D28", 0)) AS "D28", SUM(COALESCE(b."D29", 0)) AS "D29", SUM(COALESCE(b."D30", 0)) AS "D30",
            SUM(COALESCE(b."D31", 0)) AS "D31"
        FROM "TBL_T_BUDGET_DAILY" b
        INNER JOIN (
            SELECT 
                m_child."CommitmentItem" AS "ChildItem",
                m_parent."CommitmentItem" AS "ParentItem",
                m_parent."Description" AS "ParentDesc"
            FROM "TBL_M_Commitment_Group" m_child
            INNER JOIN "TBL_M_Commitment_Group" m_parent ON m_child."Code" = m_parent."Code"
            WHERE m_child."Type" = 'Child' AND m_parent."Type" = 'Parent'
        ) map ON b."CommitmentItem" = map."ChildItem" 
        GROUP BY 
            b."Cluster",
            b."FundCenter",
            map."ParentItem",
            map."ParentDesc",
            b."Bulan",
            b."Tahun"
        SQL;
        
        DB::statement($sql);
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS "VW_PARENT_BUDGET"');
    }
};
