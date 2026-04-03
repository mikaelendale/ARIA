<?php

namespace App\Ai\Tools;

use App\Ai\Support\RecordsAgentActions;
use App\Ai\Support\ToolJsonResponse;
use App\Models\Guest;
use App\Models\Incident;
use App\Services\TwilioService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;
use Throwable;

class ApplyDiscount implements Tool
{
    public const NAME = 'apply_discount';

    public function __construct(
        protected TwilioService $twilio,
        protected RecordsAgentActions $actions,
    ) {}

    public function description(): Stringable|string
    {
        return 'Apply a discount or compensation to a guest and record it as a revenue incident.';
    }

    public function handle(Request $request): Stringable|string
    {
        $guestId = (string) ($request['guest_id'] ?? '');
        $amount = $request['amount'] ?? null;
        $reason = (string) ($request['reason'] ?? '');

        if ($guestId === '' || ! is_numeric($amount) || $reason === '') {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'invalid parameters');

            return ToolJsonResponse::error('guest_id, amount, and reason are required.');
        }

        $amountDecimal = number_format((float) $amount, 2, '.', '');
        $guest = Guest::resolveFromAgentGuestId($guestId);
        if (! $guest) {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'guest not found', guestId: null);

            return ToolJsonResponse::error('Guest not found.');
        }

        $canonicalId = $guest->id;

        $incident = Incident::query()->create([
            'guest_id' => $canonicalId,
            'type' => 'revenue',
            'trigger_source' => 'manual',
            'severity' => 'medium',
            'description' => "Discount applied: {$reason}",
            'context' => [
                'discount_amount' => $amountDecimal,
                'reason' => $reason,
            ],
            'status' => 'open',
        ]);

        $negativeImpact = '-'.$amountDecimal;

        $message = "Dear {$guest->name}, thank you for staying with us at Kuriftu. We've applied an ETB {$amountDecimal} courtesy adjustment to your folio ({$reason}). If anything still feels off, reply here and we'll make it right.";

        try {
            $sid = $this->twilio->sendWhatsapp($guest->phone, $message);
        } catch (Throwable $e) {
            $this->actions->record(
                self::NAME,
                $request->all(),
                'error',
                result: $e->getMessage(),
                guestId: $canonicalId,
                incidentId: $incident->id,
                revenueImpact: $negativeImpact,
            );

            return ToolJsonResponse::error($e->getMessage());
        }

        $this->actions->record(
            self::NAME,
            $request->all(),
            'ok',
            result: $sid,
            guestId: $canonicalId,
            incidentId: $incident->id,
            revenueImpact: $negativeImpact,
        );

        return ToolJsonResponse::ok([
            'incident_id' => $incident->id,
            'twilio_sid' => $sid,
            'revenue_impact' => $negativeImpact,
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'guest_id' => $schema->string()->required(),
            'amount' => $schema->number()->required(),
            'reason' => $schema->string()->required(),
        ];
    }
}
