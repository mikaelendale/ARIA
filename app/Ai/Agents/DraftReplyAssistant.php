<?php

namespace App\Ai\Agents;

use App\Ai\Concerns\ResolvesOpenAiTextModel;
use App\Ai\OpenAiTextDefaults;
use App\Ai\Support\ConfiguredTextProviderFailover;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Promptable;
use Stringable;

/**
 * Minimal agent used by DraftReply tool; fake this class in tests via Ai::fake()->fakeAgent(...).
 */
#[Provider(['openai'])]
#[Model(OpenAiTextDefaults::TEXT_MODEL_ID)]
class DraftReplyAssistant implements Agent, Conversational
{
    use Promptable;
    use ResolvesOpenAiTextModel;

    /**
     * @return list<string>
     */
    public function provider(): array
    {
        return ConfiguredTextProviderFailover::providers();
    }

    public function instructions(): Stringable|string
    {
        return 'You draft concise, warm, professional hotel management responses to public guest reviews. Output only the reply body, with no preamble or quotes.';
    }

    public function messages(): iterable
    {
        return [];
    }
}
