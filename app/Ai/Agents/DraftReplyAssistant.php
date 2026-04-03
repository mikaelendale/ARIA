<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Promptable;
use Stringable;

/**
 * Minimal agent used by DraftReply tool; fake this class in tests via Ai::fake()->fakeAgent(...).
 */
class DraftReplyAssistant implements Agent, Conversational
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return 'You draft concise, warm, professional hotel management responses to public guest reviews. Output only the reply body, with no preamble or quotes.';
    }

    public function messages(): iterable
    {
        return [];
    }
}
