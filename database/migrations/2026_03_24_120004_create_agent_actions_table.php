<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_actions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('incident_id')->nullable()->constrained('incidents')->nullOnDelete();
            $table->foreignUuid('guest_id')->nullable()->constrained('guests')->nullOnDelete();
            $table->string('agent_name');
            $table->string('tool_called');
            $table->json('payload');
            $table->string('status');
            $table->text('result')->nullable();
            $table->decimal('revenue_impact', 12, 2)->nullable();
            $table->timestamp('fired_at');
            $table->timestamps();

            $table->index('incident_id');
            $table->index('guest_id');
            $table->index('fired_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_actions');
    }
};
