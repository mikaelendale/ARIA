<?php

namespace App\Http\Controllers;

use App\Ai\Agents\AriaChatAgent;
use App\Http\Responses\AriaChatStreamResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AriaDashboardChatController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:4000'],
            'conversation_id' => ['nullable', 'uuid'],
        ]);

        $user = $request->user();

        try {
            $agent = AriaChatAgent::make();

            if (! empty($data['conversation_id'])) {
                $agent->continue($data['conversation_id'], $user);
            } else {
                $agent->forUser($user);
            }

            $stream = $agent->stream($data['message'])->usingVercelDataProtocol(true);

            return AriaChatStreamResponse::from($stream);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => app()->hasDebugModeEnabled()
                    ? $e->getMessage()
                    : 'ARIA chat is temporarily unavailable.',
            ], 503);
        }
    }
}
