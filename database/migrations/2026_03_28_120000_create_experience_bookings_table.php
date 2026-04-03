<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experience_bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('guest_id')->constrained('guests')->restrictOnDelete();
            $table->foreignUuid('experience_id')->constrained('experiences')->restrictOnDelete();
            $table->string('status')->default('pending');
            $table->timestamp('scheduled_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['guest_id', 'experience_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experience_bookings');
    }
};
