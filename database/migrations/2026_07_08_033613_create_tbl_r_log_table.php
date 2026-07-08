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
        Schema::create('TBL_R_Log', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('method', 10)->nullable();
            $table->string('url', 2048)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload')->nullable();
            $table->timestamps();
            
            // Optional: add foreign key if TBL_M_USER is standard users table.
            // But since user_id might refer to a custom table TBL_M_USER, we can leave it loosely coupled
            // to avoid strict constraints errors if deleting users.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('TBL_R_Log');
    }
};
