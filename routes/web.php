<?php

use App\Http\Controllers\AriaDashboardChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\GuestKioskWhatsappController;
use App\Http\Controllers\GuestVoiceController;
use App\Http\Controllers\IncidentController;
use App\Http\Controllers\KitchenBoardController;
use App\Http\Controllers\RevenueController;
use App\Http\Controllers\TriggerScenarioController;
use App\Http\Controllers\WebhookController;
use App\Models\Guest;
use App\Models\Incident;
use App\Support\OpsData;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::post('/webhook/twilio/voice', [WebhookController::class, 'twilioVoice']);
Route::post('/webhook/twilio/whatsapp', [WebhookController::class, 'twilioWhatsapp']);

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

/** Public guest-facing Hermes kiosk (no app chrome): voice orb + WhatsApp send channel when configured */
Route::get('/guest/voice', GuestVoiceController::class)->name('guest.voice');
Route::post('/guest/whatsapp/send', GuestKioskWhatsappController::class)
    ->middleware('throttle:10,1')
    ->name('guest.whatsapp.send');

Route::middleware(['kitchen.board'])->group(function () {
    Route::get('/kitchen', [KitchenBoardController::class, 'index'])->name('kitchen.index');
    Route::post('/kitchen/orders/{room_service_order}/delivered', [KitchenBoardController::class, 'markDelivered'])
        ->name('kitchen.orders.delivered');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('revenue', [RevenueController::class, 'index'])->name('revenue');
    Route::get('guests', [GuestController::class, 'index'])->name('guests.index');
    Route::get('guests/{guest}', [GuestController::class, 'show'])->name('guests.show');
    Route::get('incidents', [IncidentController::class, 'index'])->name('incidents.index');
    Route::get('incidents/{incident}', [IncidentController::class, 'show'])->name('incidents.show');

    Route::post('api/trigger/scenario', TriggerScenarioController::class)->name('api.trigger.scenario');
    Route::post('api/ops/aria/chat', AriaDashboardChatController::class)->name('api.ops.aria.chat');

    Route::prefix('api/ops')->group(function () {
        Route::get('dashboard/stats', fn () => response()->json(OpsData::dashboardPayload()));

        Route::get('agents/status', fn () => response()->json([
            'agents' => OpsData::agentsStatus(),
        ]));

        Route::get('guests', fn () => response()->json(OpsData::guestsList()));

        Route::get('incidents', fn () => response()->json(OpsData::incidentsList()));

        Route::get('guests/{guest}', function (Guest $guest) {
            $detail = OpsData::guestDetail($guest);

            return response()->json([
                'id' => $detail['id'],
                'name' => $detail['name'],
                'room' => $detail['room'],
                'churnScore' => $detail['churnScore'],
                'vip' => $detail['vip'],
                'lastInteraction' => $detail['lastInteraction'] ?? now()->toIso8601String(),
            ]);
        });

        Route::get('incidents/{incident}', function (Incident $incident) {
            $detail = OpsData::incidentDetail($incident);

            return response()->json([
                'id' => $detail['id'],
                'type' => $detail['type'],
                'severity' => $detail['severity'],
                'status' => $detail['status'],
                'resolutionTime' => $detail['resolutionTime'],
                'createdAt' => $detail['createdAt'],
            ]);
        });
    });
});

require __DIR__.'/settings.php';
