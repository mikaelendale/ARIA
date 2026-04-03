<?php

namespace App\Ai\Agents;

use App\Ai\Orchestrator;
use App\Models\Incident;
use App\Services\ReviewScraperService;

/**
 * ECHO — ingest public reviews into incidents and escalate harsh reviews.
 */
class EchoAgent
{
    public function __construct(
        protected ReviewScraperService $reviewScraperService,
        protected Orchestrator $orchestrator,
    ) {}

    public function run(): void
    {
        foreach ($this->reviewScraperService->getAllReviews() as $review) {
            $source = (string) ($review['source'] ?? 'unknown');
            $author = (string) ($review['author'] ?? '');
            $date = (string) ($review['date'] ?? '');
            $text = (string) ($review['text'] ?? '');
            $fingerprint = hash('sha256', $source.'|'.$author.'|'.$date.'|'.$text);

            if (Incident::query()->where('review_fingerprint', $fingerprint)->exists()) {
                continue;
            }

            $rating = $review['rating'] ?? null;
            $ratingNum = is_numeric($rating) ? (float) $rating : null;

            $incident = Incident::query()->create([
                'guest_id' => null,
                'type' => 'reputation',
                'trigger_source' => 'manual',
                'severity' => $ratingNum !== null && $ratingNum <= 3 ? 'high' : 'low',
                'description' => 'Review ingest: '.$source,
                'context' => [
                    'author' => $author,
                    'rating' => $ratingNum,
                    'text' => $text,
                    'date' => $date,
                    'source' => $source,
                    'review_fingerprint' => $fingerprint,
                ],
                'status' => 'open',
                'review_fingerprint' => $fingerprint,
            ]);

            if ($ratingNum !== null && $ratingNum <= 3.0) {
                $this->orchestrator->handle([
                    'type' => 'negative_review_posted',
                    'payload' => [
                        'review_text' => $text,
                        'rating' => $ratingNum,
                        'source' => $source,
                        'incident_id' => $incident->id,
                    ],
                ]);
            }
        }
    }
}
