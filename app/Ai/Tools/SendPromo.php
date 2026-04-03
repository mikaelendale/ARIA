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

class SendPromo implements Tool
{
    public const NAME = 'send_promo';

    public function __construct(
        protected TwilioService $twilio,
        protected RecordsAgentActions $actions,
    ) {}

    public function description(): Stringable|string
    {
        return 'Send a promotional WhatsApp to guests filtered by target segment (one agent action per send).';
    }

    public function handle(Request $request): Stringable|string
    {
        $message = (string) ($request['message'] ?? '');
        $target = (string) ($request['target'] ?? '');

        if ($message === '' || $target === '') {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'missing fields');

            return ToolJsonResponse::error('message and target are required.');
        }

        $guests = match ($target) {
            'all_current' => Guest::query()
                ->whereNotNull('checked_in_at')
                ->whereNull('checked_out_at')
                ->get(),
            'past_guests' => Guest::query()->whereNotNull('checked_out_at')->get(),
            'vip_only' => Guest::query()->where('is_vip', true)->get(),
            default => null,
        };

        if ($guests === null) {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'unknown target');

            return ToolJsonResponse::error('target must be one of: all_current, past_guests, vip_only.');
        }

        if ($guests->isEmpty()) {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'no guests for target');

            return ToolJsonResponse::error('No matching guests for this target.');
        }

        $sent = 0;
        foreach ($guests as $guest) {
            try {
                $sid = $this->twilio->sendWhatsapp($guest->phone, $message);
                $this->actions->record(
                    self::NAME,
                    array_merge($request->all(), ['guest_id' => $guest->id]),
                    'ok',
                    result: $sid,
                    guestId: $guest->id,
                );
                $sent++;
            } catch (Throwable $e) {
                $this->actions->record(
                    self::NAME,
                    array_merge($request->all(), ['guest_id' => $guest->id]),
                    'error',
                    result: $e->getMessage(),
                    guestId: $guest->id,
                );
            }
        }

        return ToolJsonResponse::ok(['sent' => $sent, 'candidates' => $guests->count()]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'message' => $schema->string()->required(),
            'target' => $schema->string()->enum(['all_current', 'past_guests', 'vip_only'])->required(),
        ];
    }
}
