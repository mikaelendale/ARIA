<?php

namespace App\Ai\Concerns;

/**
 * Resolves the OpenAI text model from {@see config('ai.php')} providers.openai.models.text.
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

        return $resolved ?? 'gpt-5-nano';
    }
}
