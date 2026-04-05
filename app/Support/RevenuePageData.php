<?php

namespace App\Support;

use App\Models\AgentAction;
use App\Models\Booking;
use App\Models\Room;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Live revenue view: room booking totals by check-in day plus logged AI revenue impact (agent_actions).
 */
class RevenuePageData
{
    public const CURRENCY = 'ETB';

    private const WINDOW_DAYS = 30;

    /**
     * @return array<string, mixed>
     */
    public static function payload(): array
    {
        $tz = config('app.timezone');
        $today = Carbon::now($tz)->startOfDay();
        $windowStart = $today->copy()->subDays(self::WINDOW_DAYS - 1)->startOfDay();
        $windowEnd = $today->copy()->endOfDay();

        $prevLastDay = $windowStart->copy()->subDay()->startOfDay();
        $prevFirstDay = $windowStart->copy()->subDays(self::WINDOW_DAYS)->startOfDay();

        $daily = self::dailySeries($windowStart, $today);
        $total = array_sum(array_column($daily, 'revenue'));

        $prevDaily = self::dailySeries($prevFirstDay, $prevLastDay);
        $prevTotal = array_sum(array_column($prevDaily, 'revenue'));
        $wow = $prevTotal > 0 ? round(100 * ($total - $prevTotal) / $prevTotal, 1) : 0.0;

        $bookingTotal = self::bookingRevenueSum($windowStart, $windowEnd);
        $agentTotal = OpsData::agentRevenueImpactBetween($windowStart, $windowEnd);
        $pulseTotal = OpsData::pulseRevenueImpactBetween($windowStart, $windowEnd);
        $discountTotal = OpsData::discountRevenueImpactBetween($windowStart, $windowEnd);
        $otherAgent = OpsData::otherAgentRevenueImpactBetween($windowStart, $windowEnd);

        $roomCount = Room::query()->count();
        $occupancy = OpsData::occupancyPercent();

        $bookingRows = Booking::query()
            ->whereBetween('check_in_date', [$windowStart, $windowEnd])
            ->get(['total_amount']);

        $bookingCount = $bookingRows->count();
        $adr = $bookingCount > 0 ? round((float) $bookingRows->avg('total_amount'), 2) : 0.0;
        $revpar = $roomCount > 0
            ? round($bookingTotal / ($roomCount * self::WINDOW_DAYS), 2)
            : 0.0;

        $segments = [
            ['key' => 'rooms', 'label' => 'Room stays (check-ins)', 'amount' => round($bookingTotal, 2)],
            ['key' => 'pulse', 'label' => 'PULSE pricing & promos', 'amount' => round($pulseTotal, 2)],
            ['key' => 'comps', 'label' => 'Discounts & comps', 'amount' => round($discountTotal, 2)],
            ['key' => 'other_ai', 'label' => 'Other AI-logged impact', 'amount' => round($otherAgent, 2)],
        ];

        $snapshotNote = $bookingTotal > 0 || $agentTotal != 0.0
            ? 'Bookings by check-in day plus logged AI revenue impact (agent actions). Not a full accounting ledger.'
            : 'No bookings or agent revenue rows in this window yet — numbers stay at zero until data exists.';

        return [
            'currency' => self::CURRENCY,
            'periodLabel' => 'Last '.self::WINDOW_DAYS.' days',
            'generatedAt' => Carbon::now($tz)->toIso8601String(),
            'snapshotNote' => $snapshotNote,
            'kpis' => [
                'totalRevenue' => round($total, 2),
                'wowChangePct' => $wow,
                'adr' => $adr,
                'revpar' => $revpar,
                'occupancyPct' => $occupancy,
                'pulseAttributed' => round($pulseTotal, 2),
            ],
            'daily' => $daily,
            'segments' => $segments,
            'scenarios' => self::scenariosFromDaily($daily),
            'aiOverview' => self::aiOverview($total, $wow, $pulseTotal, $bookingTotal, $agentTotal),
            'staffActions' => self::staffActions($wow, $pulseTotal, $bookingCount),
        ];
    }

    /**
     * @return list<array{date: string, shortLabel: string, revenue: float, event: string|null}>
     */
    private static function dailySeries(Carbon $start, Carbon $endInclusive): array
    {
        $bookingByDate = self::bookingTotalsByCheckInDate($start, $endInclusive);
        $agentByDate = self::agentTotalsByFiredDate($start, $endInclusive);

        $out = [];
        $cursor = $start->copy();
        while ($cursor->lte($endInclusive)) {
            $key = $cursor->toDateString();
            $revenue = round((float) ($bookingByDate[$key] ?? 0) + (float) ($agentByDate[$key] ?? 0), 2);
            $out[] = [
                'date' => $key,
                'shortLabel' => $cursor->format('M j'),
                'revenue' => $revenue,
                'event' => null,
            ];
            $cursor->addDay();
        }

        self::attachPeakEvents($out);

        return $out;
    }

    /**
     * @param  array<int, array{date: string, shortLabel: string, revenue: float, event: string|null}>  $daily
     */
    private static function attachPeakEvents(array &$daily): void
    {
        $indexed = [];
        foreach ($daily as $i => $row) {
            if ($row['revenue'] > 0) {
                $indexed[] = ['i' => $i, 'rev' => $row['revenue']];
            }
        }

        if ($indexed === []) {
            return;
        }

        usort($indexed, static fn (array $a, array $b): int => $b['rev'] <=> $a['rev']);
        $top = array_slice($indexed, 0, 3);

        foreach ($top as $rank => $item) {
            $i = $item['i'];
            $daily[$i]['event'] = ($rank === 0 ? 'Strongest day in window' : 'Top day in window').' · '.$daily[$i]['shortLabel'];
        }
    }

    /**
     * @return array<string, float>
     */
    private static function bookingTotalsByCheckInDate(Carbon $start, Carbon $endInclusive): array
    {
        $map = [];
        $rows = Booking::query()
            ->whereBetween('check_in_date', [$start->copy()->startOfDay(), $endInclusive->copy()->endOfDay()])
            ->get(['check_in_date', 'total_amount']);

        foreach ($rows as $row) {
            $key = $row->check_in_date->timezone(config('app.timezone'))->toDateString();
            $map[$key] = ($map[$key] ?? 0) + (float) $row->total_amount;
        }

        return $map;
    }

    /**
     * @return array<string, float>
     */
    private static function agentTotalsByFiredDate(Carbon $start, Carbon $endInclusive): array
    {
        $map = [];
        $rows = AgentAction::query()
            ->whereBetween('fired_at', [$start->copy()->startOfDay(), $endInclusive->copy()->endOfDay()])
            ->get(['fired_at', 'revenue_impact']);

        foreach ($rows as $row) {
            if ($row->fired_at === null) {
                continue;
            }
            $key = $row->fired_at->timezone(config('app.timezone'))->toDateString();
            $map[$key] = ($map[$key] ?? 0) + (float) $row->revenue_impact;
        }

        return $map;
    }

    private static function bookingRevenueSum(Carbon $start, Carbon $end): float
    {
        return (float) Booking::query()
            ->whereBetween('check_in_date', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->sum('total_amount');
    }

    /**
     * @param  list<array{date: string, shortLabel: string, revenue: float, event: string|null}>  $daily
     * @return list<array{id: string, title: string, dayLabel: string, impact: float, tag: string, story: string}>
     */
    private static function scenariosFromDaily(array $daily): array
    {
        $sorted = $daily;
        usort($sorted, static fn (array $a, array $b): int => $b['revenue'] <=> $a['revenue']);
        $top = array_slice($sorted, 0, 3);
        $out = [];
        $i = 0;
        foreach ($top as $row) {
            if ($row['revenue'] <= 0) {
                continue;
            }
            $i++;
            $medianApprox = Collection::make(array_column($daily, 'revenue'))->avg() ?? 0.0;
            $lift = max(0.0, $row['revenue'] - (float) $medianApprox);
            $out[] = [
                'id' => 'peak-'.$row['date'],
                'title' => $i === 1 ? 'Largest combined day in window' : 'Elevated day vs average',
                'dayLabel' => $row['shortLabel'],
                'impact' => round($lift, 2),
                'tag' => $i === 1 ? 'Peak' : 'Lift',
                'story' => 'Sum of room check-ins and logged AI revenue impact for this calendar day. Compare with guest messages, promos, and group blocks in your PMS.',
            ];
        }

        return $out;
    }

    /**
     * @return array{headline: string, summary: string, bullets: list<string>, watchlist: list<string>, confidence: string}
     */
    private static function aiOverview(
        float $total,
        float $wow,
        float $pulseTotal,
        float $bookingTotal,
        float $agentTotal,
    ): array {
        $fmt = fn (float $n): string => number_format($n, 0, '.', ',');

        $pulseShare = $total > 0 ? round(abs($pulseTotal) / $total * 100, 1) : 0.0;

        return [
            'headline' => $wow >= 0
                ? 'Trailing window is flat or up versus the prior month'
                : 'Trailing window is softer than the prior month — worth a focused recovery check',
            'summary' => 'Figures combine room booking totals (by check-in date) with revenue impact recorded on AI agent actions. Use them as an operational mirror, not audited financials.',
            'bullets' => [
                'Combined window total: '.$fmt($total).' '.self::CURRENCY.' (about '.$wow.'% vs the previous '.self::WINDOW_DAYS.' days).',
                'Room check-ins in window: '.$fmt($bookingTotal).' '.self::CURRENCY.'; AI-logged impact: '.$fmt($agentTotal).' '.self::CURRENCY.'.',
                $pulseTotal != 0.0
                    ? 'PULSE-style actions account for about '.$pulseShare.'% of the combined total — validate with finance before external quotes.'
                    : 'No PULSE-class actions in this window yet; pricing and promo lifts will appear here when agents run those tools.',
            ],
            'watchlist' => [
                'Days tagged as peaks — align with group blocks, incidents, and marketing sends.',
                'Discount and comp volume versus PULSE uplift (both come from the same agent log).',
                'RevPAR from bookings only; occupancy reflects live room flags in ARIA.',
            ],
            'confidence' => 'ops-sourced',
        ];
    }

    /**
     * @return list<string>
     */
    private static function staffActions(float $wow, float $pulseTotal, int $bookingCount): array
    {
        $actions = [
            'Cross-check peak days against the guest and issues lists for service load.',
        ];

        if ($wow < 0) {
            $actions[] = 'Window is down vs last month — review open incidents and recovery comps.';
        }

        if ($pulseTotal > 0) {
            $actions[] = 'After PULSE promos, watch attach rate on F&B and spa within a few hours.';
        }

        if ($bookingCount === 0) {
            $actions[] = 'No check-ins in this window in ARIA yet — seed bookings or connect your PMS feed when ready.';
        }

        return $actions;
    }
}
