<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->string('number')->primary();
            $table->string('type');
            $table->string('status');
            $table->decimal('base_price', 12, 2);
            $table->decimal('current_price', 12, 2);
            $table->boolean('is_occupied')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
