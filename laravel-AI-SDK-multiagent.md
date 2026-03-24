Building Multi-Agent Workflows with the Laravel AI SDK

Listen to this article
Anthropic published a very popular blog, Building Effective Agents, a research post describing the most useful patterns for building production AI systems. The patterns are practical, proven, and widely adopted.

The good news: you can build every one of those patterns in Laravel today, with very little code, using the Laravel AI SDK.

All the examples in this post use just the agent() helper function, a single line to spin up an agent. That alone is enough to show how powerful these patterns can be. But the Laravel AI SDK doesn't stop there. You can bring your own dedicated agent classes, attach tools, configure models, add middleware, and build workflows as complex as production demands.

Install the Laravel AI SDK via Composer: composer require laravel/ai.

What Is a Multi-Agent Workflow?
A single LLM call works great for simple tasks. But for complex work, such as reviewing code, generating polished emails, or routing support tickets, you want multiple agents working together, each focused on a specific task.

Multi-agent workflows let you do multiple things:

Break a task into ordered steps.
Run independent steps in parallel.
Route inputs to the right specialist.
Evaluate and refine outputs in a loop.
The Five Patterns (and How You Can Use Them with the Laravel AI SDK)
1. Prompt Chaining
One agent's output becomes the next agent's input.

Think of it as an assembly line. Each step does one thing well and hands the result forward. This is the simplest and most common pattern.

Example: Cold Email Generator
Let’s think of a simple workflow: Draft → review quality → improve if needed.

With the Laravel AI SDK, the three agents are orchestrated through a Pipeline . Each step receives the full payload and passes it forward, enriched:


$result = Pipeline::send(['company' => $company, 'role' => $role, 'email' => '', 'review' => []])
    ->through([
        fn ($payload, $next) => $next([...$payload, 'email'  => $this->draftAgent($payload)]),
        fn ($payload, $next) => $next([...$payload, 'review' => $this->reviewAgent($payload)]),
        fn ($payload, $next) => $next($this->improveAgent($payload)),
    ])
    ->thenReturn();
Each pipeline step is backed by a dedicated agent:


use function Laravel\Ai\{agent};

// Agent 1: Draft
private function draftAgent(array $payload): string
{
    return agent(instructions: 'Expert B2B copywriter. Write a concise, personalised cold email.')
        ->prompt("Draft a cold email targeting the {$payload['role']} at {$payload['company']}.")
        ->text;
}

// Agent 2: Review (structured output)
private function reviewAgent(array $payload): mixed
{
    return agent(
        instructions: 'Cold email quality analyst. Be strict.',
        schema: fn (JsonSchema $schema) => [
            'hasPersonalisation'    => $schema->boolean()->required(),
            'toneScore'             => $schema->integer()->min(1)->max(10)->required(),
            'callToActionStrength'  => $schema->integer()->min(1)->max(10)->required(),
        ],
    )->prompt($payload['email']);
}

// Agent 3: Improve only if scores fall short
private function improveAgent(array $payload): array
{
    $review = $payload['review'];

    if ($review['hasPersonalisation'] && $review['toneScore'] >= 7 && $review['callToActionStrength'] >= 7) {
        return $payload;
    }

    return [
        ...$payload,
        'email' => agent(instructions: 'Expert B2B copywriter.')
            ->prompt("Rewrite with better personalisation and a stronger CTA:\n{$payload['email']}")
            ->text,
    ];
}
✅ When to use it: This works for tasks with a clear sequence: generate, validate, refine, format. Each step should do one job well.

2. Routing
Classify the input first, then send it to the right agent.

Instead of a single agent handling everything, a classifier examines the input and selects the best specialist. Different query types get different instructions. Different complexity levels get different models.

Example: Customer Support
Workflow: Classify → pick the right instructions → choose a cheap or capable model based on complexity.


use function Laravel\Ai\{agent};

$classification = agent(
    instructions: 'Classify customer support queries.',
    schema: fn (JsonSchema $schema) => [
        'type'       => $schema->string()->required(), // general | refund | technical
        'complexity' => $schema->string()->required(), // simple | complex
    ],
)->prompt("Classify: {$query}");

$instructions = match ($classification['type']) {
    'refund'    => 'Customer service agent specialising in refund requests...',
    'technical' => 'Technical support specialist with deep product knowledge...',
    default     => 'Friendly customer service agent...',
};

$agent = match ($classification['complexity']) {
    'complex' => new AdvancedSupportAgent($instructions),
    default   => new StandardSupportAgent($instructions), // #[UseCheapestModel]
};

return $agent->prompt($query)->text;
#[UseCheapestModel] Attribute can be added to StandardSupportAgent for making simple queries run fast and cheaply. Complex queries go to the full model. The classifier decides which is which.

✅ When to use it: This is ideal when inputs vary widely in type or complexity and a single prompt can't handle all cases well.

3. Parallelization
Run independent agents at the same time.

When steps don't depend on each other, there's no reason to run them one by one. Laravel's Concurrency::run() is PHP's equivalent of Promise.all() . You can kick off all agents at once, and collect the results when they're done.

Example: Code Review
Workflow: Three specialist agents review code simultaneously. A fourth synthesizes their findings.


use function Laravel\Ai\{agent};

[$security, $performance, $maintainability] = Concurrency::run([
    fn () => (new SecurityReviewAgent)->prompt($code),
    fn () => (new PerformanceReviewAgent)->prompt($code),
    fn () => (new MaintainabilityReviewAgent)->prompt($code),
]);

$summary = agent(instructions: 'Technical lead synthesising code reviews.')
    ->prompt("Summarise:\n" . json_encode([
        ['type' => 'security',        'review' => $security->text],
        ['type' => 'performance',     'review' => $performance->text],
        ['type' => 'maintainability', 'review' => $maintainability->text],
    ]))->text;
Three agents review in parallel. The summary agent only runs after all three are done, giving it the full picture.

✅ When to use it: Multiple independent analyses of the same input, or when you need several specialists to each look at the same problem.

4. Orchestrator-Workers
One agent coordinates; worker agents do the work.

The orchestrator understands the full task and decides what needs to be done. Workers are specialists—they only handle their specific job. The orchestrator calls them automatically as tools, in whatever order makes sense.

Example: Feature Implementation
Orchestrator agent receives a feature request, then automatically calls worker agents to create, modify, or delete files.


use function Laravel\Ai\{agent};

$response = agent(
    instructions: 'You are a senior software architect. Analyze feature requests and use the available tools to implement each required file change.',
    tools: [
        new CreateFileAgentTool,
        new ModifyFileAgentTool,
        new DeleteFileAgentTool,
    ],
)->prompt("Implement this feature: {$featureRequest}");
Each tool is itself an agent() — a sub-agent with its own focused instructions:


use function Laravel\Ai\{agent};

class CreateFileAgentTool implements Tool
{
    public function description(): Stringable|string
    {
        return 'Creates a new file with the appropriate code following best practices.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'filePath' => $schema->string()->required(),
            'purpose'  => $schema->string()->required(),
        ];
    }

    public function handle(Request $request): Stringable|string
    {
        return agent(
            instructions: 'You are an expert at implementing new files following best practices.',
        )->prompt("Create {$request['filePath']} to support: {$request['purpose']}")->text;
    }
}
You don't hardcode which files to change or what order to process them. The orchestrator figures that out from the feature request.

✅ When to use it: Complex tasks where the required steps aren't known upfront — the model needs to plan and delegate dynamically.

5. Evaluator-Optimizer
The pattern is generate → evaluate → improve, in a loop.

Sometimes one pass isn't enough. The evaluator-optimizer pattern runs output through a quality check and keeps refining until it meets the bar or hits the iteration limit.

Example: Content Writer
Workflow: Write a paragraph → score it → rewrite if not approved → repeat up to three times.


use function Laravel\Ai\{agent};

$content = agent(instructions: 'You are a clear and concise writer.')
    ->prompt("Write a short paragraph about: {$topic}")->text;

$iterations = 0;

while ($iterations < 3) {
    $evaluation = agent(
        instructions: 'You are a writing quality evaluator.',
        schema: fn (JsonSchema $schema) => [
            'score'    => $schema->integer()->min(1)->max(10)->required(),
            'approved' => $schema->boolean()->required(),
            'issues'   => $schema->array()->items($schema->string())->required(),
        ],
    )->prompt("Rate this paragraph (approved if score >= 8): {$content}");

    if ($evaluation['approved']) {
        break;
    }

    $issues = implode(', ', $evaluation['issues']);
    $content = agent(instructions: 'You are a clear and concise writer.')
        ->prompt("Rewrite fixing these issues: {$issues} {$content}")->text;

    $iterations++;
}
The evaluator uses structured output to return a score, an approval flag, and a list of specific issues. The writer only retries if approved is false , and it knows exactly what to fix.

✅ When to use it: When you have clear quality criteria and the output benefits from iterative refinement: translations, writing, code generation.

Laravel AI SDK Simplifies Multi-Agent Work
Anthropic's research identified these patterns because they consistently work in production. What's striking is how little code they take in Laravel using the Laravel AI SDK.

Pattern	Use when
Prompt Chaining	Fixed sequence of steps
Routing	Inputs vary in type or complexity
Parallelization	Independent tasks can run simultaneously
Orchestrator-Workers	Dynamic planning and delegation
Evaluator-Optimizer	Quality bar requires iteration
Start simple. A single agent() call handles most tasks. Reach for these patterns only when the task genuinely needs them, and when you do, you'll find they're straightforward to implement.

You can install the Laravel AI SDK via Composer. Just run composer require laravel/ai.

To learn more about other Laravel AI tools, like Laravel Boost and MCP, check out this blog post.