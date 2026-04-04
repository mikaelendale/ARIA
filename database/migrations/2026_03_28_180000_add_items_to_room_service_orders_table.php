<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('room_service_orders', function (Blueprint $table) {
            $table->text('items')->nullable()->after('room_number');
        });
    }

    public function down(): void
    {
        Schema::table('room_service_orders', function (Blueprint $table) {
            $table->dropColumn('items');
        });
    }
};
