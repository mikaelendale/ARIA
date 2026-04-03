<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guests', function (Blueprint $table) {
            $table->date('date_of_birth')->nullable()->after('nationality');
        });

        Schema::table('incidents', function (Blueprint $table) {
            $table->string('review_fingerprint', 64)->nullable()->after('status');
            $table->unique('review_fingerprint');
        });

        Schema::create('room_service_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('guest_id')->nullable()->constrained('guests')->nullOnDelete();
            $table->string('room_number');
            $table->string('status')->default('pending');
            $table->timestamp('placed_at');
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'placed_at']);
        });

        Schema::create('restaurant_visits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('guest_id')->constrained('guests')->cascadeOnDelete();
            $table->timestamp('visited_at');
            $table->timestamps();

            $table->index(['guest_id', 'visited_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_visits');
        Schema::dropIfExists('room_service_orders');

        Schema::table('incidents', function (Blueprint $table) {
            $table->dropUnique(['review_fingerprint']);
            $table->dropColumn('review_fingerprint');
        });

        Schema::table('guests', function (Blueprint $table) {
            $table->dropColumn('date_of_birth');
        });
    }
};
