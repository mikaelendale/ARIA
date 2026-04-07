<?php

namespace App\Ai\Concerns;

use App\Ai\OpenAiTextDefaults;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;

/**
 * OpenAI text model for all Promptable agents. Matches Laravel AI SDK “Agent Configuration” in ai-sdk.md
 * ({@see Model} + {@see Provider}).
 * Runtime ID: {@see config('ai.providers.openai.models.text')}; fallback {@see OpenAiTextDefaults::TEXT_MODEL_ID}.
 */
trait ResolvesOpenAiTextModel
{
    public function model(): string
    {
        $models = config('ai.providers.openai.models.text', []);
        $default = is_array($models) ? ($models['default'] ?? null) : null;
        $cheapest = is_array($models) ? ($models['cheapest'] ?? null) : null;

        $resolved = is_string($default) && trim($default) !== '' ? trim($default) : null;
        if ($resolved === null && is_string($cheapest) && trim($cheapest) !== '') {
            $resolved = trim($cheapest);
        }

        return $resolved ?? OpenAiTextDefaults::TEXT_MODEL_ID;
    }
}
