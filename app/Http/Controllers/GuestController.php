<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use App\Support\OpsData;
use Inertia\Inertia;
use Inertia\Response;

class GuestController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('guests', [
            'guests' => OpsData::guestsList(),
        ]);
    }

    public function show(Guest $guest): Response
    {
        return Inertia::render('guests/show', [
            'guest' => OpsData::guestDetail($guest),
        ]);
    }
}
