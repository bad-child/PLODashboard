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
        Schema::table('users', function (Blueprint $table) {
            $table->string('nik')->nullable()->unique()->after('id');
        });

        // Set default NIK for existing users so they can login
        \Illuminate\Support\Facades\DB::table('users')->where('email', 'admin@plo.test')->update(['nik' => '123456']);
        \Illuminate\Support\Facades\DB::table('users')->where('email', 'it@plo.test')->update(['nik' => '111111']);
        \Illuminate\Support\Facades\DB::table('users')->where('email', 'cc@plo.test')->update(['nik' => '222222']);
        \Illuminate\Support\Facades\DB::table('users')->where('email', 'user@plo.test')->update(['nik' => '333333']);

        // Ideally we would make it not nullable here, but in SQL Server, 
        // altering column nullability with existing NULL rows fails.
        // Since it's nullable, future validations will ensure it's provided.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('nik');
        });
    }
};
