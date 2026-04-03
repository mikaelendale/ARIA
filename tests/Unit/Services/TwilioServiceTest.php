<?php

namespace Tests\Unit\Services;

use App\Services\TwilioService;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use RuntimeException;
use Tests\TestCase;

class TwilioServiceTest extends TestCase
{
    #[Test]
    public function make_call_is_not_implemented(): void
    {
        $this->expectException(RuntimeException::class);

        (new TwilioService)->makeCall();
    }

    #[Test]
    public function send_sms_requires_configuration(): void
    {
        config([
            'services.twilio.sid' => null,
            'services.twilio.token' => null,
        ]);

        $this->expectException(InvalidArgumentException::class);

        (new TwilioService)->sendSms('+15551234567', 'test');
    }

    #[Test]
    public function fetch_account_requires_configuration(): void
    {
        config([
            'services.twilio.sid' => null,
            'services.twilio.token' => null,
        ]);

        $this->expectException(InvalidArgumentException::class);

        (new TwilioService)->fetchAccount();
    }

    #[Test]
    public function send_whatsapp_requires_whatsapp_from(): void
    {
        config([
            'services.twilio.sid' => 'ACtest',
            'services.twilio.token' => 'token',
            'services.twilio.whatsapp_from' => null,
        ]);

        $this->expectException(InvalidArgumentException::class);

        (new TwilioService)->sendWhatsapp('+15551234567', 'hi');
    }
}
