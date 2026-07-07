<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::rename('users', 'TBL_M_User');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename('TBL_M_User', 'users');
    }
};
