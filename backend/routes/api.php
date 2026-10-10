<?php

use App\Http\Controllers\Admin\AgentController as AdminAgentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\InquiryController as AdminInquiryController;
use App\Http\Controllers\Admin\PropertyController as AdminPropertyController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\InquiryController;
use App\Http\Controllers\Api\PropertyController;
use Illuminate\Support\Facades\Route;

// Health check
Route::get('/health', fn () => response()->json(['status' => 'ok']));

// Public property routes
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/featured', [PropertyController::class, 'featured']);
Route::get('/properties/{slug}', [PropertyController::class, 'show']);
Route::get('/agents', [PropertyController::class, 'agents']);

// Public inquiry submission
Route::post('/inquiries', [InquiryController::class, 'store']);

// Auth routes (rate-limited to prevent brute-force)
Route::prefix('auth')->middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{property}', [FavoriteController::class, 'toggle']);
});

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'stats']);

    // Properties CRUD
    Route::get('/properties', [AdminPropertyController::class, 'index']);
    Route::post('/properties', [AdminPropertyController::class, 'store']);
    Route::put('/properties/{property}', [AdminPropertyController::class, 'update']);
    Route::delete('/properties/{property}', [AdminPropertyController::class, 'destroy']);

    // Inquiries
    Route::get('/inquiries', [AdminInquiryController::class, 'index']);
    Route::patch('/inquiries/{inquiry}', [AdminInquiryController::class, 'update']);
    Route::delete('/inquiries/{inquiry}', [AdminInquiryController::class, 'destroy']);

    // Agents CRUD
    Route::get('/agents', [AdminAgentController::class, 'index']);
    Route::post('/agents', [AdminAgentController::class, 'store']);
    Route::put('/agents/{agent}', [AdminAgentController::class, 'update']);
    Route::delete('/agents/{agent}', [AdminAgentController::class, 'destroy']);
});
