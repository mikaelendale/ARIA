<?php

namespace App\Console\Commands;

use App\Services\TwilioService;
use Illuminate\Console\Command;
use Throwable;
use Twilio\Exceptions\RestException;

class TwilioPingCommand extends Command
{
    protected $signature = 'twilio:ping
                            {--sms= : E.164 phone number (e.g. +15551234567) to send one test SMS}
                            {--whatsapp= : E.164 phone number to send one test WhatsApp message}';

    protected $description = 'Verify Twilio API credentials; optionally send a single test SMS or WhatsApp';

    public function handle(TwilioService $twilio): int
    {
        $this->components->info('Checking Twilio REST API (AccountSid + Auth Token)…');

        try {
            $account = $twilio->fetchAccount();
        } catch (Throwable $e) {
            $this->components->error('Could not reach Twilio or credentials are wrong.');
            $this->line($e->getMessage());

            if ($e instanceof RestException) {
                $this->newLine();
                $this->line('Common fixes:');
                $this->line('  • Copy Account SID and Auth Token from https://console.twilio.com/ (Account → API keys & tokens).');
                $this->line('  • Run `php artisan config:clear` after editing .env.');
            }

            return self::FAILURE;
        }

        $this->components->info('Twilio credentials are valid.');
        $this->line('  Account SID:    '.$account['sid']);
        $this->line('  Friendly name:  '.($account['friendlyName'] ?: '(none)'));
        $this->line('  Account status: '.$account['status']);
        $this->newLine();

        $smsTo = $this->option('sms');
        if ($smsTo !== null && $smsTo !== '') {
            try {
                $sid = $twilio->sendSms((string) $smsTo, 'ARIA Twilio ping — SMS test. '.now()->toIso8601String());
                $this->components->info('Test SMS queued. Message SID: '.$sid);
            } catch (Throwable $e) {
                $this->components->error('Test SMS failed: '.$e->getMessage());
                $this->warn('Trial accounts can only SMS verified numbers (Console → Phone numbers → Verified caller IDs).');

                return self::FAILURE;
            }
        }

        $waTo = $this->option('whatsapp');
        if ($waTo !== null && $waTo !== '') {
            try {
                $sid = $twilio->sendWhatsapp(
                    (string) $waTo,
                    'ARIA Twilio ping — WhatsApp test. '.now()->toIso8601String()
                );
                $this->components->info('Test WhatsApp queued. Message SID: '.$sid);
            } catch (Throwable $e) {
                $this->components->error('Test WhatsApp failed: '.$e->getMessage());
                $this->warn('Use the WhatsApp sandbox until your number is approved: join with the code from Twilio Console → Messaging → Try it out.');
                $this->warn('TWILIO_WHATSAPP_FROM must be whatsapp:+1… (your Twilio WhatsApp sender).');

                return self::FAILURE;
            }
        }

        if ($smsTo === null && $waTo === null) {
            $this->line('WhatsApp inbound webhook (set this in Twilio; use ngrok/tunnel for local dev):');
            $base = rtrim((string) config('app.url'), '/');
            $this->line('  POST '.$base.'/webhook/twilio/whatsapp');
            $this->newLine();
            $this->comment('Voice is deferred to a later release; /webhook/twilio/voice only returns a brief TwiML notice.');
            $this->newLine();
            $this->line('Optional test send:');
            $this->line('  php artisan twilio:ping --sms=+15551234567');
            $this->line('  php artisan twilio:ping --whatsapp=+15551234567');
        }

        return self::SUCCESS;
    }
}
