<?php

namespace Tests\Unit;

use App\Ai\Agents\AriaChatAgent;
use App\Ai\Agents\AriaOrchestrator;
use App\Ai\Agents\DraftReplyAssistant;
use App\Ai\Agents\PulsePricingAgent;
use App\Ai\Support\ConfiguredTextProviderFailover;
use Illuminate\Support\Facades\Config;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\UseCheapestModel;
use PHPUnit\Framework\Attributes\Test;
use ReflectionClass;
use Tests\TestCase;

/**
 * Ensures Promptable text agents keep a stable provider failover chain (Gemini → secondary → Groq → OpenAI).
 */
class TextAgentsGeminiConfigurationTest extends TestCase
{
    /** @var list<string> */
    private const EXPECTED_PROVIDER_FAILOVER = ['gemini', 'gemini_secondary', 'groq', 'openai'];

    /**
     * @return list<class-string>
     */
    private function promptableTextAgentClasses(): array
    {
        return [
            AriaOrchestrator::class,
            AriaChatAgent::class,
            PulsePricingAgent::class,
            DraftReplyAssistant::class,
        ];
    }

    #[Test]
    public function text_agents_use_full_provider_failover_chain_and_cheapest_model(): void
    {
        foreach ($this->promptableTextAgentClasses() as $class) {
            $ref = new ReflectionClass($class);

            $providerAttrs = $ref->getAttributes(Provider::class);
            $this->assertNotEmpty($providerAttrs, $class.' should declare #[Provider]');
            $provider = $providerAttrs[0]->newInstance();
            $this->assertSame(self::EXPECTED_PROVIDER_FAILOVER, $provider->value, $class.' provider failover order');

            $this->assertTrue($ref->hasMethod('provider'), $class.' should implement provider() for key-aware failover');
            $instance = app($class);
            $this->assertSame(
                self::EXPECTED_PROVIDER_FAILOVER,
                $instance->provider(),
                $class.' provider() should match #[Provider] when all API keys are set (see phpunit.xml)',
            );

            $this->assertNotEmpty(
                $ref->getAttributes(UseCheapestModel::class),
                $class.' should declare #[UseCheapestModel]',
            );
        }
    }

    #[Test]
    public function configured_text_provider_failover_skips_providers_without_keys(): void
    {
        $prev = [
            'gemini' => config('ai.providers.gemini.key'),
            'gemini_secondary' => config('ai.providers.gemini_secondary.key'),
            'groq' => config('ai.providers.groq.key'),
            'openai' => config('ai.providers.openai.key'),
        ];

        try {
            Config::set('ai.providers.gemini.key', 'k1');
            Config::set('ai.providers.gemini_secondary.key', 'k2');
            Config::set('ai.providers.groq.key', 'k3');
            Config::set('ai.providers.openai.key', '');

            $this->assertSame(
                ['gemini', 'gemini_secondary', 'groq'],
                ConfiguredTextProviderFailover::providers(),
            );
        } finally {
            Config::set('ai.providers.gemini.key', $prev['gemini']);
            Config::set('ai.providers.gemini_secondary.key', $prev['gemini_secondary']);
            Config::set('ai.providers.groq.key', $prev['groq']);
            Config::set('ai.providers.openai.key', $prev['openai']);
        }
    }

    #[Test]
    public function ai_config_defines_groq_provider_for_third_failover(): void
    {
        $groq = config('ai.providers.groq');
        $this->assertIsArray($groq);
        $this->assertSame('groq', $groq['driver']);
        $this->assertArrayHasKey('models', $groq);
        $this->assertArrayHasKey('text', $groq['models']);
        $this->assertArrayHasKey('cheapest', $groq['models']['text']);
        $this->assertArrayHasKey('default', $groq['models']['text']);
    }
}
