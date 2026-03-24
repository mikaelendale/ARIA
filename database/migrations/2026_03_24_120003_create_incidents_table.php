<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('guest_id')->nullable()->constrained('guests')->nullOnDelete();
            $table->string('type');
            $table->string('trigger_source');
            $table->string('severity');
            $table->text('description');
            $table->json('context')->nullable();
            $table->string('status');
            $table->string('resolved_by')->nullable();
            $table->unsignedInteger('resolution_time_seconds')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index('guest_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
