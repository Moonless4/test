<?php

namespace App\Providers;

use App\Models\User;
use App\Services\Payments\FakeGateway;
use App\Services\Payments\PaymentGateway;
use App\Services\Payments\ZarinpalGateway;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // The gateway is chosen by configuration, so the sandbox and the test suite can run
        // without ever touching Zarinpal, and a host can switch gateways without a code change.
        $this->app->bind(PaymentGateway::class, function (): PaymentGateway {
            return match ((string) config('payments.gateway')) {
                'fake' => new FakeGateway,
                default => new ZarinpalGateway,
            };
        });
    }

    public function boot(): void
    {
        $this->guardAgainstDebugInProduction();
        $this->configureModelStrictness();
        $this->configureMorphMap();
        $this->configureAuthorization();
        $this->configurePasswords();
        $this->configureRateLimiting();
    }

    /**
     * APP_DEBUG=true on a production host prints environment values, filesystem paths and stack
     * traces to whoever provokes an error. If a host gets this wrong, the application refuses to
     * honour it and says so in the log.
     */
    private function guardAgainstDebugInProduction(): void
    {
        if ($this->app->isProduction() && config('app.debug')) {
            config(['app.debug' => false]);

            Log::warning('APP_DEBUG was enabled in production; it has been forced off.');
        }
    }

    /**
     * Strict models in every non-production environment:
     *
     *  - preventLazyLoading: an N+1 query shows up in development instead of in production.
     *  - preventSilentlyDiscardingAttributes: a typo in a field name throws instead of writing
     *    nothing, which is how mass-assignment bugs usually hide.
     *
     * Deliberately *not* preventAccessingMissingAttributes: reading an optional column is normal
     * in resources, and turning that into an exception would be noise, not safety.
     */
    private function configureModelStrictness(): void
    {
        if (! $this->app->isProduction()) {
            Model::preventLazyLoading();
            Model::preventSilentlyDiscardingAttributes();
        }
    }

    /**
     * Morph aliases instead of class names: a database row must not record which PHP class
     * happened to write it, and a future refactor must not corrupt the audit trail.
     */
    private function configureMorphMap(): void
    {
        // Every model that can be the subject of an audit row (or of a stock movement) needs an
        // alias here: the map is enforced, so a missing entry is a hard error rather than a row
        // that quietly stores a class name.
        Relation::enforceMorphMap([
            'user' => User::class,
            'product' => \App\Models\Product::class,
            'category' => \App\Models\Category::class,
            'order' => \App\Models\Order::class,
            'cart' => \App\Models\Cart::class,
            'address' => \App\Models\Address::class,
            'coupon' => \App\Models\Coupon::class,
            'media' => \App\Models\Media::class,
            'page' => \App\Models\Page::class,
            'post' => \App\Models\Post::class,
            'faq' => \App\Models\Faq::class,
            'setting' => \App\Models\Setting::class,
        ]);
    }

    /**
     * One gate that guards the whole /admin area; the per-resource decisions stay in policies,
     * so "is this person staff?" and "may this person edit *this* record?" never mix.
     */
    private function configureAuthorization(): void
    {
        Gate::define('admin.access', fn (User $user): bool => $user->isStaff());
    }

    /**
     * One password policy for every place a password is set (registration, reset, change).
     * `uncompromised()` is opt-in because it calls the HaveIBeenPwned API and some Iranian hosts
     * cannot reach it — see config/security.php.
     */
    private function configurePasswords(): void
    {
        Password::defaults(function (): Password {
            $rule = Password::min((int) config('security.password.min'))
                ->letters()
                ->mixedCase()
                ->numbers()
                ->max((int) config('security.password.max'));

            return (bool) config('security.password.uncompromised')
                ? $rule->uncompromised()
                : $rule;
        });
    }

    /**
     * Named rate limiters. Every sensitive route names one explicitly, and the default `api`
     * limiter caps everything else per account (or per IP when nobody is signed in).
     *
     * The login limiter keys on the email *and* the IP: keying only on the IP lets one attacker
     * with a botnet spread the attempts, keying only on the email lets one host walk a whole
     * customer list.
     */
    private function configureRateLimiting(): void
    {
        $limitFor = fn (string $name): int => (int) config("security.rate_limits.{$name}");

        $byUserOrIp = fn (Request $request): string => $request->user() !== null
            ? 'user:'.$request->user()->getAuthIdentifier()
            : 'ip:'.$request->ip();

        RateLimiter::for('api', fn (Request $request) => Limit::perMinute($limitFor('api'))->by($byUserOrIp($request)));
        RateLimiter::for('sensitive', fn (Request $request) => Limit::perMinute($limitFor('sensitive'))->by($byUserOrIp($request)));
        RateLimiter::for('checkout', fn (Request $request) => Limit::perMinute($limitFor('checkout'))->by($byUserOrIp($request)));

        RateLimiter::for('login', fn (Request $request) => Limit::perMinute($limitFor('login'))
            ->by(mb_strtolower((string) $request->input('email')).'|'.$request->ip()));

        RateLimiter::for('register', fn (Request $request) => Limit::perMinute($limitFor('register'))->by('ip:'.$request->ip()));

        RateLimiter::for('password-reset', fn (Request $request) => Limit::perMinute($limitFor('password_reset'))
            ->by(mb_strtolower((string) $request->input('email')).'|'.$request->ip()));

        RateLimiter::for('verification', fn (Request $request) => Limit::perMinute($limitFor('verification'))->by($byUserOrIp($request)));
    }
}
