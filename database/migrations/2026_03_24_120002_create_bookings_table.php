<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('guest_id')->constrained('guests')->restrictOnDelete();
            $table->string('room_number');
            $table->string('room_type');
            $table->timestamp('check_in_date');
            $table->timestamp('check_out_date');
            $table->string('status');
            $table->decimal('total_amount', 12, 2);
            $table->timestamps();

            $table->index('guest_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
