# STYLEON / MEDORA — deploying the project on your own server

This archive is the whole project as it runs: the storefront, the service behind its checkout, and
the API with the admin panel. Nothing here is a WordPress theme and nothing here needs WordPress —
that folder was left out of the export on purpose.

Read this file top to bottom once; §11 is the checklist to run after the first deployment.

---

## 1. What the project is made of

Three parts, and they are deployed separately:

| part | folder | what it is | runtime |
| --- | --- | --- | --- |
| **Storefront** | `src/`, `index.html`, `public/` → built into `dist/` | React 18 + TypeScript + Vite single-page app. All pages, routes, the header/mega menu, footer, hero, shop, product, cart, checkout, blog, FAQ, account, and the admin panel's UI. | any static web server (Apache, LiteSpeed, nginx) |
| **Checkout & commerce service** | `server/index.mjs` | Dependency-free Node service: starts and verifies Zarinpal payments, and (optionally) proxies a headless WooCommerce store. | Node.js 18 or newer |
| **API + admin backend** | `backend/` | Laravel application: catalogue, content, cart, orders, accounts, two-factor auth, roles/permissions, audit log, media, and the admin panel's endpoints. | PHP 8.3+, MySQL 8.0 / MariaDB 10.11+ |

### How the browser reaches them

The storefront is one origin; every call it makes is a path on that origin:

```
https://shop.example.com/                → the SPA (index.html)
https://shop.example.com/api/v1/…        → the Laravel API          (catalogue, cart, orders, auth, admin)
https://shop.example.com/api/payment/…   → the Node service         (Zarinpal request + callback)
https://shop.example.com/api/commerce/…  → the Node service         (optional WooCommerce bridge)
https://shop.example.com/<admin-path>    → the admin panel's UI (served by the SPA), e.g. /medora-panel
```

That single-origin layout is the one the app is written for: the payment service refuses a
state-changing request carrying a foreign `Origin`, and the browser's own basket session has no CORS
to negotiate. Keep it if you can — §5 and §6 show how.

---

## 2. What the host must provide

- **PHP 8.3 or newer** with `ctype curl dom fileinfo filter hash mbstring openssl pcre pdo pdo_mysql
  session tokenizer xml`. `php artisan app:preflight` checks every one of them and tells you what is
  missing (`backend/docs/DEPLOYMENT-DIRECTADMIN.md` §1).
- **MySQL 8.0 or MariaDB 10.11+** — the schema uses `utf8mb4` index lengths older MySQL rejects.
- **Node.js 18+** — only for real online payments and the optional WooCommerce bridge. The rest of
  the site runs without it (see §7).
- **Composer** — optional. `backend/vendor/` is included in this archive, so the server needs
  nothing but PHP.
- **Cron** — two entries; see §6.
- HTTPS. The storefront is served over TLS, and the payment service only sends HSTS when it sees
  `X-Forwarded-Proto: https`.

---

## 3. Upload and directory layout

Unpack the archive anywhere outside the web root and keep the three parts together:

```
/home/USER/styleon/                     ← this project
├── src/  public/  index.html  …         ← storefront source
├── dist/                                ← the built storefront (ready to upload, see §4)
├── server/                              ← the Node service
├── backend/                             ← the Laravel application
├── .env.example                         ← storefront + Node service template
└── DEPLOYMENT.md                        ← this file
```

Then:

- the **contents of `dist/`** (not the folder) go into the shop domain's document root, e.g.
  `/home/USER/domains/shop.example.com/public_html/`. It must contain `index.html` and `.htaccess`
  at its top level.
- **`backend/`** goes *above* a web root, never inside `public_html/`. Point the API domain's
  document root at its `public/` folder:
  `/home/USER/styleon/backend/public`.

Never upload `.env`, `vendor/` or `storage/` into a publicly served folder — a downloadable `.env`
hands over your database password and `APP_KEY`.

---

## 4. The storefront

`dist/` in this archive is already built. To change anything, or to point the build at your own
addresses, rebuild it:

```bash
cd /home/USER/styleon
cp .env.example .env      # then edit it — see §8
npm ci
npm run build             # writes dist/
```

> `VITE_*` values are **baked into the bundle while it builds**. Editing `.env` afterwards changes
> nothing until you rebuild.

Upload the contents of `dist/` over the previous ones. `dist/.htaccess` is part of the build: it
compresses text assets, caches the hashed `assets/*` for a year, and rewrites every URL that is not
a real file to `index.html` — which is what makes a deep link (`/shop`, `/product/…`, `/medora-panel`)
work on refresh. It also leaves `/api/` alone, so the API paths below reach your server rather than
the SPA. On nginx you must express those three things yourself.

Nothing else about the storefront needs configuration: the fonts, product photos, hero images, logos
and the trust seal all ship inside `dist/`.

---

## 5. The API and admin backend (Laravel)

```bash
cd /home/USER/styleon/backend
cp .env.example .env
php artisan key:generate          # on the server, so APP_KEY is yours
# edit .env: APP_URL, DB_*, MAIL_*, CORS_ALLOWED_ORIGINS, TRUSTED_HOSTS, PAYMENT_*
php artisan migrate --force
php artisan db:seed --force       # roles, permissions, settings, the catalogue
php artisan admin:create          # the first administrator account (hidden password prompt)
php artisan storage:link          # only if you upload media through the panel
php artisan app:preflight         # the host check — must report no blocking problems
```

Then the cron entries: `backend/deploy/cron.example` has both lines with the placeholders
explained. `php artisan schedule:run` every minute, and
`php artisan queue:work --stop-when-empty --tries=3 --max-time=55` every minute.

`backend/docs/DEPLOYMENT-DIRECTADMIN.md` is the long version of this step and covers what this file
does not: file permissions and PHP settings (§6), the exact cron entries (§7), how to verify the
deployment (§8), switching Zarinpal from sandbox to live (§9), backups and restore (§10), deploying
an update (§11) and troubleshooting (§12). `backend/docs/API.md` documents every endpoint,
`backend/docs/SECURITY.md` the threat model and what the host owns.

**The admin panel** is served by the storefront at a path of its own — `/medora-panel` by default.
It is a setting, not a deployment: the shop's own Settings screen can move it to another path, and
the storefront asks the API for the current one at load. Every admin route is guarded server-side by
`can:admin.access` plus a named permission, so the path is obscurity, never the lock. Administrators
must enrol a second factor (authenticator app); `TWO_FACTOR_ENFORCE_ADMINS` in the API's `.env`
controls whether it is required.

---

## 6. Routing `/api` on the shop's origin

If the API lives on its own host (say `api.example.com`) and the Node service runs next to the
storefront, the shop domain's web server needs three rules:

```apache
# 1. The Laravel API — either proxied to its own host…
ProxyPass        /api/v1  https://api.example.com/api/v1
ProxyPassReverse /api/v1  https://api.example.com/api/v1

# 2. …or served in place, if the API's public/ folder is reachable from this domain.
#    (Then skip rule 1 and set VITE_API_BASE_URL=/api/v1.)

# 3. The Node service, on the loopback port it listens on (§7).
ProxyPass        /api/payment   http://127.0.0.1:8000/api/payment
ProxyPassReverse /api/payment   http://127.0.0.1:8000/api/payment
ProxyPass        /api/commerce  http://127.0.0.1:8000/api/commerce
ProxyPassReverse /api/commerce  http://127.0.0.1:8000/api/commerce
```

Rules 1 and 3 need `mod_proxy` (and `mod_proxy_http`) enabled in the domain's vhost; a shared
hosting panel may expose them as "reverse proxy" settings rather than as raw directives, and some
plans do not allow them at all. If the API cannot be proxied, give the storefront its address
directly instead — build with `VITE_API_BASE_URL=https://api.example.com/api/v1` and add the shop's
origin to `CORS_ALLOWED_ORIGINS` in `backend/.env`, or every request is refused.

Rules for `/api/payment` and `/api/commerce` are **not optional** while real payments are on: those
paths are relative in the app, so the service has to answer on the shop's own origin. Without them,
the checkout cannot reach Zarinpal (see §7 for the alternative).

On DirectAdmin's Node.js application support you can mount `server/` at `/api` on the shop's domain
instead of proxying: the application's startup file is `server/index.mjs`, and the paths it must
receive are `/api/payment/*` and `/api/commerce/*`.

---

## 7. The checkout service (Node)

```bash
cd /home/USER/styleon
cp .env.example .env      # SITE_URL, ZARINPAL_*, PAYMENT_API_PORT
node server/index.mjs
```

It has no dependencies — no `npm install` step, no build. It reads its configuration from the
environment; a small systemd unit is the usual way to keep it running:

```ini
# /etc/systemd/system/styleon-payment.service
[Unit]
Description=STYLEON checkout service
After=network.target

[Service]
WorkingDirectory=/home/USER/styleon
EnvironmentFile=/home/USER/styleon/.env
ExecStart=/usr/bin/node server/index.mjs
Restart=always
User=USER

[Install]
WantedBy=multi-user.target
```

Two things worth knowing:

- **Payments in flight live in the service's memory.** Restarting it forgets a payment that is
  still at the bank; the shopper lands back on the checkout page. Nothing else is affected.
- **If you cannot run Node**, build the storefront with `VITE_PAYMENT_GATEWAY=sandbox`. The checkout
  then uses the in-app stand-in bank page: it exercises the whole flow but **moves no money**, so
  orders arrive as pay-on-delivery/awaiting. Real online payment needs the service.

Live payments additionally need, in `.env`:

```
SITE_URL=https://shop.example.com
ZARINPAL_MERCHANT_ID=<36-character merchant id from zarinpal.com>
ZARINPAL_SANDBOX=0
```

and a storefront built with `VITE_PAYMENT_GATEWAY=zarinpal`.

---

## 8. Environment variables

Two templates, both included:

- **`.env.example`** (project root) — the storefront build (`VITE_API_BASE_URL`,
  `VITE_PAYMENT_GATEWAY`) and the Node service (`PAYMENT_API_PORT`, `SITE_URL`, `PREVIEW_ORIGIN`,
  `ZARINPAL_*`, and the optional `WOO_*` bridge). Every value is commented in the file.
- **`backend/.env.example`** — the API: application URL and key, database, sessions/cache/queue,
  filesystem and media disks, mail, CORS and trusted hosts, proxy trust, rate limits, two-factor
  policy, login lockout, payments.

Neither file contains a credential; every secret is left blank for you to fill in. `APP_KEY` is
generated on the server with `php artisan key:generate` — do not copy one between installations.

**Secrets never belong in the storefront bundle.** Vite inlines every `VITE_*` value into
JavaScript the browser downloads, so the Zarinpal merchant id, database credentials and mail
passwords live only in the API's and the service's environment.

---

## 9. Database

The schema is defined by the migrations in `backend/database/migrations/` and created by
`php artisan migrate`; `php artisan db:seed` loads the reference data the application needs —
roles and permissions, settings, the admin path, the catalogue with its categories, and the
administrator account from `ADMIN_EMAIL`/`ADMIN_PASSWORD` when those are set. Both commands are
idempotent, so re-running them on an update is safe.

Set the connection in `backend/.env` (`DB_CONNECTION=mysql`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`,
`DB_USERNAME`, `DB_PASSWORD`), keeping `DB_CHARSET=utf8mb4` and `DB_STRICT_MODE=true`. Create the
database and a dedicated user in your panel first; `backend/docs/DEPLOYMENT-DIRECTADMIN.md` §3 also
shows how to make the audit trail append-only for the application user, and §10 covers backups.

The catalogue's product photos are files inside `dist/catalog/`, not rows in the database: the media
table records the address the photo is published at, so the images travel with the storefront.

---

## 10. What is external, and what the export leaves out

**Services the project talks to that are not part of this archive:**

| service | needed for | what you must do |
| --- | --- | --- |
| **Zarinpal** | real online payments | create the gateway in your Zarinpal panel and set `ZARINPAL_MERCHANT_ID` + `ZARINPAL_SANDBOX=0` (§7) |
| **SMTP mail** | verification and password-reset e-mails | set `MAIL_*` in `backend/.env`; with `MAIL_MAILER=log` those mails are only written to the log |
| **images.unsplash.com** | the editorial artwork that is not bundled: category tiles, promo tiles, blog photos, avatars | nothing to configure — they are public URLs — but they do load from Unsplash's CDN. Localise them into `public/` if you need the site to be fully independent |
| **trustseal.enamad.ir** | the trust seal in the footer | the seal image ships with the site; the link points at eNamad's verification page |
| **Cloudflare Turnstile** | optional bot protection on register/login/password-reset | off by default (`TURNSTILE_ENABLED=false`); needs a real site/secret pair to switch on |
| **WooCommerce** | the optional headless bridge | inactive while `WOO_STORE_URL` is empty. The current store does not use it |

**Deliberately not in this archive:** `node_modules/` (run `npm ci`), every `.env` file, runtime
logs and caches, the Base44 development environment (`docker-compose.base44.yml`, `.base44/`,
`AGENTS.md` — it names the sandbox's own hosts), and the optional WordPress theme (`wp-theme/`,
`tools/build-theme.mjs`, its `theme:*` npm scripts and the theme archives). No file in the built
storefront references Base44 or any sandbox address.

**No `docker-compose.yml` is shipped.** The project's own deployment target is the PHP hosting
described in §3–§6; if you would rather run it on a VPS with containers, the three parts and their
paths above are all a compose file needs, but that configuration would be yours to write and test.

---

## 11. After deploying — checklist

```bash
# the API answers and the database is reachable
curl -s -o /dev/null -w '%{http_code}\n' https://api.example.com/up                    # 200
curl -s https://api.example.com/api/v1/products | head -c 200                          # JSON catalogue
curl -s https://api.example.com/api/v1/products/filters | head -c 120                   # the filter rail's options
curl -s https://api.example.com/api/v1/content/settings | head -c 120
curl -s https://api.example.com/api/v1/content/admin-path                              # {"data":{"path":"…"}}

# the checkout service answers on the shop's own origin
curl -s https://shop.example.com/api/payment/health                                    # {"ok":true,…}
```

Then, in a browser:

1. the home page renders with its hero image, and the console has no errors;
2. a deep link (`/shop`, `/product/<id>`) survives a **refresh** — that is the `.htaccess` rewrite;
3. the shop lists products and the filters narrow them (the API is reachable from the browser);
4. a product can be added to the basket and the cart drawer opens;
5. the checkout reaches the payment step — with `sandbox` it lands on the stand-in bank page, with
   `zarinpal` it goes to Zarinpal and comes back to `/checkout?payment=…`;
6. the order appears in the admin panel at `/<admin-path>` → Orders;
7. an administrator can sign in, and is asked for the authenticator code;
8. `php artisan app:preflight` reports no blocking problems on the server.

Anything that fails at step 3 or 5 is almost always the routing in §6 rather than the application:
check that `/api/v1/products` answers on the API's own address first, then on the shop's origin.

---

## 12. Honest limits of the current application

These are properties of the site as it is built today, not deployment mistakes:

- The basket, the wishlist, coupon codes, the coin balance and the **customer accounts** live in the
  browser's `localStorage` (`src/context/`), because the storefront was written as a client-side
  app. The Laravel API holds the catalogue, the orders, the accounts used by the API's own endpoints
  and the admin panel. Moving the basket and the customer accounts onto the API is a development
  task, not a configuration one.
- The amount a checkout posts is validated for **shape** by the payment service, and the API
  re-prices every recorded order line from its own catalogue. Only a fully server-side basket would
  prove the amount before the money moves.
- The admin panel's UI is part of the storefront bundle, so it is deployed with it; its data comes
  from `/api/v1` and is protected there.
