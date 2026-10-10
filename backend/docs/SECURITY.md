# Security model

How the Medora API protects shoppers, money and administrative access — and what it deliberately
leaves to the host. Every claim here maps to code you can read; the file or config key is named so
the two cannot drift apart.

```
Request ──▶ [1] Host allowlist ──▶ [2] Origin check ──▶ [3] Rate limit ──▶ [4] Sanctum auth
        ──▶ [5] admin.access + permission (admin routes only) ──▶ [6] FormRequest validation
        ──▶ [7] Controller / policy ownership check ──▶ [8] Service (transaction, invariants)
        ──▶ [9] Audit log  ·  Response wrapped by [10] Security headers
```

---

## 1. Transport and host

- **The API trusts no host it does not know.** `App\Http\Middleware\EnforceTrustedHost` compares the
  request's `Host` header against `config('security.trusted_hosts')` (`TRUSTED_HOSTS`) and answers
  **400** before routing or authentication runs. A leading dot matches the domain and its
  subdomains. On shared hosting, where one IP serves many domains, this closes host-header
  injection. An empty list disables the check — a production host must set it.
- **No proxy is trusted by default.** `TRUST_PROXIES` (read in `bootstrap/app.php` from
  `config/security.php`) decides whose `X-Forwarded-*` headers are believed. **Empty is the correct
  value on the target platform**: DirectAdmin runs Apache or LiteSpeed as the SAPI, so PHP already
  receives the real client address in `REMOTE_ADDR` and `X-Forwarded-For` is only a header the caller
  chose. Believing it would let any client pick its own address — and the login lockout
  (`LoginShield`), the per-IP rate limits (`AppServiceProvider`) and the "new address" sign-in signal
  are all keyed on that address. Set it only to addresses that can *only* be the app's own front-end
  proxy: a CDN's published ranges, a load balancer's address, or `127.0.0.1,::1` when the host's web
  server reverse-proxies to the app over loopback. `*` ("every peer is a proxy") is only safe when
  the application is unreachable by any other path — never on shared hosting. `app:preflight` warns
  when it is `*`. `X-Forwarded-Host` is deliberately **not** trusted in any configuration: the Host
  header is checked against the allowlist instead of being taken from a client-settable header.
- **HSTS** is emitted only when the request arrived over TLS (`SecurityHeaders`), with a one-year
  `max-age` and `includeSubDomains` by default. `preload` is off: a wrong preload is hard to undo.
- TLS itself is the host's job. The API never terminates it, and neither `curl` configuration nor
  code disables certificate verification.

## 2. CORS and origin

- `config/cors.php` sends an explicit origin list (`CORS_ALLOWED_ORIGINS`), never `*`, and
  `supports_credentials` is true because the cart token travels in a cookie as well as a header.
  Wildcard origin *patterns* are left empty so a typo cannot silently widen access.
- `App\Http\Middleware\RejectForeignOrigin` adds a second, independent decision: a **state-changing**
  request that carries an `Origin` outside the allowlist is answered **403**, whatever the route is.
  Requests with no `Origin` (curl, the gateway callback, server-to-server jobs) pass — they still
  need a valid token to reach a protected route. Toggle: `ENFORCE_ORIGIN_CHECK`.

## 3. Authentication and tokens

- **Sanctum personal access tokens**, bearer style. Tokens are stored hashed; only the plaintext is
  returned once, at issue time (`/api/v1/auth/login`, `/api/v1/auth/register`).
- **Expiry** is `SANCTUM_TOKEN_TTL` (43200 minutes = 12 hours by default). A leaked token is not a
  permanent key.
- **Abilities** are assigned from the account's kind (`config/security.php` → `tokens.abilities`):
  customers get `cart:manage orders:read orders:write profile:manage`; staff get `*`.
- **Device labels** come from the client, so they are trimmed and truncated to 100 characters —
  they are labels, never identifiers (`App\Support\Tokens`).
- **Login cannot be used to enumerate accounts**: a wrong email and a wrong password return the same
  message. A suspended account is only told so *after* the password verified (403), which means
  revealing it requires knowledge the caller must already have. Suspicious logins are audited
  (`auth.login_failed`, `auth.login_blocked`).
- **Password hashing** uses `HASH_DRIVER` (`bcrypt` by default because every DirectAdmin build has
  it). `Hash::needsRehash()` runs on login, so switching to `argon2id` upgrades hashes as people
  sign in — no migration, no forced reset. `php artisan app:preflight` reports whether the host's PHP
  has libargon2.
- **Password policy** (`AppServiceProvider::configurePasswords` + `config/security.php`): minimum
  10 characters, letters, mixed case, numbers, maximum 72 (bcrypt's limit). `uncompromised()` is
  **opt-in** (`PASSWORD_UNCOMPROMISED`) because it calls HaveIBeenPwned and some Iranian hosts cannot
  reach it.
- **Password change** (`PUT /api/v1/auth/password`) requires the current password and revokes every
  *other* session's token, keeping the caller's own — the shopper is not signed out of the device in
  their hand.
- **Email verification exists but is not a gate** on this API: it confirms an address, it does not
  authorize anything. The routes are `auth/email/verify/{id}/{hash}` and `auth/email/resend`; a
  customer can place an order without verifying. Treat it as a trust signal for marketing, not as
  access control.

## 4. Authorization

Two independent layers, on purpose:

1. **Route layer** — the admin area sits behind `admin.access` (a Gate: `User::isStaff()`) *and* a
   permission name, e.g. `can:products.update`, `can:audit.view`. The permission names and their role
   mapping live in `database/seeders/RoleAndPermissionSeeder.php`.
2. **Logic layer** — controllers and policies re-check what middleware cannot see: a user may not
   suspend their own account, an already-redeemed coupon is not deleted, an order number that is not
   yours is a **404** (never 403 — a 403 would confirm the order exists).

- Ownership is never decided by a route. `AddressPolicy` and `OrderPolicy` answer "may this person
  touch *this* record?", and the account endpoints query by `user_id` rather than by an id taken from
  the request, so there is no path to somebody else's list.
- **Guest orders** are readable only with the one-time access token issued at checkout
  (`X-Order-Token`). That token is emitted by the checkout response alone — never by a listing.
- **Money is never taken from a client.** No request carries an amount, price or total; totals are
  computed from locked catalogue rows inside a transaction (`CheckoutService`, `InventoryService`),
  and the payment callback reads the amount from the `payments` row, never from the query string.

## 5. Rate limiting

Named limiters in `AppServiceProvider::configureRateLimiting()`, values in `config/security.php`,
keys in `.env`. A 429 carries `Retry-After`.

| Limiter | Default / minute | Keyed on | Protects |
| --- | --- | --- | --- |
| `api` | 120 | account, else IP | Every public and authenticated route. |
| `sensitive` | 20 | account, else IP | Endpoints with a side effect or private data. |
| `checkout` | 15 | account, else IP | Order placement. |
| `login` | 10 | lowercase email **+** IP | Credential stuffing, and walking a customer list. |
| `register` | 5 | IP | Mass account creation. |
| `password-reset` | 5 | lowercase email + IP | Reset-mail flooding. |
| `verification` | 3 | account, else IP | Verification-mail flooding. |

Keying login on *both* email and IP is deliberate: IP alone lets a botnet spread attempts, email
alone lets one host walk the whole customer list.

## 6. Input handling

- Every endpoint validates through a FormRequest; nothing reads `request()->all()` into a model.
- **Whitelists, not blacklists**: `sort` is `in:newest,price_asc,price_desc,name,discount`,
  `per_page` is capped (48 products, 24 content, 50 orders/15 default), so no client value reaches a
  column name or an unbounded LIMIT.
- **Persian digits are normalized** before validation (`NormalizesInput::toLatinDigits`) for phone
  numbers and postal codes, and emails are lowercased and trimmed — the same person cannot end up
  with two accounts differing only in case.
- **Mass assignment** is restricted by `#[Fillable]` attributes on the models, and non-production
  environments enable `preventSilentlyDiscardingAttributes` so a typo in a field name throws instead
  of silently writing nothing.
- **Morph maps are enforced**, so a row never stores a PHP class name — and a refactor cannot corrupt
  the audit trail.

## 7. Uploads

`App\Services\MediaService` is the only place a file from the internet becomes part of the
application:

- the MIME type is read from the **file's own bytes** (`finfo`), never from the client's
  `Content-Type` or the filename; a "photo.jpg" that is really a script fails;
- images must pass `getimagesize()` and a dimension cap, so a decompression bomb cannot be stored;
- the stored name is a generated ULID plus an extension derived from the verified MIME — the client's
  filename is only a database label, which makes path traversal impossible by construction;
- only `jpg/jpeg/png/webp/avif/pdf` are ever stored, so nothing here can be executed as PHP;
- private documents live on the `local` disk **outside the web root** and are streamed by a
  controller after an authorization check. Public media go to the `public` disk behind the
  `/storage` symlink.
- Size is capped by `UPLOAD_MAX_KB` (5 MB) and checked again by the host's `upload_max_filesize`
  (`app:preflight` reports a mismatch).

## 8. Payments

- The merchant id is a server-side credential (`ZARINPAL_MERCHANT_ID`), read from the environment.
  It never appears in a response, a log or a client bundle.
- Amounts are integers in **Toman** inside the application and converted to Rial only at the gateway
  boundary (`config/payments.php` → `rial_multiplier`).
- `PaymentService::start()` refuses an order that is not awaiting payment or has a zero total, so a
  replayed request cannot open a second transaction for the same order.
- The callback (`GET /api/v1/payments/callback`) trusts only the `Authority` identifier and asks the
  gateway to verify; it returns the order number and statuses, nothing more. `settle()` is
  idempotent — a refresh or a double callback cannot double-apply anything.
- A gateway failure is recorded on the payment row and the order survives it, so the shopper can try
  again without losing the basket.

## 9. Audit trail

`App\Services\AuditLogger` writes every security-relevant and business-relevant event (logins and
failures, role changes, product and stock changes, coupon creation, order status transitions,
settings, deletions).

- **Credentials never reach the database.** Keys matching
  `/(pass|secret|token|authorization|api[_-]?key|signature|card|pan|cvv|cvc|otp|merchant)/i` are
  replaced with `[redacted]` recursively, at any depth; values are truncated to 500 characters;
  nesting stops at depth 4.
- **Rows are append-only.** `App\Models\AuditLog` refuses updates and deletes at the model level, and
  the deployment guide recommends revoking `DELETE` on `audit_logs` from the application's MySQL user
  so the database enforces it too (`docs/DEPLOYMENT-DIRECTADMIN.md` §3).
- `GET /api/v1/admin/audit-logs` requires `audit.view`.

## 10. Errors, headers and what leaks

- `AppServiceProvider::guardAgainstDebugInProduction()` forces `APP_DEBUG` off in production and logs
  a warning if a host set it — a stack trace prints paths, configuration and environment values.
- Validation, authentication, authorization and model-not-found exceptions are not reported to the
  log (they are normal events); details never travel to the client. An unexpected `500` carries a
  generic message; the detail goes to `storage/logs/laravel.log` only.
- Every response (health route included) carries `X-Content-Type-Options: nosniff`,
  `X-Frame-Options`, `Referrer-Policy: no-referrer`, `Permissions-Policy`,
  `X-Permitted-Cross-Domain-Policies` and a `default-src 'none'` CSP; `X-Powered-By` is removed.
- An authenticated or state-changing response is `Cache-Control: no-store, private`.

---

## Accepted limitations (host responsibilities)

These are not bugs and no application change removes them:

1. **TLS is the host's job.** The API emits HSTS, but HTTPS must be configured (and renewed) in
   DirectAdmin, and a host that serves plain HTTP gets no HSTS at all.
2. **No WAF, no IP reputation.** Rate limits slow an attacker; they do not stop a distributed
   password-spray. A host under sustained attack needs edge filtering.
3. **`TRUST_PROXIES` is the host's own claim about its network.** It is empty by default, which is
   correct for plain DirectAdmin hosting; a host behind a CDN or a load balancer must list that
   proxy's addresses, and `*` is only safe where there is no other way in. A host that sets `*` on a
   shared account re-opens client address spoofing for the lockout, the per-IP limits and the
   sign-in monitoring — `app:preflight` warns about it.
4. **Rate limiting for guests is per IP**, so shoppers behind one carrier NAT share a budget. The
   defaults are generous enough for a shop; tighten them deliberately, not by accident.
5. **Log files and the audit trail contain personal data** (email addresses, IPs, user agents) and
   database dumps contain the whole store. Both are credentials: keep them off public paths, out of
   the repository, and rotate them (`LOG_DAILY_DAYS`, `BACKUP_KEEP_DAYS`).
6. **Email verification does not gate access** (§3). If the shop later needs verified-only features,
   that is a policy decision, not a switch.
7. **`uncompromised()` password checking is off by default** because it needs outbound HTTPS to
   HaveIBeenPwned, which some Iranian hosts block. Turn it on where the host allows it.
8. **Encoding with ionCube protects source readability only.** A stolen `.env` or database is still a
   full compromise — see `docs/IONCUBE.md` §6.

---

## Reporting a problem

Report security issues privately to the shop owner rather than opening a public issue. Include the
endpoint, the request, and what you expected; never include a real customer's data, a live token, or
a working credential in a report.
