<?php

namespace App\Services;

use InvalidArgumentException;
use RuntimeException;
use Twilio\Rest\Client;

class TwilioService
{
    public function __construct(
        protected ?Client $client = null,
    ) {}

    /**
     * Resolve the Twilio REST client (injectable for tests).
     */
    protected function client(): Client
    {
        if ($this->client !== null) {
            return $this->client;
        }

        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');

        if (empty($sid) || empty($token)) {
            throw new InvalidArgumentException('Twilio credentials are not configured (TWILIO_SID / TWILIO_AUTH_TOKEN).');
        }

        return new Client($sid, $token);
    }

    /**
     * Send a WhatsApp message. Prefixes whatsapp: on addresses when missing.
     */
    public function sendWhatsapp(string $to, string $body): string
    {
        $from = config('services.twilio.whatsapp_from');
        if (empty($from)) {
            throw new InvalidArgumentException('TWILIO_WHATSAPP_FROM is not configured.');
        }

        $toAddress = str_starts_with($to, 'whatsapp:') ? $to : 'whatsapp:'.$to;
        $fromAddress = str_starts_with((string) $from, 'whatsapp:') ? $from : 'whatsapp:'.$from;

        $message = $this->client()->messages->create($toAddress, [
            'from' => $fromAddress,
            'body' => $body,
        ]);

        return (string) $message->sid;
    }

    /**
     * Send a plain SMS (e.g. staff alerts).
     */
    public function sendSms(string $to, string $body): string
    {
        $from = config('services.twilio.sms_from');
        if (empty($from)) {
            throw new InvalidArgumentException('TWILIO_PHONE_NUMBER is not configured.');
        }

        $message = $this->client()->messages->create($to, [
            'from' => $from,
            'body' => $body,
        ]);

        return (string) $message->sid;
    }

    /**
     * Placeholder for future Twilio Programmable Voice bridging (Hermes).
     */
    public function makeCall(): void
    {
        throw new RuntimeException('Outbound calls are not implemented yet.');
    }
}
