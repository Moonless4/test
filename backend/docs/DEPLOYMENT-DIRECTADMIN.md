# Deploying the Medora API to DirectAdmin

Target: a Linux **DirectAdmin** shared-hosting account with PHP 8.3+ (PHP Selector), MySQL 8.0 or
MariaDB 10.11+, and one cron entry. No Redis, no Supervisor and no shell root access is required —
sessions, cache and the queue all use the database, and the scheduler runs from the panel's cron.

Everything in this guide is a step you perform once (first deployment) or repeat (each update);
§11 is the short repeatable version.

---

## 1. What the host must provide

| Requirement | How to check |
| --- | --- |
| PHP **8.3** or newer | DirectAdmin → *PHP Selector*. `php artisan app:preflight` fails below 8.3. |
| Extensions: `ctype curl dom fileinfo filter hash mbstring openssl pcre pdo pdo_mysql session tokenizer xml` | PHP Selector → *Extensions*. `app:preflight` lists each one. |
| Optional: `bcmath gd imagick intl zip sodium` | Only some features use them (`gd`/`imagick` for image sizes); preflight reports, never fails. |
| MySQL 8.0 / MariaDB 10.11+ | `SELECT version();`. Older MySQL rejects `utf8mb4` index lengths. |
| `ionCube Loader` (**only if you deploy encoded code**) | PHP Selector → Extensions. See `docs/IONCUBE.md`. |
| Composer (optional) | Prefer building `vendor/` on your machine and uploading it — shared hosts often cap the memory Composer needs. |
| Cron | DirectAdmin → *Advanced Features → Cron Jobs*. Entries are in `deploy/cron.example`. |

---

## 2. Directory layout and document root

Upload the application **above the web root** so that only `public/` is reachable over HTTP:

```
/home/USER/
├── medora-api/                 ← the application (app/, config/, vendor/, storage/, .env, artisan)
│   └── public/                 ← the ONLY folder the domain serves
└── domains/api.example.com/
    └── public_html → /home/USER/medora-api/public        (or a vhost docroot, below)
```

**Preferred:** in DirectAdmin, set the domain's *Document Root* to `/home/USER/medora-api/public`
(*Domain Setup → api.example.com → Document Root*). Subdomains support the same setting.

If the panel refuses a custom document root, mirror `public/` into `public_html/` and edit the copied
`index.php` so its two `require` paths point at the application folder — but keep `storage/`,
`.env`, `vendor/` and `app/` outside `public_html/`. Never upload the whole project into
`public_html/`: `.env` and `vendor/` would be downloadable.

> A root `.htaccess` that forwards into `public/` is a fallback for hosts that cannot change the
> document root at all. It is not shipped here — write it on the host if you need it. Pointing the
> document root at `public/` is always the better answer.

---

## 3. Database

In DirectAdmin → *MySQL Management*:

1. Create a database (e.g. `medora_api`) and a **dedicated user** — never the MySQL root account.
2. Give that user full privileges on the database **for the initial migration**.
3. Keep the connection settings strict: `DB_CHARSET=utf8mb4`, `DB_COLLATION=utf8mb4_unicode_ci`,
   `DB_STRICT_MODE=true` (the API relies on strict mode rejecting truncated values).

After the first `migrate`, tighten the account. The audit trail is append-only, and the application
must not be able to rewrite it:

```sql
-- The trail is append-only: the application user must not be able to delete history.
REVOKE DELETE ON `medora_api`.`audit_logs` FROM 'medora_api'@'localhost';
-- DDL is only needed while migrating; revoke it between releases if you want a belt and braces.
-- REVOKE CREATE, ALTER, DROP, INDEX, REFERENCES ON `medora_api`.* FROM 'medora_api'@'localhost';
```

Grant `CREATE, ALTER, DROP, INDEX, REFERENCES` again temporarily whenever you run `migrate` (or run
migrations with a separate user that has DDL), then revoke.

---

## 4. `.env`

```bash
cp .env.example .env
php artisan key:generate        # writes APP_KEY; run it ON the server
chmod 600 .env
```

Fill in at minimum:

| Key | Value |
| --- | --- |
| `APP_ENV` / `APP_DEBUG` | `production` / `false` — `true` prints paths and configuration to whoever provokes an error. |
| `APP_URL` | `https://api.example.com` (must be `https://`; preflight warns otherwise). |
| `DB_*` | The database and user from §3. |
| `CORS_ALLOWED_ORIGINS` | The storefront origins, comma-separated, e.g. `https://example.com,https://www.example.com`. Never `*`. |
| `TRUSTED_HOSTS` | `api.example.com,example.com,.example.com` — a leading dot matches the domain and its subdomains. Empty disables host checking. |
| `TRUST_PROXIES` | `*` when the app is reachable only through the web server (the normal DirectAdmin setup). |
| `SESSION_SECURE_COOKIE` | `true`. |
| `MAIL_*` | The mailbox created in DirectAdmin; otherwise password-reset mail cannot be delivered. |
| `PAYMENT_GATEWAY` | `zarinpal` (the `fake` gateway exists for the sandbox/test suite only). |
| `ZARINPAL_MERCHANT_ID` | The 36-character merchant id from the Zarinpal panel. Checkout answers 502 without it. |
| `ZARINPAL_SANDBOX` | `false` for live money. |
| `PAYMENT_CALLBACK_URL` | `https://api.example.com/api/v1/payments/callback` — reachable from the internet. |
| `PAYMENT_FRONTEND_RETURN_URL` | Where the shopper's browser lands after paying (the storefront's result page). Empty = the callback answers JSON only. |
| `HASH_DRIVER` | `bcrypt` (available everywhere). `argon2id` is stronger but needs the host's PHP built with libargon2 — preflight reports it. |

Notes that bite:

- **`env()` outside config files returns `null` once `config:cache` has run.** The administrator
  seeder reads `ADMIN_EMAIL`/`ADMIN_PASSWORD`, so create the administrator **before** warming the
  caches (§5–6).
- Changing `.env` on a cached install requires `php artisan optimize:clear` — the cached config, not
  the file, is what runs.
- Never commit `.env`; it is gitignored and holds every credential.

---

## 5. Install and first run

```bash
cd /home/USER/medora-api

composer install --no-dev --optimize-autoloader   # skip if you uploaded vendor/
php artisan migrate --force                       # creates the schema
php artisan db:seed --force                       # roles/permissions, settings, catalog, content

# The first administrator. Prompts for the password with hidden input and never echoes it.
php artisan admin:create --email=you@example.com --name="مدیر فروشگاه"

# Public media (product images) needs the symlink; private documents do not.
php artisan storage:link
```

`db:seed` is idempotent (`updateOrCreate`) and creates **no** demo customer, order or password. The
administrator seeder does nothing unless `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set — intended for
automated provisioning; the interactive `admin:create` is the normal path.

Then warm the caches, in this order:

```bash
php artisan optimize            # config + routes + views + events
```

---

## 6. Permissions and PHP settings

Directories that the application writes to must belong to the web server user's group and be
writable (`775`):

```
storage/  storage/app/  storage/framework/  storage/logs/  bootstrap/cache/
```

`app:preflight` fails when any of those is not writable. `storage/app/private` holds database
backups; `storage/logs/laravel.log` is the first place to look when something 500s.

In *PHP Selector → Options* for the domain's PHP version:

| Setting | Value | Why |
| --- | --- | --- |
| `display_errors` | `Off` | Otherwise PHP prints paths and errors to the browser. |
| `allow_url_include` | `Off` | Remote file inclusion. |
| `expose_php` | `Off` | Stops advertising the PHP version. |
| `upload_max_filesize` / `post_max_size` | ≥ `UPLOAD_MAX_KB` (5 MB default) | Otherwise uploads fail before validation sees them. |
| `memory_limit` | ≥ 256M | Image handling and Composer. |
| `opcache` | On | The API is a normal PHP app; opcache is the single biggest win. |

---

## 7. Cron

DirectAdmin → *Advanced Features → Cron Jobs*. Paste the two entries from `deploy/cron.example`,
replacing the PHP binary path and the application path:

```
* * * * * /usr/local/php83/bin/php /home/USER/medora-api/artisan schedule:run --no-interaction >> /dev/null 2>&1
* * * * * /usr/local/php83/bin/php /home/USER/medora-api/artisan queue:work --stop-when-empty --tries=3 --max-time=55 >> /dev/null 2>&1
```

The first runs what `routes/console.php` schedules (cart purge hourly, nightly database dump at
02:30, token and failed-job pruning daily). The second drains queued jobs — mail, mostly — and exits,
which is what replaces a Supervisor daemon on a shared host.

---

## 8. Verify the deployment

```bash
php artisan app:preflight            # exit 0 = no blocking problem; add --json for machines
php artisan about
curl -s -o /dev/null -w '%{http_code}\n' https://api.example.com/up   # 200 from Laravel's health route
curl -s https://api.example.com/api/v1/products?per_page=1 | head -c 300
```

Then exercise the real paths:

1. **Host check** — `curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: evil.example' https://<server-ip>/api/v1/products` must answer `400`.
2. **Login/token** — `POST /api/v1/auth/login` returns `data.token`; a request with `Authorization: Bearer <token>` to `/api/v1/auth/me` answers 200, and without it 401.
3. **Cart** — `GET /api/v1/cart` creates a guest basket and returns an `X-Cart-Token` header.
4. **Checkout** — place a real small order with the gateway in sandbox mode (`ZARINPAL_SANDBOX=true`) and confirm the callback settles it, then switch to live.
5. **Mail** — request a password reset and confirm the mail arrives (and that `queue:work` is draining).
6. **Audit** — after logging in as the administrator, `GET /api/v1/admin/audit-logs` shows the login event; check no credential appears in `metadata`.

---

## 9. Going live with Zarinpal

1. In the Zarinpal panel, set the callback URL to `https://api.example.com/api/v1/payments/callback`.
2. Set `ZARINPAL_MERCHANT_ID`, `PAYMENT_GATEWAY=zarinpal`, `ZARINPAL_SANDBOX=false`,
   `PAYMENT_CALLBACK_URL` and `PAYMENT_FRONTEND_RETURN_URL`, then `php artisan optimize:clear`.
3. Place one real low-value order end to end: gateway page → pay → callback → the order shows
   `payment_status=paid` and the inventory ledger records the sale.
4. Refund it from the Zarinpal panel and confirm the order status transition is what you expect.
5. `php artisan app:preflight` — the *Payment gateway configured* row must read `PASS`.

Amounts travel in **Toman** everywhere in the application and are converted to **Rial** only at the
gateway boundary (`config/payments.php` → `rial_multiplier`). Never send a client-computed amount.

---

## 10. Backups and restore

`db:backup` runs nightly at 02:30 (scheduled in `routes/console.php`) and writes a compressed dump to
the private disk (`storage/app/private`, `BACKUP_DISK=local`), keeping `BACKUP_KEEP_DAYS` (14) days.
Run one by hand before any risky change:

```bash
php artisan db:backup --keep-days=30
php artisan db:backup --path=/home/USER/backups
```

Restore:

```bash
mysql -u medora_api -p medora_api < /home/USER/medora-api/storage/app/private/backups/medora-YYYY-MM-DD.sql
```

Keep a copy **off the host** (DirectAdmin → *System Info & Files → File Manager*, or download it) —
a backup that lives only on the machine it protects is not a backup. The private disk is outside the
document root, so a dump is never downloadable, and it contains customer data: treat it as a
credential.

---

## 11. Deploying an update

```bash
cd /home/USER/medora-api

php artisan down --secret="$(openssl rand -hex 8)"   # optional maintenance window
# upload the new tree (or the encoded build — see docs/IONCUBE.md)
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear && php artisan optimize
php artisan up
```

`migrate --force` needs DDL on the database user (§3). Never edit a migration that has already run on
the host — write a new one.

---

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Every request answers `400 Bad Request` | Host header not in `TRUSTED_HOSTS` | Add the domain (leading dot for subdomains); confirm the docroot points at `public/`. |
| Storefront writes answer `403`/CORS errors | Origin not allowed | Add the exact origin to `CORS_ALLOWED_ORIGINS`; `optimize:clear` after editing `.env`. |
| HTTP 500, empty log | PHP fatal before Laravel booted (loader, extension, syntax) | Read the account's PHP error log; run `php artisan app:preflight` from the CLI. |
| HTTP 500, "Permission denied" | `storage/` or `bootstrap/cache/` not writable | Set `775` and the web server's group. |
| Checkout answers 502 | `ZARINPAL_MERCHANT_ID` empty or the gateway is unreachable | Set the merchant id; check outbound HTTPS from the host. |
| Payment returns but the order stays pending | Callback URL unreachable, or `Status` was not `OK` | `PAYMENT_CALLBACK_URL` must be public HTTPS; check `payments` rows and the audit log. |
| No password-reset mail | Queue not draining, or `MAIL_*` wrong | `php artisan queue:monitor default`, `php artisan queue:failed`, verify the cron entries. |
| Product images 404 | `/storage` symlink missing | `php artisan storage:link`. |
| `Specified key was too long` while migrating | MySQL older than 8.0 with `utf8mb4` | Use MySQL 8.0 / MariaDB 10.11+, or set the index length in `config/database.php`. |
| `Access denied … CREATE` during `migrate` | The database user has no DDL | Grant `CREATE, ALTER, DROP, INDEX, REFERENCES` for the migration, then revoke (§3). |
| Config changes have no effect | `config:cache` is active | `php artisan optimize:clear`, then `php artisan optimize`. |
| Administrator seeder created nobody | `ADMIN_EMAIL`/`ADMIN_PASSWORD` unset — or `config:cache` ran first, hiding `env()` | Run `php artisan admin:create`, or seed before caching config. |

---

## 13. First-deployment checklist

- [ ] Document root points at `public/`; nothing else in the home directory is web-reachable.
- [ ] `.env` filled in, `APP_KEY` generated on the server, `chmod 600`, `APP_DEBUG=false`.
- [ ] Database created with a dedicated user; `DELETE` revoked on `audit_logs`.
- [ ] `composer install --no-dev --optimize-autoloader`, `migrate --force`, `db:seed --force`.
- [ ] `admin:create` run; password is strong and unique.
- [ ] `storage/` and `bootstrap/cache/` writable (`775`, web server group); `storage:link` done.
- [ ] PHP settings hardened (`display_errors` off, upload limits ≥ `UPLOAD_MAX_KB`, opcache on).
- [ ] Both cron entries installed and firing.
- [ ] `php artisan app:preflight` exits `0`.
- [ ] `/up` answers 200, `/api/v1/products` answers JSON, a foreign `Host` answers 400.
- [ ] Login → cart → checkout → payment verified end to end (sandbox, then live).
- [ ] `db:backup` ran once and the dump was copied off the host.
- [ ] Source protection decided: either accept readable source, or deploy the encoded build
      (`docs/IONCUBE.md`) and remove the plain tree from the host.
