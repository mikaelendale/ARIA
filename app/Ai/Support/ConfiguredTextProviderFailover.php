<?php

namespace App\Ai\Support;

/**
 * Text agents use OpenAI only; providers without a configured API key are skipped so requests are
 * not sent with an empty Bearer token (401).
 */
final class ConfiguredTextProviderFailover
{
    /** @var list<string> */
    public const DEFAULT_CHAIN = ['openai'];

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
