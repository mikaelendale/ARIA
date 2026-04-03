<?php

namespace App\Http\Controllers;

use App\Support\OpsData;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard', OpsData::dashboardPayload());
    }
}
