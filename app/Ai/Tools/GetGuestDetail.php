<?php

namespace App\Ai\Tools;

use App\Ai\Support\ToolJsonResponse;
use App\Models\Guest;
use App\Support\OpsData;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

/**
 * Read-only: full guest profile including bookings, incidents, and agent actions.
 */
class GetGuestDetail implements Tool
{
    public const NAME = 'get_guest_detail';

    public function description(): Stringable|string
    {
        return 'Load one guest by UUID (primary key) or exact full name when it matches exactly one guest. Returns contact, preferences, bookings, incidents, recent agent actions.';
    }

    public function handle(Request $request): Stringable|string
    {
        $guestIdRaw = (string) ($request['guest_id'] ?? '');

        if ($guestIdRaw === '') {
            return ToolJsonResponse::error('guest_id is required.');
        }

        $guest = Guest::resolveFromAgentGuestId($guestIdRaw);
        if (! $guest) {
            return ToolJsonResponse::error('Guest not found or ambiguous name.');
        }

        return ToolJsonResponse::ok([
            'guest' => OpsData::guestDetail($guest),
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'guest_id' => $schema->string()->required(),
        ];
    }
}
