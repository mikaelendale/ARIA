<?php

namespace App\Ai\Support;

/**
 * Text agents use a fixed failover order, but providers without a configured API key must be
 * skipped — otherwise the last hop (e.g. OpenAI) sends requests with no Bearer token and returns 401.
 */
final class ConfiguredTextProviderFailover
{
    /** @var list<string> */
    public const DEFAULT_CHAIN = ['gemini', 'gemini_secondary', 'groq', 'openai'];

    /**
     * @return list<string>
     */
    public static function providers(): array
    {
        return array_values(array_filter(
            self::DEFAULT_CHAIN,
            fn (string $name): bool => self::providerHasNonEmptyKey($name),
        ));
    }

    private static function providerHasNonEmptyKey(string $name): bool
    {
        $key = config("ai.providers.{$name}.key");

        return is_string($key) && trim($key) !== '';
    }
}
