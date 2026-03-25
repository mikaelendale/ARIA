<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;

/**
 * OpenWeatherMap 5-day / 3-hour forecast API (free tier).
 *
 * @see https://openweathermap.org/forecast5
 */
class WeatherService
{
    private const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

    /**
     * @return array{is_rain_tomorrow: bool, temperature: float, condition: string}
     */
    public function getForecast(): array
    {
        $key = config('services.openweather.key');
        if (empty($key)) {
            throw new InvalidArgumentException('OPENWEATHER_KEY is not configured.');
        }

        $lat = (float) config('services.openweather.lat');
        $lon = (float) config('services.openweather.lon');

        $cacheKey = sprintf('weather:forecast:%s:%s', $lat, $lon);

        return Cache::remember($cacheKey, now()->addHour(), function () use ($key, $lat, $lon) {
            $response = Http::timeout(15)->get(self::FORECAST_URL, [
                'lat' => $lat,
                'lon' => $lon,
                'appid' => $key,
                'units' => 'metric',
            ]);

            if (! $response->successful()) {
                throw new InvalidArgumentException('OpenWeatherMap request failed: '.$response->body());
            }

            $data = $response->json();
            $list = $data['list'] ?? [];

            $tomorrow = Carbon::tomorrow();

            $tomorrowSlots = collect($list)->filter(function (array $item) use ($tomorrow) {
                $dt = Carbon::createFromTimestamp($item['dt'] ?? 0);

                return $dt->isSameDay($tomorrow);
            })->values();

            if ($tomorrowSlots->isEmpty()) {
                $first = $list[0] ?? null;
                $main = $first['weather'][0]['main'] ?? 'unknown';
                $temp = (float) ($first['main']['temp'] ?? 0);

                return [
                    'is_rain_tomorrow' => false,
                    'temperature' => $temp,
                    'condition' => (string) $main,
                ];
            }

            $isRainTomorrow = $tomorrowSlots->contains(fn (array $item) => $this->forecastItemIndicatesRain($item));

            $avgTemp = round($tomorrowSlots->avg(fn (array $item) => (float) ($item['main']['temp'] ?? 0)), 1);
            $firstTomorrow = $tomorrowSlots->first();
            $condition = (string) ($firstTomorrow['weather'][0]['description'] ?? $firstTomorrow['weather'][0]['main'] ?? 'unknown');

            return [
                'is_rain_tomorrow' => $isRainTomorrow,
                'temperature' => $avgTemp,
                'condition' => $condition,
            ];
        });
    }

    /**
     * OpenWeather condition codes: rain, drizzle, thunderstorm groups.
     */
    private function forecastItemIndicatesRain(array $item): bool
    {
        $id = (int) ($item['weather'][0]['id'] ?? 0);

        return ($id >= 200 && $id <= 232)
            || ($id >= 300 && $id <= 321)
            || ($id >= 500 && $id <= 531);
    }
}
