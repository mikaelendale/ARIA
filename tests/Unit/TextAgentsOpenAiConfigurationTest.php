<?php

namespace Tests\Unit;

use App\Ai\Agents\AriaChatAgent;
use App\Ai\Agents\AriaOrchestrator;
use App\Ai\Agents\DraftReplyAssistant;
use App\Ai\Agents\PulsePricingAgent;
use App\Ai\OpenAiTextDefaults;
use App\Ai\Support\ConfiguredTextProviderFailover;
use Illuminate\Support\Facades\Config;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use PHPUnit\Framework\Attributes\Test;
use ReflectionClass;
use Tests\TestCase;

/**
 * Ensures Promptable text agents use OpenAI only with a stable model from config.
 */
class TextAgentsOpenAiConfigurationTest extends TestCase
{
    /** @var list<string> */
    private const EXPECTED_PROVIDER_FAILOVER = ['openai'];

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
    public function text_agents_use_openai_provider_and_resolved_model(): void
    {
        foreach ($this->promptableTextAgentClasses() as $class) {
            $ref = new ReflectionClass($class);

            $providerAttrs = $ref->getAttributes(Provider::class);
            $this->assertNotEmpty($providerAttrs, $class.' should declare #[Provider]');
            $provider = $providerAttrs[0]->newInstance();
            $this->assertSame(self::EXPECTED_PROVIDER_FAILOVER, $provider->value, $class.' should use OpenAI only');

            $modelAttrs = $ref->getAttributes(Model::class);
            $this->assertNotEmpty($modelAttrs, $class.' should declare #[Model] per Laravel AI SDK (ai-sdk.md Agent Configuration)');
            $modelAttr = $modelAttrs[0]->newInstance();
            $this->assertSame(
                OpenAiTextDefaults::TEXT_MODEL_ID,
                $modelAttr->value,
                $class.' #[Model] should match gpt-5-nano default',
            );

            $this->assertTrue($ref->hasMethod('provider'), $class.' should implement provider() for key-aware failover');
            $this->assertTrue($ref->hasMethod('model'), $class.' should implement model() for OpenAI text model');

            $instance = app($class);
            $this->assertSame(
                self::EXPECTED_PROVIDER_FAILOVER,
                $instance->provider(),
                $class.' provider() should match #[Provider] when OPENAI_API_KEY is set (see phpunit.xml)',
            );

            $this->assertSame(
                (string) config('ai.providers.openai.models.text.default'),
                $instance->model(),
                $class.' model() should match ai.providers.openai.models.text.default',
            );
        }
    }

    #[Test]
    public function configured_text_provider_failover_skips_openai_without_key(): void
    {
        $prev = config('ai.providers.openai.key');

        try {
            Config::set('ai.providers.openai.key', '');

            $this->assertSame([], ConfiguredTextProviderFailover::providers());
        } finally {
            Config::set('ai.providers.openai.key', $prev);
        }
    }

    #[Test]
    public function ai_config_defines_openai_text_models(): void
    {
        $openai = config('ai.providers.openai');
        $this->assertIsArray($openai);
        $this->assertSame('openai', $openai['driver']);
        $this->assertArrayHasKey('models', $openai);
        $this->assertArrayHasKey('text', $openai['models']);
        $this->assertArrayHasKey('cheapest', $openai['models']['text']);
        $this->assertArrayHasKey('default', $openai['models']['text']);
        $this->assertSame(
            OpenAiTextDefaults::TEXT_MODEL_ID,
            $openai['models']['text']['cheapest'],
            'config cheapest default must match OpenAiTextDefaults::TEXT_MODEL_ID',
        );
        $this->assertSame(
            OpenAiTextDefaults::TEXT_MODEL_ID,
            $openai['models']['text']['default'],
            'config default must match OpenAiTextDefaults::TEXT_MODEL_ID when env unset',
        );
    }
}
