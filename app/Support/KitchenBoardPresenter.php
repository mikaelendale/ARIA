<?php

namespace App\Support;

use App\Models\AgentAction;
use App\Models\Guest;
use App\Models\RoomServiceOrder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

final class KitchenBoardPresenter
{
    /** Sentinel flags non-delivered room service older than this (minutes). */
    public const SENTINEL_DELAY_MINUTES = 35;

    /**
     * @return array{
     *     pending: list<array<string, mixed>>,
     *     completedToday: list<array<string, mixed>>,
     *     boardBriefing: string,
     *     boardBullets: list<string>,
     *     signals: list<array<string, mixed>>,
     *     queueSnapshot: array<string, mixed>,
     *     occupancyPercent: float,
     *     pollSeconds: int,
     * }
     */
    public static function inertiaPayload(): array
    {
        $today = now()->startOfDay();
        $delay = self::SENTINEL_DELAY_MINUTES;

        $pendingModels = RoomServiceOrder::query()
            ->with([
                'guest' => function ($q): void {
                    $q->select([
                        'id',
                        'name',
                        'is_vip',
                        'churn_risk_score',
                        'preference_tags',
                        'language_preference',
                        'last_interaction_at',
                        'nationality',
                        'phone',
                    ])->withCount([
                        'incidents as open_incidents_count' => function ($q): void {
                            $q->where('status', '!=', 'resolved');
                        },
                    ]);
                },
            ])
            ->where('status', 'pending')
            ->orderBy('placed_at')
            ->get();

        $pending = $pendingModels
            ->map(fn (RoomServiceOrder $order) => self::serializeOrder($order, $delay))
            ->values()
            ->all();

        $completedToday = RoomServiceOrder::query()
            ->with(['guest:id,name'])
            ->where('status', 'delivered')
            ->whereNotNull('delivered_at')
            ->where('delivered_at', '>=', $today)
            ->orderByDesc('delivered_at')
            ->limit(20)
            ->get()
            ->map(fn (RoomServiceOrder $order) => self::serializeCompletedOrder($order))
            ->values()
            ->all();

        $guestIds = $pendingModels->pluck('guest_id')->filter()->unique()->all();

        $signals = self::kitchenSignals($guestIds, 14);

        return [
            'pending' => $pending,
            'completedToday' => $completedToday,
            'boardBriefing' => self::boardBriefing($pending, $delay),
            'boardBullets' => self::boardBullets($pending, $delay),
            'signals' => $signals,
            'queueSnapshot' => OpsData::queueSnapshot(),
            'occupancyPercent' => OpsData::occupancyPercent(),
            'pollSeconds' => max(5, (int) config('aria.kitchen_poll_interval_seconds', 15)),
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $pending
     * @return list<string>
     */
    protected static function boardBullets(array $pending, int $delayMinutes): array
    {
        $bullets = [];
        $occupancy = OpsData::occupancyPercent();

        $bullets[] = sprintf('Resort occupancy is about %.0f%% — pacing matches what front desk sees.', $occupancy);

        $delayed = array_values(array_filter($pending, fn (array $o) => ($o['pastSentinelSla'] ?? false) === true));
        if (count($delayed) > 0) {
            $bullets[] = sprintf(
                '%d %s past the %d-minute Sentinel watch — ARIA may ping ops or the guest journey team.',
                count($delayed),
                count($delayed) === 1 ? 'ticket is' : 'tickets are',
                $delayMinutes
            );
        }

        $vip = count(array_filter($pending, fn (array $o) => ($o['guest']['isVip'] ?? false) === true));
        if ($vip > 0) {
            $bullets[] = sprintf('%d VIP %s on the pass — plate presentation and timing matter a bit more.', $vip, $vip === 1 ? 'guest' : 'guests');
        }

        return $bullets;
    }

    /**
     * @param  list<array<string, mixed>>  $pending
     */
    protected static function boardBriefing(array $pending, int $delayMinutes): string
    {
        $n = count($pending);
        if ($n === 0) {
            return 'ARIA has no open room-service tickets right now. When guests order through the assistant or front desk, they will land here with guest context and live signals.';
        }

        $oldest = $pending[0];
        $room = (string) ($oldest['roomNumber'] ?? '');
        $wait = $oldest['waitMinutes'];
        $waitText = is_int($wait) ? sprintf('%d minutes', $wait) : 'a short while';

        $delayedN = count(array_filter($pending, fn (array $o) => ($o['pastSentinelSla'] ?? false) === true));

        $parts = [
            sprintf('You have %d active %s on the pass.', $n, $n === 1 ? 'ticket' : 'tickets'),
            sprintf('Longest wait is room %s (~%s).', $room, $waitText),
        ];

        if ($delayedN > 0) {
            $parts[] = sprintf('%d %s already crossed Sentinel’s %d-minute line — treat those first if you can.', $delayedN, $delayedN === 1 ? 'is' : 'are', $delayMinutes);
        } else {
            $parts[] = sprintf('Nothing has crossed the %d-minute Sentinel window yet — still room to breathe.', $delayMinutes);
        }

        $parts[] = 'Each card pulls guest tags, loyalty read, and recent ARIA steps so you are never guessing.';

        return implode(' ', $parts);
    }

    /**
     * @param  list<string|null>  $guestIds
     * @return list<array{id: string, agent: string, tool: string, message: string, timestamp: string, roomHint: string|null}>
     */
    protected static function kitchenSignals(array $guestIds, int $limit): array
    {
        $guestIds = array_values(array_filter($guestIds));

        $query = AgentAction::query()
            ->with(['guest:id,name,room_number'])
            ->latest('fired_at')
            ->limit($limit * 3)
            ->where(function ($q) use ($guestIds): void {
                $q->whereIn('tool_called', [
                    'ping_kitchen',
                    'send_whatsapp',
                    'escalate_to_human',
                    'log_incident',
                ])
                    ->orWhereRaw("LOWER(COALESCE(result, '')) LIKE ?", ['%room%'])
                    ->orWhereRaw("LOWER(COALESCE(result, '')) LIKE ?", ['%kitchen%']);

                if ($guestIds !== []) {
                    $q->orWhereIn('guest_id', $guestIds);
                }
            });

        return $query
            ->get()
            ->take($limit)
            ->map(function (AgentAction $action) {
                $room = $action->guest?->room_number;

                return [
                    'id' => $action->id,
                    'agent' => strtolower((string) $action->agent_name),
                    'tool' => $action->tool_called,
                    'message' => Str::limit((string) $action->result, 200),
                    'timestamp' => optional($action->fired_at)?->toIso8601String() ?? now()->toIso8601String(),
                    'roomHint' => $room ? (string) $room : null,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    protected static function serializeOrder(RoomServiceOrder $order, int $delayMinutes): array
    {
        $placed = $order->placed_at;
        $waitMinutes = $placed ? $placed->diffInMinutes(now()) : null;
        $pastSla = is_int($waitMinutes) && $waitMinutes >= $delayMinutes;

        $guest = $order->guest;
        $steps = [];

        if ($guest !== null) {
            $steps = AgentAction::query()
                ->where('guest_id', $guest->id)
                ->where('fired_at', '>=', $placed ?? now()->subDay())
                ->latest('fired_at')
                ->limit(8)
                ->get()
                ->map(fn (AgentAction $a) => [
                    'id' => $a->id,
                    'agent' => strtolower((string) $a->agent_name),
                    'tool' => $a->tool_called,
                    'message' => Str::limit((string) $a->result, 180),
                    'timestamp' => optional($a->fired_at)?->toIso8601String() ?? now()->toIso8601String(),
                ])
                ->values()
                ->all();
        }

        $attention = self::attentionLevel($waitMinutes, $pastSla, $guest);

        return [
            'id' => $order->id,
            'roomNumber' => $order->room_number,
            'items' => $order->items,
            'placedAt' => $placed?->toIso8601String(),
            'waitMinutes' => $waitMinutes,
            'pastSentinelSla' => $pastSla,
            'sentinelDelayMinutes' => $delayMinutes,
            'attention' => $attention,
            'assistantHeadline' => self::assistantHeadline($order, $guest, $waitMinutes, $pastSla),
            'assistantBullets' => self::assistantBullets($guest, $waitMinutes, $pastSla, $delayMinutes),
            'guest' => self::guestPayload($guest),
            'recentSteps' => $steps,
            'deliveredAt' => $order->delivered_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected static function serializeCompletedOrder(RoomServiceOrder $order): array
    {
        return [
            'id' => $order->id,
            'roomNumber' => $order->room_number,
            'guestName' => $order->guest?->name,
            'items' => $order->items,
            'placedAt' => $order->placed_at?->toIso8601String(),
            'waitMinutes' => null,
            'deliveredAt' => $order->delivered_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    protected static function guestPayload(?Guest $guest): ?array
    {
        if ($guest === null) {
            return null;
        }

        $tags = $guest->preference_tags;
        if (! is_array($tags)) {
            $tags = [];
        }

        $phone = $guest->phone;
        $phoneTail = null;
        if (is_string($phone) && preg_match('/(\d{2,4})$/', preg_replace('/\D/', '', $phone), $m)) {
            $phoneTail = $m[1];
        }

        return [
            'id' => $guest->id,
            'name' => $guest->name,
            'isVip' => (bool) $guest->is_vip,
            'churnRiskScore' => (int) $guest->churn_risk_score,
            'preferenceTags' => array_values(array_filter(array_map('strval', $tags))),
            'languagePreference' => $guest->language_preference,
            'nationality' => $guest->nationality,
            'lastInteractionAt' => $guest->last_interaction_at?->toIso8601String(),
            'openIncidentsCount' => (int) ($guest->open_incidents_count ?? 0),
            'phoneTail' => $phoneTail,
        ];
    }

    protected static function assistantHeadline(
        RoomServiceOrder $order,
        ?Guest $guest,
        ?int $waitMinutes,
        bool $pastSla,
    ): string {
        $items = Str::limit(trim((string) ($order->items ?? '')), 120);

        if ($items === '') {
            $items = 'Room service request';
        }

        if ($pastSla) {
            return sprintf('ARIA: "%s" — this ticket is outside the usual window; guest experience may already be in motion.', $items);
        }

        if ($guest !== null && $guest->is_vip) {
            return sprintf('ARIA: "%s" — VIP on file; match the usual Kuriftu polish.', $items);
        }

        return sprintf('ARIA: "%s" — standard pass; context below is live from the guest profile.', $items);
    }

    /**
     * @return list<string>
     */
    protected static function assistantBullets(
        ?Guest $guest,
        ?int $waitMinutes,
        bool $pastSla,
        int $delayMinutes,
    ): array {
        $lines = [];

        if ($guest === null) {
            $lines[] = 'No guest profile linked — treat as anonymous in-room service.';

            return $lines;
        }

        if ($guest->is_vip) {
            $lines[] = 'Front desk marked VIP — prioritize timing and presentation.';
        }

        $open = (int) ($guest->open_incidents_count ?? 0);
        if ($open > 0) {
            $lines[] = sprintf('%d open issue%s on the guest record — stay calm, follow standards, note anything unusual.', $open, $open === 1 ? '' : 's');
        }

        $score = (int) $guest->churn_risk_score;
        if ($score >= 65) {
            $lines[] = sprintf('Loyalty model reads elevated risk (%d/100) — small thoughtful touches help the stay.', $score);
        } elseif ($score >= 40) {
            $lines[] = sprintf('Loyalty read is mid-range (%d/100) — consistent service is enough.', $score);
        }

        $tags = $guest->preference_tags;
        if (is_array($tags) && $tags !== []) {
            $lines[] = 'Tagged preferences: '.Str::limit(implode(', ', array_map('strval', $tags)), 140).'.';
        }

        if (is_string($guest->language_preference) && $guest->language_preference !== '' && strtolower($guest->language_preference) !== 'en') {
            $lines[] = 'Preferred language: '.$guest->language_preference.' — brief English on the ticket is fine if the floor team needs it.';
        }

        if ($guest->last_interaction_at instanceof Carbon) {
            $lines[] = 'Last recorded guest touchpoint: '.$guest->last_interaction_at->diffForHumans().' (from ARIA logs).';
        }

        if (is_int($waitMinutes)) {
            $lines[] = sprintf('On the pass %d minutes — Sentinel watches at %d minutes.', $waitMinutes, $delayMinutes);
        }

        if ($pastSla) {
            $lines[] = 'Sentinel SLA crossed — orchestrator or Nexus may have already messaged teams or the guest.';
        }

        if ($lines === []) {
            $lines[] = 'Profile is quiet — no extra flags beyond the order text.';
        }

        return $lines;
    }

    protected static function attentionLevel(
        ?int $waitMinutes,
        bool $pastSla,
        ?Guest $guest,
    ): string {
        if ($pastSla || ($guest !== null && (int) ($guest->open_incidents_count ?? 0) > 0)) {
            return 'urgent';
        }

        if ($guest !== null && ($guest->is_vip || (int) $guest->churn_risk_score >= 55)) {
            return 'elevated';
        }

        if (is_int($waitMinutes) && $waitMinutes >= 20) {
            return 'elevated';
        }

        return 'standard';
    }
}
