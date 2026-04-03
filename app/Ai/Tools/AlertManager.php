<?php

namespace App\Ai\Tools;

use App\Ai\Support\RecordsAgentActions;
use App\Ai\Support\ToolJsonResponse;
use App\Models\Staff;
use App\Services\TwilioService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;
use Throwable;

class AlertManager implements Tool
{
    public const NAME = 'alert_manager';

    public function __construct(
        protected TwilioService $twilio,
        protected RecordsAgentActions $actions,
    ) {}

    public function description(): Stringable|string
    {
        return 'Escalate a critical issue to the hotel manager on duty.';
    }

    public function handle(Request $request): Stringable|string
    {
        $issue = (string) ($request['issue'] ?? '');
        $severity = (string) ($request['severity'] ?? '');
        $guestId = $request['guest_id'] ?? null;

        if ($issue === '' || $severity === '') {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'missing issue or severity');

            return ToolJsonResponse::error('issue and severity are required.');
        }

        $staff = Staff::query()
            ->where('department', 'management')
            ->where('is_available', true)
            ->first();

        if (! $staff) {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'no available manager');

            return ToolJsonResponse::error('No available management staff found.');
        }

        $guestPart = $guestId ? " Guest id: {$guestId}." : '';
        $body = "[{$severity}] {$issue}{$guestPart}";

        try {
            $sid = $this->twilio->sendWhatsapp($staff->phone, $body);
        } catch (Throwable $e) {
            $this->actions->record(self::NAME, $request->all(), 'error', result: $e->getMessage(), guestId: is_string($guestId) ? $guestId : null);

            return ToolJsonResponse::error($e->getMessage());
        }

        $this->actions->record(self::NAME, $request->all(), 'ok', result: $sid, guestId: is_string($guestId) ? $guestId : null);

        return ToolJsonResponse::ok(['twilio_sid' => $sid, 'staff_id' => $staff->id]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'issue' => $schema->string()->required(),
            'severity' => $schema->string()->required(),
            'guest_id' => $schema->string(),
        ];
    }
}
