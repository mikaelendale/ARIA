<?php

namespace Tests\Unit\Services;

use App\Services\WeatherService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class WeatherServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

    #[Test]
    public function get_forecast_parses_openweather_and_caches(): void
    {
        config([
            'services.openweather.key' => 'test-key',
            'services.openweather.lat' => '11.6',
            'services.openweather.lon' => '37.3833',
        ]);

        $tomorrowNoon = Carbon::tomorrow()->setTime(12, 0, 0)->timestamp;

        $payload = [
            'list' => [
                [
                    'dt' => $tomorrowNoon,
                    'main' => ['temp' => 22.5],
                    'weather' => [['id' => 500, 'main' => 'Rain', 'description' => 'light rain']],
                ],
                [
                    'dt' => $tomorrowNoon + 10_800,
                    'main' => ['temp' => 21.0],
                    'weather' => [['id' => 801, 'main' => 'Clouds', 'description' => 'few clouds']],
                ],
            ],
        ];

        Http::fake([
            'api.openweathermap.org/*' => Http::response($payload, 200),
        ]);

        $service = new WeatherService;

        $first = $service->getForecast();
        $this->assertTrue($first['is_rain_tomorrow']);
        $this->assertSame('light rain', $first['condition']);
        $this->assertIsFloat($first['temperature']);

        $second = $service->getForecast();
        $this->assertEquals($first, $second);

        Http::assertSentCount(1);
    }
}
