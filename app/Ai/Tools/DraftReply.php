<?php

namespace App\Ai\Tools;

use App\Ai\Agents\DraftReplyAssistant;
use App\Ai\Support\RecordsAgentActions;
use App\Ai\Support\ToolJsonResponse;
use App\Models\Incident;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;
use Throwable;

class DraftReply implements Tool
{
    public const NAME = 'draft_reply';

    public function __construct(
        protected DraftReplyAssistant $draftAssistant,
        protected RecordsAgentActions $actions,
    ) {}

    public function description(): Stringable|string
    {
        return 'Draft a management response to a guest review and store it as a reputation incident.';
    }

    public function handle(Request $request): Stringable|string
    {
        $reviewText = (string) ($request['review_text'] ?? '');
        $rating = $request['rating'] ?? null;

        if ($reviewText === '' || ! is_numeric($rating)) {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'missing review_text or rating');

            return ToolJsonResponse::error('review_text and rating are required.');
        }

        $ratingNum = (float) $rating;

        $prompt = "Guest review (rating {$ratingNum}/5):\n{$reviewText}\n\nWrite one reply from hotel management.";

        try {
            $response = $this->draftAssistant->prompt($prompt);
            $draft = $response->text;
        } catch (Throwable $e) {
            $this->actions->record(self::NAME, $request->all(), 'error', result: $e->getMessage());

            return ToolJsonResponse::error($e->getMessage());
        }

        $incident = Incident::query()->create([
            'guest_id' => null,
            'type' => 'reputation',
            'trigger_source' => 'manual',
            'severity' => 'low',
            'description' => 'Draft reply to public review',
            'context' => [
                'draft' => $draft,
                'review_text' => $reviewText,
                'rating' => $ratingNum,
            ],
            'status' => 'open',
        ]);

        $this->actions->record(self::NAME, $request->all(), 'ok', result: 'draft stored', incidentId: $incident->id);

        return ToolJsonResponse::ok([
            'draft' => $draft,
            'incident_id' => $incident->id,
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'review_text' => $schema->string()->required(),
            'rating' => $schema->number()->required(),
        ];
    }
}
