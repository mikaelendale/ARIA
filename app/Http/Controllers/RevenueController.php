<?php

namespace App\Http\Controllers;

use App\Support\RevenueDemoData;
use Inertia\Inertia;
use Inertia\Response;

class RevenueController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('revenue', RevenueDemoData::payload());
    }
}
