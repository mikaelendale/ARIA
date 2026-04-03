<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast channels
|--------------------------------------------------------------------------
|
| Public channel `aria-live` is used without an authorization callback.
| Echo: Echo.channel('aria-live')
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// TODO: restrict to manager role when User has is_manager / permissions.
Broadcast::channel('manager', function ($user) {
    return (bool) $user;
});
