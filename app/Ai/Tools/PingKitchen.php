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

class PingKitchen implements Tool
{
    public const NAME = 'ping_kitchen';

    public function __construct(
        protected TwilioService $twilio,
        protected RecordsAgentActions $actions,
    ) {}

    public function description(): Stringable|string
    {
        return 'Alert kitchen staff about a delayed or urgent order.';
    }

    public function handle(Request $request): Stringable|string
    {
        $orderDescription = (string) ($request['order_description'] ?? '');
        $roomNumber = (string) ($request['room_number'] ?? '');

        if ($orderDescription === '') {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'missing order_description');

            return ToolJsonResponse::error('order_description is required.');
        }

        $staff = Staff::query()
            ->where('department', 'kitchen')
            ->where('is_available', true)
            ->first();

        if (! $staff) {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'no available kitchen staff');

            return ToolJsonResponse::error('No available kitchen staff found.');
        }

        $body = 'Kitchen alert'.($roomNumber !== '' ? " — Room {$roomNumber}" : '').": {$orderDescription}";

        try {
            $sid = $this->twilio->sendWhatsapp($staff->phone, $body);
        } catch (Throwable $e) {
            $this->actions->record(self::NAME, $request->all(), 'error', result: $e->getMessage());

            return ToolJsonResponse::error($e->getMessage());
        }

        $this->actions->record(self::NAME, $request->all(), 'ok', result: $sid);

        return ToolJsonResponse::ok(['twilio_sid' => $sid, 'staff_id' => $staff->id]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'order_description' => $schema->string()->required(),
            'room_number' => $schema->string(),
        ];
    }
}
