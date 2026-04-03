<?php

namespace App\Http\Controllers;

use App\Models\Incident;
use App\Support\OpsData;
use Inertia\Inertia;
use Inertia\Response;

class IncidentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('incidents', [
            'incidents' => OpsData::incidentsList(),
        ]);
    }

    public function show(Incident $incident): Response
    {
        return Inertia::render('incidents/show', [
            'incident' => OpsData::incidentDetail($incident),
        ]);
    }
}
