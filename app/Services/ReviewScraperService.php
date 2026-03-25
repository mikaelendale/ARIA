<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;

/**
 * Google Places Place Details (reviews). TripAdvisor path is stubbed per build guide.
 */
class ReviewScraperService
{
    private const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

    /**
     * @return list<array{author: string, rating: float|int|null, text: string, date: ?string}>
     */
    public function getGoogleReviews(): array
    {
        $key = config('services.google_places.key');
        $placeId = config('services.google_places.place_id');

        if (empty($key) || empty($placeId)) {
            return [];
        }

        $response = Http::timeout(15)->get(self::PLACE_DETAILS_URL, [
            'place_id' => $placeId,
            'fields' => 'reviews',
            'key' => $key,
        ]);

        if (! $response->successful()) {
            throw new InvalidArgumentException('Google Places request failed: '.$response->body());
        }

        $json = $response->json();
        if (($json['status'] ?? '') !== 'OK') {
            return [];
        }

        $reviews = $json['result']['reviews'] ?? [];

        return collect($reviews)->map(function (array $review) {
            $time = $review['time'] ?? null;

            return [
                'author' => (string) ($review['author_name'] ?? 'Anonymous'),
                'rating' => $review['rating'] ?? null,
                'text' => (string) ($review['text'] ?? ''),
                'date' => $time ? Carbon::createFromTimestamp((int) $time)->toIso8601String() : null,
            ];
        })->all();
    }

    /**
     * TripAdvisor blocks most scrapers; return representative samples until a paid API exists.
     *
     * @return list<array{author: string, rating: float|int|null, text: string, date: ?string}>
     */
    public function scrapeTripadvisor(): array
    {
        return [
            [
                'author' => 'Sample Guest (TripAdvisor stub)',
                'rating' => 5,
                'text' => 'Beautiful resort and attentive staff — stub review for development.',
                'date' => now()->subDays(7)->toIso8601String(),
            ],
            [
                'author' => 'Sample Guest 2 (TripAdvisor stub)',
                'rating' => 4,
                'text' => 'Great lake views; breakfast could start earlier — stub.',
                'date' => now()->subDays(14)->toIso8601String(),
            ],
        ];
    }

    /**
     * @return list<array{author: string, rating: float|int|null, text: string, date: ?string, source: string}>
     */
    public function getAllReviews(): array
    {
        $google = collect($this->getGoogleReviews())->map(fn (array $r) => [...$r, 'source' => 'google'])->all();
        $tripadvisor = collect($this->scrapeTripadvisor())->map(fn (array $r) => [...$r, 'source' => 'tripadvisor_stub'])->all();

        return array_merge($google, $tripadvisor);
    }
}
