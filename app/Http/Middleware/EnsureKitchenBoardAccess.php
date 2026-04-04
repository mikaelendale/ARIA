<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureKitchenBoardAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = config('aria.kitchen_display_token');

        if (! is_string($expected) || $expected === '') {
            abort(404);
        }

        $provided = $request->query('token') ?? $request->bearerToken();

        if (is_string($provided) && hash_equals($expected, $provided)) {
            $request->session()->put('kitchen_board_granted', true);
        }

        if (! $request->session()->get('kitchen_board_granted')) {
            abort(403, 'Kitchen display requires a valid access link from your manager.');
        }

        return $next($request);
    }
}
