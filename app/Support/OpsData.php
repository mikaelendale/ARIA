<?php

namespace App\Support;

use App\Models\AgentAction;
use App\Models\Guest;
use App\Models\Incident;
use App\Models\Room;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class OpsData
{
    /**
     * @return list<array{id: string, agent: string, tool: string, message: string, timestamp: string, revenueImpact: float}>
     */
    public static function actionFeedItems(int $limit = 20): array
    {
        return AgentAction::query()
            ->with('guest')
            ->latest('fired_at')
            ->limit($limit)
            ->get()
            ->map(fn (AgentAction $action) => [
                'id' => $action->id,
                'agent' => strtolower((string) $action->agent_name),
                'tool' => $action->tool_called,
                'message' => (string) $action->result,
                'timestamp' => optional($action->fired_at)?->toIso8601String() ?? now()->toIso8601String(),
                'revenueImpact' => (float) $action->revenue_impact,
            ])
            ->values()
            ->all();
    }

    public static function occupancyPercent(): float
    {
        $total = Room::query()->count();
        if ($total === 0) {
            return 0.0;
        }
        $occupied = Room::query()->where('is_occupied', true)->count();

        return round(100 * $occupied / $total, 1);
    }

    public static function revenueImpactToday(): float
    {
        $tz = config('app.timezone');
        $start = Carbon::now($tz)->startOfDay();
        $end = Carbon::now($tz)->endOfDay();

        return (float) AgentAction::query()
            ->whereBetween('fired_at', [$start, $end])
            ->sum('revenue_impact');
    }

    /**
     * Revenue impact today from PULSE pricing/promo tools (agent pulse or adjust_pricing / send_promo).
     */
    public static function pulseRevenueImpactToday(): float
    {
        $tz = config('app.timezone');
        $start = Carbon::now($tz)->startOfDay();
        $end = Carbon::now($tz)->endOfDay();

        return (float) AgentAction::query()
            ->whereBetween('fired_at', [$start, $end])
            ->where(function ($q): void {
                $q->whereRaw('LOWER(agent_name) = ?', ['pulse'])
                    ->orWhereIn('tool_called', ['adjust_pricing', 'send_promo']);
            })
            ->sum('revenue_impact');
    }

    /**
     * Pending ARIA jobs (database/redis drivers) + recent failures — makes queue workers visible in the UI.
     *
     * @return array{
     *     connection: string,
     *     pendingByQueue: array<string, int>,
     *     pendingTotal: int,
     *     failedLast24h: int,
     * }
     */
    public static function queueSnapshot(): array
    {
        $ariaQueues = [
            'aria-core',
            'aria-pulse',
            'aria-vera',
            'aria-sentinel',
            'aria-nexus',
            'aria-echo',
        ];

        $pendingByQueue = array_fill_keys($ariaQueues, 0);

        if (Schema::hasTable('jobs')) {
            $rows = DB::table('jobs')
                ->select('queue', DB::raw('count(*) as c'))
                ->whereIn('queue', $ariaQueues)
                ->groupBy('queue')
                ->get();

            foreach ($rows as $row) {
                if (isset($pendingByQueue[$row->queue])) {
                    $pendingByQueue[$row->queue] = (int) $row->c;
                }
            }
        }

        $failedLast24h = 0;
        if (Schema::hasTable('failed_jobs')) {
            $failedLast24h = (int) DB::table('failed_jobs')
                ->where('failed_at', '>=', now()->subHours(24))
                ->count();
        }

        return [
            'connection' => (string) config('queue.default'),
            'pendingByQueue' => $pendingByQueue,
            'pendingTotal' => array_sum($pendingByQueue),
            'failedLast24h' => $failedLast24h,
        ];
    }

    public static function openIncidentsCount(): int
    {
        return Incident::query()->where('status', '!=', 'resolved')->count();
    }

    /**
     * @return array{
     *     guests: int,
     *     incidentsOpen: int,
     *     resolvedToday: int,
     *     churnScore: int,
     *     initialRevenueImpact: int,
     *     initialActions: list<array<string, mixed>>,
     *     occupancyPercent: float,
     *     revenueImpactToday: float,
     *     pulseRevenueToday: float,
     *     queueSnapshot: array<string, mixed>,
     * }
     */
    public static function dashboardPayload(): array
    {
        $initialActions = self::actionFeedItems(20);
        $revenueToday = self::revenueImpactToday();

        return [
            'guests' => Guest::query()->count(),
            'incidentsOpen' => self::openIncidentsCount(),
            'resolvedToday' => Incident::query()->whereDate('resolved_at', now()->toDateString())->count(),
            'churnScore' => (int) round((float) Guest::query()->avg('churn_risk_score')),
            'initialRevenueImpact' => (int) round((float) AgentAction::query()->sum('revenue_impact')),
            'initialActions' => $initialActions,
            'occupancyPercent' => self::occupancyPercent(),
            'revenueImpactToday' => $revenueToday,
            'pulseRevenueToday' => self::pulseRevenueImpactToday(),
            'queueSnapshot' => self::queueSnapshot(),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function guestsList(): array
    {
        return Guest::query()
            ->orderByDesc('churn_risk_score')
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
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public static function guestDetail(Guest $guest): array
    {
        $guest->load([
            'bookings',
            'incidents',
            'agentActions' => fn ($q) => $q->orderByDesc('fired_at'),
        ]);

        return [
            'id' => $guest->id,
            'name' => $guest->name,
            'phone' => $guest->phone,
            'email' => $guest->email,
            'room' => (string) $guest->room_number,
            'churnScore' => (int) $guest->churn_risk_score,
            'vip' => (bool) $guest->is_vip,
            'lastInteraction' => optional($guest->last_interaction_at)?->toIso8601String() ?? now()->toIso8601String(),
            'preferenceTags' => $guest->preference_tags ?? [],
            'bookings' => $guest->bookings->map(fn ($b) => [
                'id' => $b->id,
                'room_number' => $b->room_number,
                'room_type' => $b->room_type,
                'check_in_date' => optional($b->check_in_date)?->toIso8601String(),
                'check_out_date' => optional($b->check_out_date)?->toIso8601String(),
                'status' => $b->status,
                'total_amount' => (string) $b->total_amount,
            ])->values()->all(),
            'incidents' => $guest->incidents->map(fn (Incident $i) => [
                'id' => $i->id,
                'type' => $i->type,
                'severity' => $i->severity,
                'status' => $i->status,
                'description' => $i->description,
                'createdAt' => optional($i->created_at)?->toIso8601String(),
            ])->values()->all(),
            'agentActions' => $guest->agentActions->map(fn (AgentAction $a) => [
                'id' => $a->id,
                'agent' => strtolower((string) $a->agent_name),
                'tool' => $a->tool_called,
                'message' => (string) $a->result,
                'status' => $a->status,
                'timestamp' => optional($a->fired_at)?->toIso8601String(),
                'revenueImpact' => (float) $a->revenue_impact,
            ])->values()->all(),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function incidentsList(): array
    {
        return Incident::query()
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
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public static function incidentDetail(Incident $incident): array
    {
        $incident->load(['agentActions' => fn ($q) => $q->orderBy('fired_at')]);

        return [
            'id' => $incident->id,
            'type' => $incident->type,
            'severity' => $incident->severity,
            'status' => $incident->status,
            'description' => $incident->description,
            'resolutionTime' => $incident->resolution_time_seconds ? $incident->resolution_time_seconds.'s' : null,
            'createdAt' => optional($incident->created_at)?->toIso8601String() ?? now()->toIso8601String(),
            'agentActions' => $incident->agentActions->map(fn (AgentAction $a) => [
                'id' => $a->id,
                'agent' => strtolower((string) $a->agent_name),
                'tool' => $a->tool_called,
                'message' => (string) $a->result,
                'status' => $a->status,
                'timestamp' => optional($a->fired_at)?->toIso8601String(),
                'revenueImpact' => (float) $a->revenue_impact,
            ])->values()->all(),
        ];
    }

    /**
     * @return list<array{name: string, lastRun: string|null}>
     */
    public static function agentsStatus(): array
    {
        $agentNames = ['nexus', 'pulse', 'vera', 'echo', 'hermes', 'sentinel', 'orchestrator'];

        $lastRuns = AgentAction::query()
            ->selectRaw('LOWER(agent_name) as name, MAX(fired_at) as last_run')
            ->groupByRaw('LOWER(agent_name)')
            ->pluck('last_run', 'name');

        return collect($agentNames)->map(fn (string $name) => [
            'name' => $name,
            'lastRun' => $lastRuns[$name] ? (string) $lastRuns[$name] : null,
        ])->values()->all();
    }
}
