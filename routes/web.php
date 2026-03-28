<?php

use App\Models\AgentAction;
use App\Models\Guest;
use App\Models\Incident;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('guests', 'guests')->name('guests.index');
    Route::inertia('guests/{guest}', 'guests/show')->name('guests.show');
    Route::inertia('incidents', 'incidents')->name('incidents.index');
    Route::inertia('incidents/{incident}', 'incidents/show')->name('incidents.show');

    Route::prefix('api/ops')->group(function () {
        Route::get('dashboard/stats', function () {
            $initialActions = AgentAction::query()
                ->latest('fired_at')
                ->limit(50)
                ->get()
                ->map(fn (AgentAction $action) => [
                    'id' => $action->id,
                    'agent' => strtolower((string) $action->agent_name),
                    'tool' => $action->tool_called,
                    'message' => (string) $action->result,
                    'timestamp' => optional($action->fired_at)?->toIso8601String() ?? now()->toIso8601String(),
                    'revenueImpact' => (float) $action->revenue_impact,
                ])
                ->values();

            return response()->json([
                'guests' => Guest::query()->count(),
                'incidentsOpen' => Incident::query()->where('status', '!=', 'resolved')->count(),
                'resolvedToday' => Incident::query()->whereDate('resolved_at', now()->toDateString())->count(),
                'churnScore' => (int) round((float) Guest::query()->avg('churn_risk_score')),
                'initialRevenueImpact' => (int) round((float) AgentAction::query()->sum('revenue_impact')),
                'initialActions' => $initialActions,
            ]);
        });

        Route::get('agents/status', function () {
            $agentNames = ['nexus', 'pulse', 'vera', 'echo', 'hermes', 'sentinel'];

            $lastRuns = AgentAction::query()
                ->selectRaw('LOWER(agent_name) as name, MAX(fired_at) as last_run')
                ->groupByRaw('LOWER(agent_name)')
                ->pluck('last_run', 'name');

            $agents = collect($agentNames)->map(fn (string $name) => [
                'name' => $name,
                'lastRun' => $lastRuns[$name] ? (string) $lastRuns[$name] : null,
            ]);

            return response()->json([
                'agents' => $agents,
            ]);
        });

        Route::get('guests', function () {
            return response()->json(
                Guest::query()
                    ->latest('last_interaction_at')
                    ->limit(200)
                    ->get()
                    ->map(fn (Guest $guest) => [
                        'id' => $guest->id,
                        'name' => $guest->name,
                        'room' => (string) $guest->room_number,
                        'churnScore' => (int) $guest->churn_risk_score,
                        'vip' => (bool) $guest->is_vip,
                        'lastInteraction' => optional($guest->last_interaction_at)?->toIso8601String() ?? now()->toIso8601String(),
                    ])
                    ->values()
            );
        });

        Route::get('incidents', function () {
            return response()->json(
                Incident::query()
                    ->latest('created_at')
                    ->limit(200)
                    ->get()
                    ->map(fn (Incident $incident) => [
                        'id' => $incident->id,
                        'type' => $incident->type,
                        'severity' => $incident->severity,
                        'status' => $incident->status,
                        'resolutionTime' => $incident->resolution_time_seconds ? $incident->resolution_time_seconds.'s' : null,
                        'createdAt' => optional($incident->created_at)?->toIso8601String() ?? now()->toIso8601String(),
                    ])
                    ->values()
            );
        });

        Route::get('guests/{guest}', function (Guest $guest) {
            return response()->json([
                'id' => $guest->id,
                'name' => $guest->name,
                'room' => (string) $guest->room_number,
                'churnScore' => (int) $guest->churn_risk_score,
                'vip' => (bool) $guest->is_vip,
                'lastInteraction' => optional($guest->last_interaction_at)?->toIso8601String() ?? now()->toIso8601String(),
            ]);
        });

        Route::get('incidents/{incident}', function (Incident $incident) {
            return response()->json([
                'id' => $incident->id,
                'type' => $incident->type,
                'severity' => $incident->severity,
                'status' => $incident->status,
                'resolutionTime' => $incident->resolution_time_seconds ? $incident->resolution_time_seconds.'s' : null,
                'createdAt' => optional($incident->created_at)?->toIso8601String() ?? now()->toIso8601String(),
            ]);
        });
    });
});

require __DIR__.'/settings.php';
