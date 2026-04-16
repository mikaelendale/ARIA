<?php

namespace App\Support;

use App\Models\AgentAction;
use Illuminate\Support\Str;

/**
 * Builds dashboard-friendly lines for the action feed when {@see AgentAction::$result}
 * is only a technical id (UUID, Twilio SID) while the human context lives in {@see AgentAction::$payload}.
 */
final class AgentActionFeedMessage
{
    public static function forFeed(AgentAction $action): string
    {
        return PublicMessageSanitizer::forDisplay(self::rawForFeed($action));
    }

    /**
     * Human-readable line before {@see PublicMessageSanitizer} (tests may assert on raw shape).
     */
    public static function rawForFeed(AgentAction $action): string
    {
        $tool = (string) $action->tool_called;
        $result = trim((string) $action->result);
        $payload = is_array($action->payload) ? $action->payload : [];

        if ($tool === 'orchestration') {
            $event = (string) ($payload['event_type'] ?? '');
            $prefix = $event !== '' ? "[{$event}] " : '';
            $body = $result !== '' ? $result : self::genericPayloadLine($payload);

            return Str::limit($prefix.$body, 900);
        }

        $summary = match ($tool) {
            'send_whatsapp' => self::sendWhatsappSummary($action, $payload),
            'send_promo' => self::sendPromoSummary($payload),
            'ping_kitchen' => self::pingKitchenSummary($payload),
            'log_incident' => self::logIncidentSummary($payload),
            'adjust_pricing' => self::adjustPricingSummary($payload),
            'alert_manager' => self::alertManagerSummary($payload),
            'apply_discount' => self::applyDiscountSummary($action, $payload),
            'book_experience' => self::bookExperienceSummary($payload),
            'escalate_to_human' => self::escalateSummary($payload),
            'draft_reply' => self::draftReplySummary($payload),
            'kitchen_board_delivered' => $result !== '' ? $result : self::genericPayloadLine($payload),
            default => self::genericPayloadLine($payload),
        };

        $summary = trim($summary);

        if ($summary !== '' && self::isOpaqueReference($result)) {
            return Str::limit($summary.' · Ref '.self::compactRef($result), 900);
        }

        if ($summary !== '' && $result !== '' && ! str_contains($summary, $result)) {
            return Str::limit($summary.' — '.$result, 900);
        }

        if ($summary !== '') {
            return Str::limit($summary, 900);
        }

        return Str::limit($result !== '' ? $result : ucfirst((string) $action->status), 900);
    }

    private static function sendWhatsappSummary(AgentAction $action, array $payload): string
    {
        $msg = trim((string) ($payload['message'] ?? ''));
        $guest = $action->relationLoaded('guest') ? $action->guest : null;
        $who = $guest?->name ?? 'guest';

        if ($msg === '') {
            return "WhatsApp to {$who}";
        }

        return 'WhatsApp to '.$who.': '.Str::limit($msg, 220);
    }

    private static function sendPromoSummary(array $payload): string
    {
        $target = (string) ($payload['target'] ?? '');
        $msg = trim((string) ($payload['message'] ?? ''));
        $head = $target !== '' ? "Promo ({$target})" : 'Promo';

        if ($msg === '') {
            return $head;
        }

        return $head.': '.Str::limit($msg, 200);
    }

    private static function pingKitchenSummary(array $payload): string
    {
        $order = trim((string) ($payload['order_description'] ?? ''));
        $room = trim((string) ($payload['room_number'] ?? ''));
        $head = $room !== '' ? "Kitchen · Room {$room}" : 'Kitchen alert';

        if ($order === '') {
            return $head;
        }

        return $head.': '.Str::limit($order, 200);
    }

    private static function logIncidentSummary(array $payload): string
    {
        $type = (string) ($payload['type'] ?? '');
        $severity = (string) ($payload['severity'] ?? '');
        $desc = trim((string) ($payload['description'] ?? ''));
        $head = trim(implode(' · ', array_filter([$type, $severity !== '' ? "severity {$severity}" : ''])));

        if ($desc === '') {
            return $head !== '' ? "Incident: {$head}" : 'Incident logged';
        }

        return ($head !== '' ? "{$head}: " : 'Incident: ').Str::limit($desc, 280);
    }

    private static function adjustPricingSummary(array $payload): string
    {
        $rt = (string) ($payload['room_type'] ?? '');
        $price = $payload['new_price'] ?? null;
        $reason = trim((string) ($payload['reason'] ?? ''));
        $updated = $payload['rooms_updated'] ?? null;
        $parts = [];
        if ($rt !== '' && is_numeric($price)) {
            $parts[] = "{$rt} → ETB ".number_format((float) $price, 2);
        }
        if (is_numeric($updated)) {
            $parts[] = (int) $updated.' rooms';
        }
        if ($reason !== '') {
            $parts[] = Str::limit($reason, 120);
        }

        return $parts !== [] ? 'Pricing: '.implode(' · ', $parts) : '';
    }

    private static function alertManagerSummary(array $payload): string
    {
        $issue = trim((string) ($payload['issue'] ?? ''));
        $sev = (string) ($payload['severity'] ?? '');
        $head = $sev !== '' ? "[{$sev}] " : '';

        return $issue !== '' ? $head.Str::limit($issue, 240) : '';
    }

    private static function applyDiscountSummary(AgentAction $action, array $payload): string
    {
        $guest = $action->relationLoaded('guest') ? $action->guest : null;
        $who = $guest?->name ?? 'guest';
        $amount = $payload['amount'] ?? null;
        $reason = trim((string) ($payload['reason'] ?? ''));
        $amt = is_numeric($amount) ? 'ETB '.number_format((float) $amount, 2) : 'discount';

        return $reason !== ''
            ? "Discount for {$who} ({$amt}): ".Str::limit($reason, 160)
            : "Discount for {$who} ({$amt})";
    }

    private static function bookExperienceSummary(array $payload): string
    {
        $name = trim((string) ($payload['experience_name'] ?? ''));
        $when = trim((string) ($payload['scheduled_at'] ?? ''));

        if ($name === '') {
            return '';
        }

        return $when !== ''
            ? "Book experience: {$name} @ ".Str::limit($when, 40)
            : "Book experience: {$name}";
    }

    private static function escalateSummary(array $payload): string
    {
        $reason = trim((string) ($payload['reason'] ?? ''));

        return $reason !== '' ? 'Escalate: '.Str::limit($reason, 260) : '';
    }

    private static function draftReplySummary(array $payload): string
    {
        $text = trim((string) ($payload['review_text'] ?? ''));
        $rating = $payload['rating'] ?? null;
        $r = is_numeric($rating) ? ' (rating '.(string) $rating.')' : '';

        return $text !== '' ? 'Draft reply'.$r.': '.Str::limit($text, 200) : '';
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private static function genericPayloadLine(array $payload): string
    {
        $skip = [
            'guest_id', 'resolve_incident_id', 'nexus_context', 'incident_id',
            'batchId', 'commandName',
        ];
        $parts = [];
        foreach ($payload as $key => $value) {
            if (in_array($key, $skip, true)) {
                continue;
            }
            if (! is_scalar($value)) {
                continue;
            }
            $s = trim((string) $value);
            if ($s === '') {
                continue;
            }
            if (strlen($s) > 160) {
                $s = Str::limit($s, 160);
            }
            $label = str_replace('_', ' ', (string) $key);
            $parts[] = "{$label}: {$s}";
            if (count($parts) >= 6) {
                break;
            }
        }

        return implode(' · ', $parts);
    }

    private static function isOpaqueReference(string $value): bool
    {
        if (Str::isUuid($value)) {
            return true;
        }

        return (bool) preg_match('/^[A-Z]{2}[a-f0-9]{32}$/i', $value);
    }

    private static function compactRef(string $value): string
    {
        if (Str::isUuid($value)) {
            return substr($value, 0, 8).'…';
        }

        if (strlen($value) >= 8) {
            return substr($value, 0, 2).'…'.substr($value, -6);
        }

        return $value;
    }
}
