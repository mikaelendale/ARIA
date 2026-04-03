<?php

namespace App\Ai\Support;

final class ToolJsonResponse
{
    public static function ok(array $data = []): string
    {
        return json_encode(array_merge(['status' => 'ok'], $data), JSON_THROW_ON_ERROR);
    }

    public static function error(string $message, array $extra = []): string
    {
        return json_encode(array_merge(['status' => 'error', 'message' => $message], $extra), JSON_THROW_ON_ERROR);
    }
}
