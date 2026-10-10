<?php

use Illuminate\Support\Facades\Route;

/*
 * The API is the application; this route only exists so that a request to the bare domain gets a
 * small JSON answer instead of a framework page. Everything real lives in routes/api.php.
 */
Route::get('/', function () {
    return response()->json([
        'name' => config('app.name'),
        'status' => 'ok',
        'api' => url('/api/v1'),
        'documentation' => 'docs/API.md',
    ]);
});

// Any other web path is not part of this application: answer 404 as JSON rather than leaking a
// framework error page.
Route::fallback(function () {
    return response()->json(['message' => 'Not Found.'], 404);
});
