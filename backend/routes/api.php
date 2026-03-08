<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin;
use App\Http\Controllers\Employer;
use App\Http\Controllers\Worker;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/categories', fn() => response()->json(\App\Models\Category::orderBy('name')->get()));
Route::get('/barangays',  fn() => DB::table('barangays')->pluck('name'));

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    /*
    |--------------------------------------------------------------------------
    | Admin
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:admin')->prefix('admin')->group(function () {

        Route::get('/stats', [AdminDashboardController::class, 'stats']);

        Route::get('/users',                 [Admin\UserController::class, 'index']);
        Route::get('/users/{user}',          [Admin\UserController::class, 'show']);
        Route::patch('/users/{user}/status', [Admin\UserController::class, 'updateStatus']);
        Route::delete('/users/{user}',       [Admin\UserController::class, 'destroy']);

        Route::get('/verifications',                  [Admin\VerificationController::class, 'index']);
        Route::patch('/verifications/{verification}', [Admin\VerificationController::class, 'update']);

        Route::get('/jobs',                [Admin\JobController::class, 'index']);
        Route::patch('/jobs/{job}/status', [Admin\JobController::class, 'updateStatus']);
        Route::delete('/jobs/{job}',       [Admin\JobController::class, 'destroy']);

        Route::apiResource('/categories', Admin\CategoryController::class);

        Route::get('/reports',            [Admin\ReportController::class, 'index']);
        Route::patch('/reports/{report}', [Admin\ReportController::class, 'update']);

        Route::get('/disputes', function () {
            return response()->json(\App\Models\Report::with(['reporter','reported'])
                ->where('status', 'pending')
                ->latest()->paginate(20));
        });

        Route::patch('/disputes/{id}', function (Request $request, $id) {
            $dispute = \App\Models\Report::findOrFail($id);
            $dispute->update($request->only(['status','resolution']));
            return response()->json(['message' => 'Dispute updated.']);
        });

        Route::get('/analytics', [Admin\AnalyticsController::class, 'index']);
        Route::get('/settings',  [Admin\SettingsController::class, 'index']);
        Route::put('/settings',  [Admin\SettingsController::class, 'update']);
    });


    /*
    |--------------------------------------------------------------------------
    | Employer
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:employer')->prefix('employer')->group(function () {

        Route::get('/profile',        [Employer\ProfileController::class, 'show']);
        Route::put('/profile',        [Employer\ProfileController::class, 'update']);
        Route::post('/profile/photo', [Employer\ProfileController::class, 'uploadPhoto']);

        Route::apiResource('/jobs', Employer\JobController::class);

        Route::get('/jobs/{job}/applicants',        [Employer\ApplicationController::class, 'index']);
        Route::patch('/applications/{application}', [Employer\ApplicationController::class, 'update']);

        Route::get('/messages',          [Employer\MessageController::class, 'conversations']);
        Route::get('/messages/{userId}', [Employer\MessageController::class, 'thread']);
        Route::post('/messages',         [Employer\MessageController::class, 'send']);

        Route::get('/reviews',  [Employer\ReviewController::class, 'index']);
        Route::post('/reviews', [Employer\ReviewController::class, 'store']);

        Route::post('/reports', [Employer\ReportController::class, 'store']);

        Route::get('/workers', [Worker\ProfileController::class, 'index']);

        Route::get('/notifications', function (Request $request) {
            return response()->json($request->user()->notifications()->paginate(30));
        });

        Route::patch('/notifications/read-all', function (Request $request) {
            $request->user()->unreadNotifications->markAsRead();
            return response()->json(['ok' => true]);
        });

        Route::patch('/notifications/{id}/read', function (Request $request, $id) {
            $n = $request->user()->notifications()->find($id);
            if ($n) $n->markAsRead();
            return response()->json(['ok' => true]);
        });

    });


    /*
    |--------------------------------------------------------------------------
    | Worker
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:worker')->prefix('worker')->group(function () {

        Route::get('/profile',        [Worker\ProfileController::class, 'show']);
        Route::put('/profile',        [Worker\ProfileController::class, 'update']);
        Route::post('/profile/photo', [Worker\ProfileController::class, 'uploadPhoto']);

        Route::post('/id-verification', [Worker\VerificationController::class, 'store']);

        Route::get('/jobs',       [Worker\JobController::class, 'index']);
        Route::get('/jobs/{job}', [Worker\JobController::class, 'show']);

        Route::post('/jobs/{job}/apply', [Worker\ApplicationController::class, 'store']);
        Route::get('/applications',      [Worker\ApplicationController::class, 'index']);

        Route::get('/messages',          [Worker\MessageController::class, 'conversations']);
        Route::get('/messages/{userId}', [Worker\MessageController::class, 'thread']);
        Route::post('/messages',         [Worker\MessageController::class, 'send']);

        Route::get('/reviews',  [Worker\ReviewController::class, 'index']);
        Route::post('/reviews', [Worker\ReviewController::class, 'store']);

        Route::post('/reports', [Worker\ReportController::class, 'store']);

        /*
        |--------------------------------------------------------------------------
        | Notifications
        |--------------------------------------------------------------------------
        */

        Route::get('/notifications', function (Request $request) {
            return response()->json($request->user()->notifications()->paginate(30));
        });

        Route::patch('/notifications/read-all', function (Request $request) {
            $request->user()->unreadNotifications->markAsRead();
            return response()->json(['ok' => true]);
        });

        Route::patch('/notifications/{id}/read', function (Request $request, $id) {
            $n = $request->user()->notifications()->find($id);
            if ($n) $n->markAsRead();
            return response()->json(['ok' => true]);
        });

        /*
        |--------------------------------------------------------------------------
        | Sidebar Badge Counters (NEW)
        |--------------------------------------------------------------------------
        */

        Route::get('/messages/unread-count', function (Request $request) {

            $count = \App\Models\Message::where('receiver_id', $request->user()->id)
                ->where('is_read', false)
                ->count();

            return response()->json([
                'count' => $count
            ]);
        });

        Route::get('/notifications/unread-count', function (Request $request) {

            return response()->json([
                'count' => $request->user()->unreadNotifications()->count()
            ]);
        });

    });

});