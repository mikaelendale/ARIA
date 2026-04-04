<?php

namespace Database\Seeders;

use App\Models\AgentAction;
use App\Models\Guest;
use App\Models\Incident;
use App\Models\Room;
use App\Models\RoomServiceOrder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Seeds a coherent “last few hours” story: Sentinel / NEXUS / Pulse / Vera / Echo / Orchestrator
 * handling real-looking incidents. Safe to re-run after migrate:fresh (clears prior demo rows).
 */
class DemoStorySeeder extends Seeder
{
    public function run(): void
    {
        AgentAction::query()->delete();
        Incident::query()->delete();
        RoomServiceOrder::query()->delete();

        $guests = Guest::query()
            ->whereNotNull('room_number')
            ->orderBy('room_number')
            ->limit(10)
            ->get();

        if ($guests->count() < 6) {
            $this->command?->warn('DemoStorySeeder skipped: need guests with room numbers (run GuestSeeder first).');

            return;
        }

        $this->seedOccupancy();
        $this->tuneGuestChurnScores($guests);

        $g = static fn (int $i): Guest => $guests[$i];

        $iDelay = Incident::query()->create([
            'guest_id' => $g(0)->id,
            'type' => 'service_delay',
            'trigger_source' => 'sentinel',
            'severity' => 'high',
            'description' => 'Breakfast order for '.$g(0)->room_number.' is 52 minutes past SLA; guest messaged reception.',
            'context' => ['channel' => 'in_room_dining', 'sla_minutes' => 45],
            'status' => 'open',
            'review_fingerprint' => null,
        ]);

        $iAc = Incident::query()->create([
            'guest_id' => $g(1)->id,
            'type' => 'maintenance',
            'trigger_source' => 'whatsapp',
            'severity' => 'medium',
            'description' => 'Guest in '.$g(1)->room_number.' reports AC compressor noise overnight.',
            'context' => ['category' => 'hvac'],
            'status' => 'open',
            'review_fingerprint' => null,
        ]);

        $iSocial = Incident::query()->create([
            'guest_id' => null,
            'type' => 'reputation',
            'trigger_source' => 'social',
            'severity' => 'high',
            'description' => 'Public post: “Cold mains at lakeview dinner — embarrassed in front of clients.”',
            'context' => ['source' => 'twitter', 'handle' => '@biztravel_et'],
            'status' => 'investigating',
            'review_fingerprint' => hash('sha256', 'demo|twitter|cold_food|2026-03-28'),
        ]);

        $iLaundry = Incident::query()->create([
            'guest_id' => $g(2)->id,
            'type' => 'service_delay',
            'trigger_source' => 'system',
            'severity' => 'low',
            'description' => 'Express laundry for '.$g(2)->room_number.' not returned by promised 14:00.',
            'context' => ['department' => 'housekeeping'],
            'status' => 'open',
            'review_fingerprint' => null,
        ]);

        $iResolvedBill = Incident::query()->create([
            'guest_id' => $g(3)->id,
            'type' => 'complaint',
            'trigger_source' => 'whatsapp',
            'severity' => 'medium',
            'description' => 'Minibar charge dispute — guest states items were not consumed.',
            'context' => ['amount_etb' => 890],
            'status' => 'resolved',
            'resolution_time_seconds' => 1860,
            'resolved_at' => now()->subHours(2),
            'review_fingerprint' => null,
        ]);

        $iResolvedLeak = Incident::query()->create([
            'guest_id' => $g(4)->id,
            'type' => 'maintenance',
            'trigger_source' => 'whatsapp',
            'severity' => 'high',
            'description' => 'Shower leak in '.$g(4)->room_number.' — maintenance visit completed.',
            'context' => ['ticket' => 'MT-44821'],
            'status' => 'resolved',
            'resolution_time_seconds' => 4200,
            'resolved_at' => now()->subHours(5)->addMinutes(12),
            'review_fingerprint' => null,
        ]);

        $tz = config('app.timezone');
        $t = static fn (string $expr): Carbon => Carbon::parse($expr, $tz);

        $rows = [
            // Pulse — occupancy / yield (no incident)
            [$g(5)->id, null, 'pulse', 'adjust_pricing', 'Raised BAR for deluxe +8% while occupancy > 62%; villas held flat for VIP mix.', 12800.0, $t('-4 hours 35 minutes'), ['scope' => 'kuriftu_lakeside']],
            [$g(5)->id, null, 'pulse', 'send_promo', 'Targeted spa add-on WhatsApp to guests in-house >2 nights (quiet hours respected).', 4200.0, $t('-4 hours 12 minutes'), ['campaign' => 'spa_evening']],

            // Resolved maintenance trail
            [$g(4)->id, $iResolvedLeak->id, 'sentinel', 'log_incident', 'Maintenance ticket MT-44821 linked to guest thread; priority high.', 0.0, $t('-5 hours 42 minutes'), []],
            [$g(4)->id, $iResolvedLeak->id, 'nexus', 'ping_kitchen', 'Not applicable — rerouted to engineering channel (housekeeping notified).', 0.0, $t('-5 hours 38 minutes'), []],
            [$g(4)->id, $iResolvedLeak->id, 'nexus', 'alert_manager', 'Duty manager paged; technician dispatched to '.$g(4)->room_number.'.', 0.0, $t('-5 hours 36 minutes'), []],
            [$g(4)->id, $iResolvedLeak->id, 'orchestrator', 'send_whatsapp', 'Warm update to guest: technician en route, estimated 25 minutes, compensation drink offer.', 0.0, $t('-5 hours 35 minutes'), []],
            [$g(4)->id, $iResolvedLeak->id, 'orchestrator', 'escalate_to_human', 'Engineering marked resolved; guest acknowledged on WhatsApp.', 0.0, $t('-5 hours 7 minutes'), []],

            // Resolved billing / Vera touch
            [$g(3)->id, $iResolvedBill->id, 'vera', 'send_promo', 'Churn watch: post-resolution loyalty touch — spa credit link, no hard sell.', -150.0, $t('-3 hours 40 minutes'), []],
            [$g(3)->id, $iResolvedBill->id, 'orchestrator', 'apply_discount', 'Applied minibar waiver ETB 890 + dessert amenity voucher.', -890.0, $t('-3 hours 22 minutes'), []],
            [$g(3)->id, $iResolvedBill->id, 'orchestrator', 'send_whatsapp', 'Professional apology: charge reversed, voucher added, front desk briefed.', 0.0, $t('-3 hours 20 minutes'), []],

            // Social / Echo (no linked in-house guest — reputation incident)
            [null, $iSocial->id, 'echo', 'draft_reply', 'Draft public reply: acknowledge service miss, invite offline DM, comp manager review.', 0.0, $t('-2 hours 55 minutes'), []],
            [null, $iSocial->id, 'orchestrator', 'draft_reply', 'Internal recovery note drafted for F&B lead with table/time fingerprint.', 0.0, $t('-2 hours 48 minutes'), []],
            [null, $iSocial->id, 'orchestrator', 'send_whatsapp', 'Proactive outreach to identified booker: recovery meal + priority seating tonight.', 2800.0, $t('-2 hours 40 minutes'), []],

            // Active breakfast delay — full NEXUS chain
            [$g(0)->id, $iDelay->id, 'sentinel', 'log_incident', 'SLA breach: room service order >45m pending for '.$g(0)->room_number.'.', 0.0, $t('-48 minutes'), []],
            [$g(0)->id, $iDelay->id, 'nexus', 'ping_kitchen', 'Kitchen display bumped; runner assigned; ETA 11 minutes to room.', 0.0, $t('-44 minutes'), []],
            [$g(0)->id, $iDelay->id, 'nexus', 'alert_manager', 'F&B supervisor alerted with order id + guest language preference (EN).', 0.0, $t('-42 minutes'), []],
            [$g(0)->id, $iDelay->id, 'orchestrator', 'send_whatsapp', 'Guest message: we are expediting breakfast, complimentary juice, sincere apology.', 0.0, $t('-41 minutes'), []],

            // AC noise — in progress
            [$g(1)->id, $iAc->id, 'hermes', 'log_incident', 'Voice note transcribed: AC noise complaint; created maintenance incident.', 0.0, $t('-38 minutes'), []],
            [$g(1)->id, $iAc->id, 'nexus', 'alert_manager', 'Engineering queue updated; quiet hours maintenance policy applied.', 0.0, $t('-35 minutes'), []],
            [$g(1)->id, $iAc->id, 'orchestrator', 'send_whatsapp', 'Guest notified: technician will inspect after 15:00 or sooner if room vacant.', 0.0, $t('-33 minutes'), []],

            // Laundry delay
            [$g(2)->id, $iLaundry->id, 'sentinel', 'log_incident', 'Housekeeping SLA warning: express laundry past promise time.', 0.0, $t('-28 minutes'), []],
            [$g(2)->id, $iLaundry->id, 'nexus', 'ping_kitchen', ' Routed to laundry lead (wrong department auto-corrected in playbook).', 0.0, $t('-26 minutes'), []],
            [$g(2)->id, $iLaundry->id, 'orchestrator', 'send_whatsapp', 'Guest update: garments on cart, delivery in ~8 minutes + late-service credit.', 350.0, $t('-22 minutes'), []],

            // Vera property scan
            [$g(6)->id, null, 'vera', 'send_promo', 'Portfolio scan: 3 soft-signal guests — quiet WhatsApp check-in only; thresholds OK.', 0.0, $t('-18 minutes'), []],
            [$g(7)->id, null, 'vera', 'book_experience', 'VIP '.$g(7)->name.' — positive F&B signal; suggested Lake Tana tour, concierge follow-up.', 1200.0, $t('-14 minutes'), []],

            // Latest heartbeat
            [$g(0)->id, null, 'orchestrator', 'log_incident', 'Orchestrator heartbeat: queues healthy; last cross-agent handoff '.$g(0)->room_number.' breakfast thread.', 0.0, $t('-3 minutes'), []],
        ];

        foreach ($rows as $row) {
            [$guestId, $incidentId, $agent, $tool, $result, $revenue, $firedAt, $payload] = $row;

            AgentAction::query()->create([
                'guest_id' => $guestId,
                'incident_id' => $incidentId,
                'agent_name' => $agent,
                'tool_called' => $tool,
                'payload' => array_merge(['demo_seed' => true], $payload),
                'status' => 'completed',
                'result' => $result,
                'revenue_impact' => $revenue,
                'fired_at' => $firedAt,
            ]);
        }

        $this->seedRoomServiceOrders($guests);
    }

    /**
     * @param  Collection<int, Guest>  $guests
     */
    protected function tuneGuestChurnScores($guests): void
    {
        $targets = [72, 48, 61, 35, 42, 55, 28, 66];
        foreach ($targets as $i => $score) {
            if (! isset($guests[$i])) {
                break;
            }

            $guests[$i]->forceFill(['churn_risk_score' => $score])->saveQuietly();
        }
    }

    protected function seedOccupancy(): void
    {
        Room::query()->update([
            'is_occupied' => false,
            'status' => 'available',
        ]);

        for ($i = 1; $i <= 52; $i++) {
            Room::query()->where('number', sprintf('KV-%03d', $i))->update([
                'is_occupied' => true,
                'status' => 'occupied',
            ]);
        }
    }

    /**
     * @param  Collection<int, Guest>  $guests
     */
    protected function seedRoomServiceOrders($guests): void
    {
        $menus = [
            'Injera breakfast platter + shiro',
            'Fresh juice + omelette',
            'Villa dinner — tibs + sides',
            'Late-night soup + bread',
        ];

        foreach ([0, 1, 3, 5] as $idx) {
            if (! isset($guests[$idx])) {
                continue;
            }

            $guest = $guests[$idx];
            RoomServiceOrder::query()->create([
                'guest_id' => $guest->id,
                'room_number' => (string) $guest->room_number,
                'items' => $menus[$idx % count($menus)],
                'status' => 'delivered',
                'placed_at' => now()->subHours(6 - $idx),
                'delivered_at' => now()->subHours(5 - $idx),
            ]);
        }

        RoomServiceOrder::query()->create([
            'guest_id' => $guests[0]->id,
            'room_number' => (string) $guests[0]->room_number,
            'items' => $menus[0],
            'status' => 'pending',
            'placed_at' => now()->subMinutes(48),
            'delivered_at' => null,
        ]);

        RoomServiceOrder::query()->create([
            'guest_id' => $guests[2]->id,
            'room_number' => (string) $guests[2]->room_number,
            'items' => $menus[2],
            'status' => 'pending',
            'placed_at' => now()->subMinutes(95),
            'delivered_at' => null,
        ]);
    }
}
