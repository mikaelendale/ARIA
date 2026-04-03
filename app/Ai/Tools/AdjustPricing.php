<?php

namespace App\Ai\Tools;

use App\Ai\Support\RecordsAgentActions;
use App\Ai\Support\ToolJsonResponse;
use App\Events\PricingAdjusted;
use App\Models\Room;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Event;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class AdjustPricing implements Tool
{
    public const NAME = 'adjust_pricing';

    public function __construct(
        protected RecordsAgentActions $actions,
    ) {}

    public function description(): Stringable|string
    {
        return 'Adjust current_price for all rooms of a given room type and record aggregate revenue impact.';
    }

    public function handle(Request $request): Stringable|string
    {
        $roomType = (string) ($request['room_type'] ?? '');
        $newPrice = $request['new_price'] ?? null;
        $reason = (string) ($request['reason'] ?? '');

        if ($roomType === '' || ! is_numeric($newPrice) || $reason === '') {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'invalid parameters');

            return ToolJsonResponse::error('room_type, new_price, and reason are required.');
        }

        $newPriceDecimal = (string) number_format((float) $newPrice, 2, '.', '');

        $rooms = Room::query()->where('type', $roomType)->get();
        if ($rooms->isEmpty()) {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'no rooms for type');

            return ToolJsonResponse::error('No rooms found for that room type.');
        }

        $delta = '0.00';
        foreach ($rooms as $room) {
            $old = (string) $room->current_price;
            $per = bcsub($newPriceDecimal, $old, 2);
            $delta = bcadd($delta, $per, 2);
            $room->current_price = $newPriceDecimal;
            $room->save();
        }

        $this->actions->record(
            self::NAME,
            array_merge($request->all(), ['rooms_updated' => $rooms->count()]),
            'ok',
            result: 'pricing updated',
            revenueImpact: $delta,
            agentName: 'pulse',
        );

        Event::dispatch(new PricingAdjusted(amount: (float) $delta));

        return ToolJsonResponse::ok([
            'rooms_updated' => $rooms->count(),
            'revenue_impact' => $delta,
            'reason' => $reason,
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'room_type' => $schema->string()->required(),
            'new_price' => $schema->number()->required(),
            'reason' => $schema->string()->required(),
        ];
    }
}
