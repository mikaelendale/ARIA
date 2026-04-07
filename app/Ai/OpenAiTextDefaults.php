<?php

namespace App\Ai;

/**
 * Single source for the default OpenAI text model id (gpt-5-nano) used in #[Model], config defaults, and tests.
 *
 * @see ai-sdk.md Agent Configuration (Model + Provider attributes)
 */
final class OpenAiTextDefaults
{
    public const TEXT_MODEL_ID = 'gpt-5-nano';

    private function __construct() {}
}
