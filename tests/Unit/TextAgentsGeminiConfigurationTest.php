<?php

namespace Tests\Unit;

use App\Ai\Agents\AriaChatAgent;
use App\Ai\Agents\AriaOrchestrator;
use App\Ai\Agents\DraftReplyAssistant;
use App\Ai\Agents\PulsePricingAgent;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\UseCheapestModel;
use PHPUnit\Framework\Attributes\Test;
use ReflectionClass;
use Tests\TestCase;

/**
 * Ensures Promptable text agents keep a stable provider failover chain (Gemini → Gemini secondary → Groq).
 */
class TextAgentsGeminiConfigurationTest extends TestCase
{
    /** @var list<string> */
    private const EXPECTED_PROVIDER_FAILOVER = ['gemini', 'gemini_secondary', 'groq'];

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
    public function text_agents_use_gemini_then_groq_failover_and_cheapest_model(): void
    {
        foreach ($this->promptableTextAgentClasses() as $class) {
            $ref = new ReflectionClass($class);

            $providerAttrs = $ref->getAttributes(Provider::class);
            $this->assertNotEmpty($providerAttrs, $class.' should declare #[Provider]');
            $provider = $providerAttrs[0]->newInstance();
            $this->assertSame(self::EXPECTED_PROVIDER_FAILOVER, $provider->value, $class.' provider failover order');

            $this->assertNotEmpty(
                $ref->getAttributes(UseCheapestModel::class),
                $class.' should declare #[UseCheapestModel]',
            );
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
