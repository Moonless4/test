<?php

namespace App\Models;

use App\Enums\UserStatus;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * The customer/staff account.
 *
 * `status` is deliberately part of the model rather than a soft delete: suspending somebody must
 * keep their orders, audit rows and reviews pointing at a real user, and `isActive()` is checked
 * on every login.
 *
 * Mass assignment: only these five attributes are fillable. `status` is fillable because an
 * administrator sets it through a form request that requires the `users.update` permission —
 * a customer updating their own profile sends name/phone only (see UpdateProfileRequest).
 */
#[Fillable(['name', 'email', 'phone', 'password', 'status'])]
#[Hidden(['password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, Notifiable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'two_factor_confirmed_at' => 'datetime',
            'password' => 'hashed',
            'status' => UserStatus::class,
            /*
             * The TOTP secret is encrypted at rest, so a stolen database dump (or a backup left
             * somewhere it should not be) does not hand over working second-factor codes. It also
             * means a rotated APP_KEY invalidates enrollment — deliberate: the pair is "secret in
             * the database, key on the host", and one without the other is useless.
             */
            'two_factor_secret' => 'encrypted',
        ];
    }

    /**
     * True only once the operator confirmed a code from their authenticator: a stored secret that
     * was never verified is not a second factor.
     */
    public function hasTwoFactorEnabled(): bool
    {
        return $this->two_factor_confirmed_at !== null && $this->two_factor_secret !== null;
    }

    /**
     * Is this account required to use a second factor? Staff accounts are, when the shop asks for it.
     */
    public function requiresTwoFactor(): bool
    {
        if (! (bool) config('security.two_factor.enabled')) {
            return false;
        }

        return $this->isStaff() && (bool) config('security.two_factor.enforce_admins');
    }

    /**
     * @return array<int, string> The bcrypt hashes of the unused recovery codes.
     */
    public function twoFactorRecoveryCodeHashes(): array
    {
        if (! is_string($this->two_factor_recovery_codes) || $this->two_factor_recovery_codes === '') {
            return [];
        }

        $decoded = json_decode($this->two_factor_recovery_codes, true);

        return is_array($decoded) ? array_values(array_filter($decoded, 'is_string')) : [];
    }

    public function isActive(): bool
    {
        return $this->status === UserStatus::Active;
    }

    public function isStaff(): bool
    {
        return $this->hasAnyRole(['super-admin', 'admin', 'staff']);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function wishlistItems(): HasMany
    {
        return $this->hasMany(WishlistItem::class);
    }

    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class)->where('status', 'active');
    }

    /**
     * Guarded by the AccountController's validation: this only ever writes the columns it names,
     * so it cannot be turned into a privilege-escalation primitive.
     *
     * The country is only ever filled from a *trusted* proxy's header (see
     * App\Services\Security\LoginShield::countryFrom) — a client-supplied one would make the
     * "impossible travel" signal worthless.
     */
    public function recordLogin(string $ip, ?string $country = null, ?string $device = null): void
    {
        $this->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $ip,
            'last_login_country' => $country ?? $this->last_login_country,
            'last_login_device' => $device !== null && $device !== '' ? mb_substr($device, 0, 100) : $this->last_login_device,
        ])->save();
    }
}
