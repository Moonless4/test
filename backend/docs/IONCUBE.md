# Encoding the API with ionCube

The application is deployed to a **shared DirectAdmin host**, where the PHP files sit in a home
directory the account owner (and, on a badly configured host, other processes) can read. Encoding
the application code with the ionCube Encoder puts the business logic beyond casual reading and
prevents a copy of the source from being lifted off the server.

This document is the procedure. `php artisan app:preflight` reports whether the loader is present
(it is deliberately informational — an un-encoded deployment runs fine without it, and an encoded
one cannot run without it).

---

## 1. What encoding does and does not do

**It does:** compile the application's PHP into bytecode that only the ionCube Loader can execute,
so the files are not human-readable and cannot be edited on the host.

**It does not:** hide data (`.env` stays plain text — protect it with file permissions), protect
`vendor/` (third-party code is not yours to license, and encoding it breaks Composer), or replace
access control. A stolen `.env` is still a stolen database password, so §6 matters more than
encoding does.

Keep an **unencoded copy of every release** on the build machine. The encoded build is a deployable
artifact, never the master.

---

## 2. Requirements

| Where | What | Why |
| --- | --- | --- |
| Build machine | ionCube Encoder, licensed (ioncube.com) | Encoding is a build step; the encoder licence stays on your machine, never on the host. |
| Build machine | The same PHP major as the host (8.3/8.4) | Choose the Encoder release whose supported-PHP list covers the host's version — `ioncube_encoder --help` prints it. |
| Host | ionCube **Loader** for the selected PHP version | Free, and DirectAdmin normally offers it: *Extra Features → Install ionCube* or *PHP Selector → Extensions*. |
| Host | Loader available to **both** SAPIs | The web SAPI is the obvious one; cron runs `artisan` through the **CLI** SAPI, and some hosts enable the loader for only one of them. |

---

## 3. What to encode, what to leave alone

| Path | Encoded? | Note |
| --- | --- | --- |
| `app/` | **Yes** | Models, controllers, services, policies, commands — the logic worth protecting. |
| `config/` | **Yes** | Encoded config files still `return` their array; `config:cache` works normally. |
| `routes/` | **Yes** | |
| `database/` | **Yes** | Migrations and seeders execute fine encoded. |
| `bootstrap/` | Optional | Kept plain here for simplicity; `bootstrap/app.php` may be encoded if you want. |
| `public/` | No | `index.php` is the web entry point and `.htaccess` is read by the web server. |
| `resources/` | No | **Blade templates are read as text at compile time** — an encoded `.blade.php` cannot be compiled. Frontend assets also live here. |
| `vendor/` | No | Composer installs it; encoding it is both pointless and unsupported. |
| `storage/`, `.env`, `artisan` | No | Writable state, configuration, and the CLI entry point. |

---

## 4. Build the encoded release

Run this **on the build machine**, from a clean checkout of the tag being deployed. Write the output
outside the repository — the encoded tree is an artifact, not source.

```bash
cd /path/to/backend

# 1. Install production dependencies first: the encoded tree ships vendor/ as Composer produced it.
composer install --no-dev --optimize-autoloader

# 2. Encode. Flag spelling varies slightly between Encoder releases — check
#    `ioncube_encoder --help` once, then keep the command in the release script.
ioncube_encoder \
  --replace-target \
  --optimize \
  --no-doc-comments \
  --into ~/releases/medora-api-$(date +%Y%m%d) \
  app config routes database

# 3. Copy everything that must stay plain into the same tree (verbatim).
rsync -a --exclude 'app' --exclude 'config' --exclude 'routes' --exclude 'database' \
      --exclude '.git' --exclude 'node_modules' --exclude 'tests' --exclude 'storage/logs/*' \
      ./ ~/releases/medora-api-$(date +%Y%m%d)/

# 4. Smoke-test the artifact before it goes anywhere near the host: the loader is required to run it,
#    so a machine without the loader is expected to fail here ("requires the ionCube PHP Loader").
```

Two checks on the result:

- `app/Http/Controllers/...` files must no longer be readable text.
- `resources/views/**/*.blade.php`, `.env.example` and `public/index.php` must still be plain.

`--into <dir>` writes to a clean directory; `--replace-target` lets a re-run overwrite it. If your
Encoder release spells an option differently, prefer the documented spelling from `--help` over the
line above — the intent is: encode the four source trees, keep everything else verbatim.

---

## 5. Deploy

1. Upload the encoded tree to the host (SFTP, or a `tar.gz` unpacked in the home directory).
2. Point the domain's **document root at `public/`** — see `docs/DEPLOYMENT-DIRECTADMIN.md` §2.
3. `cp .env.example .env` (first deploy only), fill it in, `php artisan key:generate`.
4. `php artisan migrate --force`, create the administrator, then warm the caches.
5. Confirm the loader is live for **both** SAPIs:

```bash
php -m | grep -i ioncube                     # CLI SAPI (cron uses this one)
php -r 'echo function_exists("ioncube_loader_version") ? ioncube_loader_version() : "not loaded";'
php artisan app:preflight                    # the ionCube row: PASS or INFO
curl -s -o /dev/null -w '%{http_code}\n' https://api.example.com/up
```

For the web SAPI use the panel (*PHP Selector → Extensions*) rather than dropping a `phpinfo()` file
on a live host, and never leave one behind.

---

## 6. Protecting what encoding does not

- `.env`: `chmod 600 .env`; it holds the database password, `APP_KEY` and the Zarinpal merchant id.
- `storage/`: writable by the web server user, readable by nobody else (`775`, same group).
- The database user is not the MySQL root account (see the deployment guide).
- `APP_DEBUG=false` in production — otherwise a stack trace prints paths and configuration.
- Delete the plain source from the host when you switch to an encoded build; two copies means the
  readable one is the one that leaks.

---

## 7. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| *"Site error: the file … requires the ionCube PHP Loader to be installed"* | Loader missing for that PHP version and/or that SAPI | Enable ionCube for the selected PHP version in the panel; re-check both CLI and web. |
| *"the file was encoded for a different version of the Loader"* | Encoder and loader versions are incompatible | Update the loader in the panel, or re-encode with a release matching the host's loader. |
| HTTP 500 with an empty `storage/logs/laravel.log` | PHP died before Laravel booted — almost always the loader | Check the account's PHP error log; the loader failure is printed there, not in Laravel's log. |
| *"Unexpected end of file"* / blank page after upload | An upload truncated a binary encoded file (FTP in ASCII mode) | Re-upload with SFTP/SCP in binary mode. |
| Blade view renders empty or the view cache fails | `resources/views` was encoded | Re-deploy with `resources/` plain; Blade reads its templates as text. |
| `artisan` works from cron but the site fails (or vice versa) | Loader enabled for one SAPI only | Enable it for both in the panel. |
| Composer complains about a file in `vendor/` | `vendor/` was encoded | Never encode `vendor/`; re-run `composer install --no-dev`. |

---

## 8. Rolling back to unencoded source

The encoded artifact is a drop-in replacement for the plain tree: both run the same code with the
same `.env` and database. If the loader turns out to be unavailable on the host, redeploy the plain
release (without `APP_DEBUG`) and open a ticket with the host — an unencoded deployment is fully
functional, it simply leaves the source readable.
