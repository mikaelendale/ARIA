<?php

namespace App\Support;

use Illuminate\Support\Carbon;

/**
 * Deterministic demo revenue analytics for the staff Revenue page (not live accounting data).
 */
class RevenueDemoData
{
    public const CURRENCY = 'ETB';

    /**
     * @return array<string, mixed>
     */
    public static function payload(): array
    {
        $tz = config('app.timezone');
        $today = Carbon::now($tz)->startOfDay();

        $daily = self::dailySeries($today);
        $total = array_sum(array_column($daily, 'revenue'));
        $prevWindow = self::dailySeries($today->copy()->subDays(30));
        $prevTotal = array_sum(array_column($prevWindow, 'revenue'));
        $wow = $prevTotal > 0 ? round(100 * ($total - $prevTotal) / $prevTotal, 1) : 0.0;

        $segments = [
            ['key' => 'rooms', 'label' => 'Rooms & suites', 'amount' => round($total * 0.52, 2)],
            ['key' => 'fb', 'label' => 'Food & beverage', 'amount' => round($total * 0.28, 2)],
            ['key' => 'spa', 'label' => 'Spa & wellness', 'amount' => round($total * 0.12, 2)],
            ['key' => 'exp', 'label' => 'Experiences & tours', 'amount' => round($total * 0.08, 2)],
        ];

        $pulseAttributed = round($total * 0.047, 2);

        return [
            'currency' => self::CURRENCY,
            'periodLabel' => 'Last 30 days',
            'generatedAt' => Carbon::now($tz)->toIso8601String(),
            'kpis' => [
                'totalRevenue' => round($total, 2),
                'wowChangePct' => $wow,
                'adr' => 4280.0,
                'revpar' => 3120.0,
                'occupancyPct' => 78.4,
                'pulseAttributed' => $pulseAttributed,
            ],
            'daily' => $daily,
            'segments' => $segments,
            'scenarios' => self::scenarios($today->copy()),
            'aiOverview' => self::aiOverview($total, $wow, $pulseAttributed),
            'staffActions' => [
                'Hold brief F&B stand-up before Friday dinner rush — demo data shows recurring Friday lift.',
                'Keep spa add-on offers active for guests with no restaurant visit by day two (pattern from similar resorts).',
                'When PULSE runs a promo, monitor restaurant attach rate within 4 hours; that is where leakage shows up first.',
            ],
        ];
    }

    /**
     * @return list<array{date: string, shortLabel: string, revenue: float, event: string|null}>
     */
    private static function dailySeries(Carbon $endExclusive): array
    {
        $out = [];
        for ($i = 29; $i >= 0; $i--) {
            $d = $endExclusive->copy()->subDays($i);
            $dow = (int) $d->format('N');
            $base = 82000 + ($dow >= 6 ? 22000 : 0);
            $wave = (sin($i / 4.5) + 1) * 6500;
            $revenue = $base + $wave;

            $event = null;
            if ($i === 22) {
                $revenue += 198000;
                $event = 'Corporate retreat — 86 rooms + banquet';
            } elseif ($i === 15) {
                $revenue += 42000;
                $event = 'Ethiopian New Year package surge';
            } elseif ($i === 6) {
                $revenue += 28000;
                $event = 'Airport delays — walk-in F&B';
            }

            $out[] = [
                'date' => $d->toDateString(),
                'shortLabel' => $d->format('M j'),
                'revenue' => round($revenue, 2),
                'event' => $event,
            ];
        }

        return $out;
    }

    /**
     * @return list<array{id: string, title: string, dayLabel: string, impact: float, tag: string, story: string}>
     */
    private static function scenarios(Carbon $anchor): array
    {
        return [
            [
                'id' => 's1',
                'title' => 'Conference block fills midweek',
                'dayLabel' => $anchor->copy()->subDays(22)->format('M j'),
                'impact' => 198000,
                'tag' => 'Group sales',
                'story' => 'A tech offsite booked the lake wing plus two banquet nights. Room revenue spiked before F&B caught up — typical for midweek B2B.',
            ],
            [
                'id' => 's2',
                'title' => 'Holiday package outperforming BAR',
                'dayLabel' => $anchor->copy()->subDays(15)->format('M j'),
                'impact' => 42000,
                'tag' => 'PULSE pricing',
                'story' => 'Bundled spa + dinner outperformed best available rate by 18% on equivalent room types after a short promo window.',
            ],
            [
                'id' => 's3',
                'title' => 'Weather + flight stack',
                'dayLabel' => $anchor->copy()->subDays(6)->format('M j'),
                'impact' => 28000,
                'tag' => 'Ops',
                'story' => 'Storm delays increased same-day restaurant covers and minibar — unplanned but repeatable when arrivals bunch up.',
            ],
        ];
    }

    /**
     * @return array{headline: string, summary: string, bullets: list<string>, watchlist: list<string>, confidence: string}
     */
    private static function aiOverview(float $total, float $wow, float $pulseAttributed): array
    {
        $fmt = fn (float $n): string => number_format($n, 0, '.', ',');

        return [
            'headline' => $wow >= 0
                ? 'Revenue is trending above the prior window'
                : 'Revenue is soft versus the prior window — worth a targeted recovery play',
            'summary' => 'This overview is generated from seeded demo patterns meant to train staff on how ARIA narrates money: spikes tied to explainable events, PULSE-attributed lift called out separately from base demand.',
            'bullets' => [
                "Trailing 30-day resort revenue (demo): {$fmt($total)} ETB, about {$wow}% vs the previous comparable window.",
                'Roughly '.round($pulseAttributed / max($total, 1) * 100, 1).'% of the window maps to PULSE-driven pricing and promo touches — sanity-check with finance before quoting externally.',
                'The largest single-day lift aligns with a group block + banquet pattern; ensure catering and housekeeping are pre-alerted for similar holds.',
            ],
            'watchlist' => [
                'Friday F&B attach rate vs rooms sold (demo series shows recurring weekend lift).',
                'Spa utilization when occupancy is high but ADR is flat — upsell leakage signal.',
                'Incident resolution time vs revenue on problem days (tie operational quality to money).',
            ],
            'confidence' => 'demo-seeded',
        ];
    }
}
