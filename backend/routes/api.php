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
    // Before `products/{product}`: the rail's options are a route of their own, not a product slug.
    Route::get('products/filters', [ProductController::class, 'filters']);
    Route::get('products/{product}', [ProductController::class, 'show']);
    Route::get('products/{product}/related', [ProductController::class, 'related']);

    Route::get('content/pages/{page}', [PageController::class, 'show']);
    Route::get('content/posts', [PostController::class, 'index']);
    Route::get('content/posts/{post}', [PostController::class, 'show']);
    Route::get('content/faqs', [FaqController::class, 'index']);
    Route::get('content/settings', [SettingController::class, 'index']);

    // The admin panel's address, for the storefront's router to read before it renders. Served
    // here rather than in `content/settings` so that `admin.path` can stay an internal setting: the
    // panel's URL is not the shop's published configuration. It is an address, never a lock — every
    // admin route is guarded by `can:admin.access`.
    Route::get('content/admin-path', [SettingController::class, 'adminPath']);

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

    // A purchase the storefront's own basket already finished (the basket and the gateway are the
    // browser's). It is recorded here so the shop's panel and the shopper's account share one order.
    Route::post('checkout/record', [CheckoutController::class, 'record'])->middleware('throttle:checkout');

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
 | Administration
 |
 | Two gates, both decided here and never in the panel's UI:
 |
 |  - `can:admin.access` (App\Providers\AppServiceProvider) — "is this person staff at all?". A
 |    signed-in shopper is refused before any admin controller is reached.
 |  - a named permission per route (RoleAndPermissionSeeder) — "may this person touch *this*
 |    surface?". A staff member who may update products is still refused the users and audit log.
 |
 | A permission name that does not exist denies (Spatie resolves `can:` through the user's own
 | permission set), so forgetting to seed one fails closed rather than open. There is no `admin`
 | variant of a public route: the panel reads exactly what an operator needs and no more.
 -------------------------------------------------------------------------------------------- */
Route::prefix('admin')->middleware(['auth:sanctum', 'can:admin.access'])->group(function (): void {
    /* Catalogue ------------------------------------------------------------------------------ */
    Route::get('products', [Admin\ProductController::class, 'index'])->middleware('can:products.view');
    Route::post('products', [Admin\ProductController::class, 'store'])->middleware('can:products.create');
    Route::get('products/{product}', [Admin\ProductController::class, 'show'])->middleware('can:products.view');
    Route::match(['put', 'patch'], 'products/{product}', [Admin\ProductController::class, 'update'])->middleware('can:products.update');
    Route::delete('products/{product}', [Admin\ProductController::class, 'destroy'])->middleware('can:products.delete');

    // Stock is a separate endpoint on purpose: it writes through App\Services\InventoryService, so
    // a price edit and a stock correction are two different, separately audited actions.
    Route::put('products/{product}/stock', [Admin\ProductStockController::class, 'update'])->middleware('can:products.update');

    Route::post('products/{product}/images', [Admin\ProductImageController::class, 'store'])->middleware('can:products.update');
    Route::delete('products/{product}/images/{image}', [Admin\ProductImageController::class, 'destroy'])->middleware('can:products.update');

    Route::get('categories', [Admin\CategoryController::class, 'index'])->middleware('can:categories.manage');
    Route::post('categories', [Admin\CategoryController::class, 'store'])->middleware('can:categories.manage');
    Route::get('categories/{category}', [Admin\CategoryController::class, 'show'])->middleware('can:categories.manage');
    Route::match(['put', 'patch'], 'categories/{category}', [Admin\CategoryController::class, 'update'])->middleware('can:categories.manage');
    Route::delete('categories/{category}', [Admin\CategoryController::class, 'destroy'])->middleware('can:categories.manage');

    /* Orders --------------------------------------------------------------------------------- */
    Route::get('orders', [Admin\OrderController::class, 'index'])->middleware('can:orders.view');
    Route::get('orders/{order}', [Admin\OrderController::class, 'show'])->middleware('can:orders.view');
    // Status only: the money on an order was computed by the checkout, and no admin route rewrites
    // it. The transition itself is validated against App\Enums\OrderStatus.
    Route::put('orders/{order}/status', [Admin\OrderController::class, 'updateStatus'])->middleware('can:orders.update');

    /* Discount codes ------------------------------------------------------------------------- */
    Route::get('coupons', [Admin\CouponController::class, 'index'])->middleware('can:coupons.manage');
    Route::post('coupons', [Admin\CouponController::class, 'store'])->middleware('can:coupons.manage');
    Route::get('coupons/{coupon}', [Admin\CouponController::class, 'show'])->middleware('can:coupons.manage');
    Route::match(['put', 'patch'], 'coupons/{coupon}', [Admin\CouponController::class, 'update'])->middleware('can:coupons.manage');
    Route::delete('coupons/{coupon}', [Admin\CouponController::class, 'destroy'])->middleware('can:coupons.manage');

    /* Customers ------------------------------------------------------------------------------ */
    Route::get('users', [Admin\UserController::class, 'index'])->middleware('can:users.view');
    Route::get('users/{user}', [Admin\UserController::class, 'show'])->middleware('can:users.view');
    Route::match(['put', 'patch'], 'users/{user}', [Admin\UserController::class, 'update'])->middleware('can:users.update');
    // Roles are their own permission: being allowed to edit an account is not being allowed to
    // hand out privileges.
    Route::put('users/{user}/roles', [Admin\UserController::class, 'updateRoles'])->middleware('can:users.roles');

    /* Media library -------------------------------------------------------------------------- */
    Route::get('media', [Admin\MediaController::class, 'index'])->middleware('can:media.manage');
    Route::post('media', [Admin\MediaController::class, 'store'])->middleware('can:media.manage');
    Route::delete('media/{media}', [Admin\MediaController::class, 'destroy'])->middleware('can:media.manage');

    /* Audit trail — read only, by construction ----------------------------------------------- */
    Route::get('audit-logs', [Admin\AuditLogController::class, 'index'])->middleware('can:audit.view');
    Route::get('audit-logs/{auditLog}', [Admin\AuditLogController::class, 'show'])->middleware('can:audit.view');

    /* Content -------------------------------------------------------------------------------- */
    Route::middleware('can:content.manage')->group(function (): void {
        Route::get('pages', [Admin\PageController::class, 'index']);
        Route::post('pages', [Admin\PageController::class, 'store']);
        Route::get('pages/{page}', [Admin\PageController::class, 'show']);
        Route::match(['put', 'patch'], 'pages/{page}', [Admin\PageController::class, 'update']);
        Route::delete('pages/{page}', [Admin\PageController::class, 'destroy']);

        Route::get('posts', [Admin\PostController::class, 'index']);
        Route::post('posts', [Admin\PostController::class, 'store']);
        Route::get('posts/{post}', [Admin\PostController::class, 'show']);
        Route::match(['put', 'patch'], 'posts/{post}', [Admin\PostController::class, 'update']);
        Route::delete('posts/{post}', [Admin\PostController::class, 'destroy']);

        Route::get('faqs', [Admin\FaqController::class, 'index']);
        Route::post('faqs', [Admin\FaqController::class, 'store']);
        Route::match(['put', 'patch'], 'faqs/{faq}', [Admin\FaqController::class, 'update']);
        Route::delete('faqs/{faq}', [Admin\FaqController::class, 'destroy']);
    });

    // Settings are separate from the content surfaces: they are key/value rows the storefront reads
    // by key, and only this permission may change what a page actually renders.
    Route::get('settings', [Admin\SettingController::class, 'index'])->middleware('can:settings.manage');
    Route::post('settings', [Admin\SettingController::class, 'store'])->middleware('can:settings.manage');
    Route::match(['put', 'patch'], 'settings/{setting}', [Admin\SettingController::class, 'update'])->middleware('can:settings.manage');
    Route::delete('settings/{setting}', [Admin\SettingController::class, 'destroy'])->middleware('can:settings.manage');
});
