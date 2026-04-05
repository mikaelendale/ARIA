<?php

namespace App\Http\Controllers;

use App\Support\RevenuePageData;
use Inertia\Inertia;
use Inertia\Response;

class RevenueController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('revenue', RevenuePageData::payload());
    }
}
