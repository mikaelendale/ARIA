<?php

use App\Jobs\RunEchoJob;
use App\Jobs\RunPulseJob;
use App\Jobs\RunSentinelJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new RunSentinelJob)->everyMinute();
Schedule::job(new RunEchoJob)->everyThirtyMinutes();
Schedule::job(new RunPulseJob)->hourly();
