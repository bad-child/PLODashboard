<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('TBL_M_Commitment_Group', function (Blueprint $table) {
            $table->id();
            $table->string('Code')->nullable()->comment('Group code like A1, A2, or empty for root parents');
            $table->string('CommitmentItem')->index();
            $table->string('BO')->nullable();
            $table->string('Description');
            $table->string('Source')->nullable();
            $table->enum('Type', ['Parent', 'Child'])->default('Child');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('TBL_M_Commitment_Group');
    }
};
