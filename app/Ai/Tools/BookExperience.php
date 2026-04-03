<?php

namespace App\Ai\Tools;

use App\Ai\Support\RecordsAgentActions;
use App\Ai\Support\ToolJsonResponse;
use App\Models\Experience;
use App\Models\ExperienceBooking;
use App\Models\Guest;
use App\Services\TwilioService;
use Carbon\Carbon;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Str;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;
use Throwable;

class BookExperience implements Tool
{
    public const NAME = 'book_experience';

    public function __construct(
        protected TwilioService $twilio,
        protected RecordsAgentActions $actions,
    ) {}

    public function description(): Stringable|string
    {
        return 'Book a spa, tour, or dining experience for a guest (stored in experience_bookings, not room stays).';
    }

    public function handle(Request $request): Stringable|string
    {
        $guestId = (string) ($request['guest_id'] ?? '');
        $experienceName = (string) ($request['experience_name'] ?? '');
        $scheduledRaw = $request['scheduled_at'] ?? null;
        $notes = $request['notes'] ?? null;

        if ($guestId === '' || $experienceName === '') {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'missing fields');

            return ToolJsonResponse::error('guest_id and experience_name are required.');
        }

        $guest = Guest::resolveFromAgentGuestId($guestId);
        if (! $guest) {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'guest not found', guestId: null);

            return ToolJsonResponse::error('Guest not found.');
        }

        $canonicalId = $guest->id;

        $experience = Experience::query()
            ->whereRaw('LOWER(name) = ?', [Str::lower($experienceName)])
            ->first();

        if (! $experience) {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'experience not found', guestId: $canonicalId);

            return ToolJsonResponse::error('Experience not found for that name.');
        }

        $scheduledAt = null;
        if (is_string($scheduledRaw) && $scheduledRaw !== '') {
            try {
                $scheduledAt = Carbon::parse($scheduledRaw);
            } catch (Throwable) {
                $this->actions->record(self::NAME, $request->all(), 'error', result: 'invalid scheduled_at', guestId: $canonicalId);

                return ToolJsonResponse::error('scheduled_at could not be parsed.');
            }
        }

        $booking = ExperienceBooking::query()->create([
            'guest_id' => $canonicalId,
            'experience_id' => $experience->id,
            'status' => 'confirmed',
            'scheduled_at' => $scheduledAt,
            'notes' => is_string($notes) ? $notes : null,
        ]);

        $when = $scheduledAt ? ' on '.$scheduledAt->toDateTimeString() : '';
        $message = "Your experience \"{$experience->name}\" is booked{$when}. We look forward to hosting you.";

        try {
            $sid = $this->twilio->sendWhatsapp($guest->phone, $message);
        } catch (Throwable $e) {
            $this->actions->record(self::NAME, $request->all(), 'error', result: $e->getMessage(), guestId: $canonicalId);

            return ToolJsonResponse::error($e->getMessage());
        }

        $this->actions->record(self::NAME, $request->all(), 'ok', result: $sid, guestId: $canonicalId);

        return ToolJsonResponse::ok([
            'experience_booking_id' => $booking->id,
            'experience_id' => $experience->id,
            'twilio_sid' => $sid,
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'guest_id' => $schema->string()->required(),
            'experience_name' => $schema->string()->required(),
            'scheduled_at' => $schema->string(),
            'notes' => $schema->string(),
        ];
    }
}
