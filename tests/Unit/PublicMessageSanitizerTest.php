<?php

namespace Tests\Unit;

use App\Support\PublicMessageSanitizer;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PublicMessageSanitizerTest extends TestCase
{
    #[Test]
    public function it_replaces_twilio_rate_limit_errors(): void
    {
        $raw = '[HTTP 429] Unable to create record: Account exceeded the 50 daily messages limit';

        $clean = PublicMessageSanitizer::forDisplay($raw);

        $this->assertStringNotContainsString('429', $clean);
        $this->assertStringNotContainsString('Twilio', $clean);
        $this->assertStringNotContainsString('daily messages', $clean);
        $this->assertStringContainsString('sending limit', strtolower($clean));
    }

    #[Test]
    public function it_strips_uuid_tokens(): void
    {
        $raw = 'Guest 019d7c0b-b7bb-71d8-9fa9-a9c3f20cd91e confirmed dinner';

        $clean = PublicMessageSanitizer::forDisplay($raw);

        $this->assertStringNotContainsString('019d7c0b', $clean);
        $this->assertStringContainsString('Guest', $clean);
        $this->assertStringContainsString('dinner', $clean);
    }
}
