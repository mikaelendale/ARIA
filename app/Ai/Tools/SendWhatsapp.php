<?php

namespace App\Ai\Tools;

use App\Ai\Support\RecordsAgentActions;
use App\Ai\Support\ToolJsonResponse;
use App\Models\Guest;
use App\Services\TwilioService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;
use Throwable;

class SendWhatsapp implements Tool
{
    public const NAME = 'send_whatsapp';

    public function __construct(
        protected TwilioService $twilio,
        protected RecordsAgentActions $actions,
    ) {}

    public function description(): Stringable|string
    {
        return 'Send WhatsApp to a guest. guest_id must be the UUID from orchestrator context, or an exact full name if it matches a single guest.';
    }

    public function handle(Request $request): Stringable|string
    {
        $guestIdRaw = (string) ($request['guest_id'] ?? '');
        $message = (string) ($request['message'] ?? '');

        if ($guestIdRaw === '' || $message === '') {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'missing guest_id or message');

            return ToolJsonResponse::error('guest_id and message are required.');
        }

        $guest = Guest::resolveFromAgentGuestId($guestIdRaw);
        if (! $guest) {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'guest not found', guestId: null);

            return ToolJsonResponse::error('Guest not found.');
        }

        $canonicalId = $guest->id;

        try {
            $sid = $this->twilio->sendWhatsapp($guest->phone, $message);
        } catch (Throwable $e) {
            $this->actions->record(self::NAME, $request->all(), 'error', result: $e->getMessage(), guestId: $canonicalId);

            return ToolJsonResponse::error($e->getMessage());
        }

        $this->actions->record(self::NAME, $request->all(), 'ok', result: $sid, guestId: $canonicalId);

        return ToolJsonResponse::ok(['twilio_sid' => $sid, 'guest_id' => $canonicalId]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'guest_id' => $schema->string()->description('Guest UUID from context "Tool contract", or exact full name if unique.')->required(),
            'message' => $schema->string()->required(),
        ];
    }
}
