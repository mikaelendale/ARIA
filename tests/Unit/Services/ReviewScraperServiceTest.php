<?php

namespace Tests\Unit\Services;

use App\Services\ReviewScraperService;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ReviewScraperServiceTest extends TestCase
{
    #[Test]
    public function get_google_reviews_returns_empty_when_not_configured(): void
    {
        config([
            'services.google_places.key' => '',
            'services.google_places.place_id' => '',
        ]);

        $service = new ReviewScraperService;

        $this->assertSame([], $service->getGoogleReviews());
    }

    #[Test]
    public function get_google_reviews_normalizes_places_response(): void
    {
        config([
            'services.google_places.key' => 'key',
            'services.google_places.place_id' => 'ChIJxxx',
        ]);

        $ts = now()->subDay()->timestamp;

        Http::fake([
            'maps.googleapis.com/*' => Http::response([
                'status' => 'OK',
                'result' => [
                    'reviews' => [
                        [
                            'author_name' => 'Ada L.',
                            'rating' => 5,
                            'text' => 'Excellent stay.',
                            'time' => $ts,
                        ],
                    ],
                ],
            ], 200),
        ]);

        $service = new ReviewScraperService;
        $reviews = $service->getGoogleReviews();

        $this->assertCount(1, $reviews);
        $this->assertSame('Ada L.', $reviews[0]['author']);
        $this->assertSame(5, $reviews[0]['rating']);
        $this->assertSame('Excellent stay.', $reviews[0]['text']);
        $this->assertNotNull($reviews[0]['date']);
    }

    #[Test]
    public function get_all_reviews_merges_google_and_stub_tripadvisor(): void
    {
        config([
            'services.google_places.key' => 'key',
            'services.google_places.place_id' => 'ChIJxxx',
        ]);

        Http::fake([
            'maps.googleapis.com/*' => Http::response([
                'status' => 'OK',
                'result' => [
                    'reviews' => [
                        [
                            'author_name' => 'Merge Test',
                            'rating' => 5,
                            'text' => 'Great.',
                            'time' => now()->timestamp,
                        ],
                    ],
                ],
            ], 200),
        ]);

        $service = new ReviewScraperService;
        $merged = $service->getAllReviews();

        $sources = collect($merged)->pluck('source')->all();

        $this->assertContains('google', $sources);
        $this->assertContains('tripadvisor_stub', $sources);
    }
}
