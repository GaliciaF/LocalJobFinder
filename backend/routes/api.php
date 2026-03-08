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

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Categories
Route::get('/categories', fn() =>
    response()->json(\App\Models\Category::orderBy('name')->get())
);

// Barangays (for Trinidad Bohol dropdowns)
Route::get('/barangays', function () {
    return DB::table('barangays')->pluck('name');
});


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


        // Dashboard
        Route::get('/stats', [AdminDashboardController::class, 'stats']);

        // Users
        Route::get('/users',                [Admin\UserController::class, 'index']);
        Route::get('/users/{user}',         [Admin\UserController::class, 'show']);
        Route::patch('/users/{user}/status',[Admin\UserController::class, 'updateStatus']);
        Route::delete('/users/{user}',      [Admin\UserController::class, 'destroy']);

        // ID Verifications
        Route::get('/verifications',        [Admin\VerificationController::class, 'index']);
        Route::patch('/verifications/{verification}', [Admin\VerificationController::class, 'update']);

        // Jobs
        Route::get('/jobs',                 [Admin\JobController::class, 'index']);
        Route::patch('/jobs/{job}/status',  [Admin\JobController::class, 'updateStatus']);
        Route::delete('/jobs/{job}',        [Admin\JobController::class, 'destroy']);

        // Categories
        Route::apiResource('/categories',   Admin\CategoryController::class);

        // Reports
        Route::get('/reports',              [Admin\ReportController::class, 'index']);
        Route::patch('/reports/{report}',   [Admin\ReportController::class, 'update']);

        // Analytics
        Route::get('/analytics',            [Admin\AnalyticsController::class, 'index']);
    Route::get('admin/disputes', [DisputeController::class, 'index']);
        // Settings
        Route::get('/settings',             [Admin\SettingsController::class, 'index']);
        Route::put('/settings',             [Admin\SettingsController::class, 'update']);
    });


    /*
    |--------------------------------------------------------------------------
    | Employer
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:employer')->prefix('employer')->group(function () {

        // Profile
        Route::get('/profile',        [Employer\ProfileController::class, 'show']);
        Route::put('/profile',        [Employer\ProfileController::class, 'update']);
        Route::post('/profile/photo', [Employer\ProfileController::class, 'uploadPhoto']);

        // Jobs
        Route::apiResource('/jobs', Employer\JobController::class);

        // Applicants
        Route::get('/jobs/{job}/applicants', [Employer\ApplicationController::class, 'index']);
        Route::patch('/applications/{application}', [Employer\ApplicationController::class, 'update']);

        // Messages
        Route::get('/messages',          [Employer\MessageController::class, 'conversations']);
        Route::get('/messages/{userId}', [Employer\MessageController::class, 'thread']);
        Route::post('/messages',         [Employer\MessageController::class, 'send']);

        // Reviews
        Route::get('/reviews',  [Employer\ReviewController::class, 'index']);
        Route::post('/reviews', [Employer\ReviewController::class, 'store']);

        // Reports
        Route::post('/reports', [Employer\ReportController::class, 'store']);

        // Browse Workers
        Route::get('/workers',  [Worker\ProfileController::class, 'index']);
    });


    /*
    |--------------------------------------------------------------------------
    | Worker
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:worker')->prefix('worker')->group(function () {

        // Profile
        Route::get('/profile',        [Worker\ProfileController::class, 'show']);
        Route::put('/profile',        [Worker\ProfileController::class, 'update']);
        Route::post('/profile/photo', [Worker\ProfileController::class, 'uploadPhoto']);

        // ID Verification
        Route::post('/id-verification', [Worker\VerificationController::class, 'store']);

        // Browse Jobs
        Route::get('/jobs',        [Worker\JobController::class, 'index']);
        Route::get('/jobs/{job}',  [Worker\JobController::class, 'show']);

        // Apply
        Route::post('/jobs/{job}/apply', [Worker\ApplicationController::class, 'store']);
        Route::get('/applications',      [Worker\ApplicationController::class, 'index']);

        // Messages
        Route::get('/messages',          [Worker\MessageController::class, 'conversations']);
        Route::get('/messages/{userId}', [Worker\MessageController::class, 'thread']);
        Route::post('/messages',         [Worker\MessageController::class, 'send']);

        // Reviews
        Route::get('/reviews',  [Worker\ReviewController::class, 'index']);
        Route::post('/reviews', [Worker\ReviewController::class, 'store']);

        // Reports
        Route::post('/reports', [Worker\ReportController::class, 'store']);

        // Notifications
        Route::get('/notifications', function (Request $request) {
            return response()->json(
                $request->user()->notifications()->paginate(30)
            );
        });

        Route::patch('/notifications/{id}/read', function (Request $request, $id) {
            $notification = $request->user()->notifications()->find($id);
            if ($notification) $notification->markAsRead();
            return response()->json(['ok' => true]);
        });

        Route::patch('/notifications/read-all', function (Request $request) {
            $request->user()->unreadNotifications->markAsRead();
            return response()->json(['ok' => true]);
        });

    });

});