<?php

use App\Http\Controllers\Api\V1\Account\AddressController;
use App\Http\Controllers\Api\V1\Account\OrderController;
use App\Http\Controllers\Api\V1\Account\ProfileController;
use App\Http\Controllers\Api\V1\Account\WishlistController;
use App\Http\Controllers\Api\V1\Admin;
use App\Http\Controllers\Api\V1\Auth;
use App\Http\Controllers\Api\V1\Cart\CartController;
use App\Http\Controllers\Api\V1\Cart\CartCouponController;
use App\Http\Controllers\Api\V1\Cart\CartItemController;
use App\Http\Controllers\Api\V1\Catalog\CategoryController;
use App\Http\Controllers\Api\V1\Catalog\ProductController;
use App\Http\Controllers\Api\V1\Checkout\CheckoutController;
use App\Http\Controllers\Api\V1\Checkout\PaymentController;
use App\Http\Controllers\Api\V1\Content\FaqController;
use App\Http\Controllers\Api\V1\Content\PageController;
use App\Http\Controllers\Api\V1\Content\PostController;
use App\Http\Controllers\Api\V1\Content\SettingController;
use Illuminate\Support\Facades\Route;

/*
 | Every route is already versioned by bootstrap/app.php (apiPrefix = api/v1), so paths here are
 | written without the /api/v1 prefix.
 |
 | Guarding philosophy: a route is public only when it serves published content or a guest's own
 | basket, and every route that writes is explicitly rate limited. Ownership is never decided by a
 | route — controllers and policies check it again (see docs/SECURITY.md).
 */

/* ---------------------------------------------------------------------------------------------
 | Public storefront
 -------------------------------------------------------------------------------------------- */
Route::middleware('throttle:api')->group(function (): void {
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{category}', [CategoryController::class, 'show']);

    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{product}', [ProductController::class, 'show']);
    Route::get('products/{product}/related', [ProductController::class, 'related']);

    Route::get('content/pages/{page}', [PageController::class, 'show']);
    Route::get('content/posts', [PostController::class, 'index']);
    Route::get('content/posts/{post}', [PostController::class, 'show']);
    Route::get('content/faqs', [FaqController::class, 'index']);
    Route::get('content/settings', [SettingController::class, 'index']);

    // The basket. Guests are first-class here: the X-Cart-Token header identifies their cart, and
    // no endpoint ever accepts a cart id from the client.
    Route::get('cart', [CartController::class, 'show']);
    Route::post('cart/items', [CartItemController::class, 'store']);
    Route::patch('cart/items/{product}', [CartItemController::class, 'update']);
    Route::delete('cart/items/{product}', [CartItemController::class, 'destroy']);
    Route::post('cart/coupon', [CartCouponController::class, 'store']);
    Route::delete('cart/coupon', [CartCouponController::class, 'destroy']);

    // Checkout works with or without an account. The amount is computed server-side either way;
    // a guest gets an access token that is the only way to read the order afterwards.
    Route::post('checkout', [CheckoutController::class, 'store'])->middleware('throttle:checkout');

    // Order detail: the owner's session, or the order access token handed out at checkout.
    // Bound on `number` (MD-…) and not the primary key: the number is what the shopper was given,
    // and an internal id must never be the thing a client has to know.
    Route::get('orders/{order:number}', [OrderController::class, 'show']);

    // Where the payment gateway sends the browser back. No authentication: the authority in the
    // query string is the gateway's own handle, and the amount is read from our own payment row.
    Route::get('payments/callback', [PaymentController::class, 'callback'])->middleware('throttle:sensitive');
});

/* ---------------------------------------------------------------------------------------------
 | Authentication
 -------------------------------------------------------------------------------------------- */
Route::prefix('auth')->group(function (): void {
    Route::post('register', [Auth\RegisterController::class, 'store'])->middleware('throttle:register');
    Route::post('login', [Auth\LoginController::class, 'store'])->middleware('throttle:login');
    Route::post('password/forgot', [Auth\ForgotPasswordController::class, 'store'])->middleware('throttle:password-reset');
    Route::post('password/reset', [Auth\ResetPasswordController::class, 'store'])->middleware('throttle:password-reset');

    // The emailed verification link. Laravel's `signed` middleware rejects a tampered or expired
    // URL before a controller ever sees it.
    Route::get('email/verify/{id}/{hash}', [Auth\EmailVerificationController::class, 'verify'])
        ->middleware(['signed', 'throttle:verification'])
        ->name('verification.verify');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('me', [Auth\MeController::class, 'show']);
        Route::post('logout', [Auth\LogoutController::class, 'destroy']);
        Route::post('logout-all', [Auth\LogoutController::class, 'destroyAll']);
        Route::put('password', [Auth\UpdatePasswordController::class, 'update'])->middleware('throttle:sensitive');
        Route::post('email/resend', [Auth\EmailVerificationController::class, 'resend'])->middleware('throttle:verification');

        // Handing a guest basket to an account after signing in.
        Route::post('cart/merge', [CartController::class, 'merge']);
    });
});

/* ---------------------------------------------------------------------------------------------
 | The signed-in shopper's own data. Every controller here decides ownership through a policy.
 -------------------------------------------------------------------------------------------- */
Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);

    Route::get('orders', [OrderController::class, 'index']);

    Route::apiResource('addresses', AddressController::class)->except(['show']);
    Route::post('addresses/{address}/default', [AddressController::class, 'makeDefault']);

    Route::get('wishlist', [WishlistController::class, 'index']);
    Route::post('wishlist', [WishlistController::class, 'store']);
    Route::delete('wishlist/{product}', [WishlistController::class, 'destroy']);
});

/* ---------------------------------------------------------------------------------------------
 | Administration — NOT WIRED YET.
 |
 | The roles and permissions for it are seeded (RoleAndPermissionSeeder), the outer gate exists
 | (`can:admin.access` in App\Providers\AppServiceProvider), and the models, policies slots and
 | audit trail are in place. The controllers under App\Http\Controllers\Api\V1\Admin are the next
 | milestone; their routes are deliberately absent until they exist, because a route pointing at a
 | missing class breaks `php artisan route:cache` on a production host.
 |
 | Planned surface: products (+ images, stock), categories, orders (+ status transitions), coupons,
 | users (+ roles), media upload/delete, audit log read, and CRUD for pages/posts/faqs/settings.
 -------------------------------------------------------------------------------------------- */
