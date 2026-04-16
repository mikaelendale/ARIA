<?php

namespace App\Support;

/**
 * Hides provider / quota errors and opaque ids from end-user surfaces (feeds, incident timelines).
 */
final class PublicMessageSanitizer
{
    public static function forDisplay(string $text): string
    {
        $text = trim($text);
        if ($text === '') {
            return $text;
        }

        $text = self::stripUuidLikeTokens($text);
        $text = self::scrubMessagingProviderErrors($text);

        $collapsed = preg_replace('/\s{2,}/u', ' ', trim($text));

        return $collapsed ?? trim($text);
    }

    private static function stripUuidLikeTokens(string $text): string
    {
        $text = preg_replace(
            '/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i',
            '',
            $text,
        ) ?? $text;

        return preg_replace('/\s{2,}/u', ' ', trim($text)) ?? trim($text);
    }

    private static function scrubMessagingProviderErrors(string $text): string
    {
        $t = strtolower($text);

        if (preg_match('/\[HTTP\s+429\]/i', $text)
            || (str_contains($t, '429') && (
                str_contains($t, 'twilio')
                || str_contains($t, 'daily messages')
                || str_contains($t, 'unable to create record')
            ))) {
            return 'Notification channel hit a sending limit. The escalation is still recorded here — use in-app alerts or upgrade the messaging account for live SMS/WhatsApp.';
        }

        if (preg_match('/\[HTTP\s+[45]\d{2}\]/i', $text) && (
            str_contains($t, 'twilio')
            || str_contains($t, 'unable to create record')
            || str_contains($t, 'message')
        )) {
            return 'The external messaging provider returned an error. Staff can still follow this issue in ARIA without exposing vendor details.';
        }

        return $text;
    }
}
