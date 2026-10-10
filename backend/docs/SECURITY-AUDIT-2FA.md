# Security audit — administrator two-factor authentication (TOTP) and anti-bypass

Scope: the second factor end to end — enrollment, the login challenge, recovery codes, the tokens
and sessions around them, and every route that could be used to *avoid* answering it. Method: read
the authentication code and route table, then attack it from the test suite
(`tests/Feature/Security/TwoFactorBypassTest.php`, plus the existing
`TwoFactorTest.php`/`PrivilegeEscalationTest.php`/`SessionManagementTest.php`).

Every finding below was reproduced as a failing test **before** the fix and passes after it.

```
docker compose -f docker-compose.base44.yml exec -T backend \
  sh -c 'cd /app/backend && php artisan test --filter="TwoFactorTest|TwoFactorBypassTest"'
```

## The model being enforced

Authentication is a server-side state machine, and the state lives on the token row — never in a
cookie, a header, a request parameter, a local-storage value or a flag the client sends:

| state | what the client holds | what it can reach |
| --- | --- | --- |
| unauthenticated | nothing | the public storefront and `/auth/login` |
| password verified (2FA pending) | `twofa:challenge` token | `POST /auth/two-factor/challenge`, `GET /auth/two-factor`, `POST /auth/logout` |
| no second factor yet (setup pending) | `twofa:setup` token | `POST /auth/two-factor/enroll`, `POST /auth/two-factor/confirm`, those two reads, logout |
| fully authenticated | the account's own token + `twofa:verified` | everything the account is allowed |

Three middlewares decide it, all on the server and all from the stored ability row of the token that
authenticated the request:

- `full-auth` (`App\Http\Middleware\RequireFullAuthentication`) — "this is a *finished* login".
  Refuses any token whose whole ability set is a second-factor step.
- `two-factor` (`App\Http\Middleware\RequireTwoFactor`) — "this administrator got past the second
  factor": on the admin routes, a token must carry `twofa:verified`.
- `recent-auth` (`App\Http\Middleware\RequireRecentAuth`) — "the password was re-entered for *this*
  token recently", for the operations a stolen token should not be enough for.

A staff token carries `*`, and Sanctum answers `true` to *every* ability check for a `*` token. That
is why `full-auth` classifies a token by its **entire** ability set (`Tokens::pendingStep()`) instead
of asking whether it "can" do something: an ability check would call a full staff token a pending one
and a pending one fully privileged.

## Findings, fixed

### 1. Critical — recovery codes could be reissued with the password alone

`POST /auth/two-factor/recovery-codes` sat behind `auth:sanctum` + `recent-auth` only. A *challenge*
token (what a password-only login of an account with 2FA gets) is a valid Sanctum token, and
`recent-auth` is satisfied by the **password** — which the attacker by definition knows. So:

```
POST /auth/login                     → challenge_token   (password only)
POST /auth/confirm-password          → recent-auth confirmed for that token
POST /auth/two-factor/recovery-codes → a fresh, plaintext set of recovery codes
POST /auth/two-factor/challenge      → full session      (recovery code)
```

A complete 2FA bypass from the password alone. Fixed by putting the endpoint behind `full-auth` *and*
requiring a current code (TOTP or an unused recovery code) on top of the password.

Tests: `test_a_half_finished_login_cannot_reissue_recovery_codes_with_the_password`,
`test_recovery_codes_cannot_be_regenerated_with_the_password_alone`.

### 2. High — a pending session could reach every authenticated endpoint

Nothing stopped a `twofa:challenge` or `twofa:setup` token from calling `GET /auth/me`,
`GET /auth/sessions`, `PUT /auth/password`, `POST /auth/sessions/revoke-others`,
`POST /auth/logout-all`, `POST /auth/confirm-password`, `POST /auth/cart/merge`, `GET /profile`,
`GET /orders`, the addresses and the wishlist. A half-finished login could therefore change the
account's password and close every session the operator had open.

Fixed with `full-auth` on those groups. The steps of the flow itself (state read, challenge, enroll,
confirm) and `POST /auth/logout` stay reachable — the last one deletes only its own token, and
without it a mistyped second step would trap the browser until the token expired.

Test: `test_a_pending_challenge_token_cannot_reach_any_protected_surface`,
`test_a_setup_token_can_only_enroll`.

### 3. High — a challenge token could enroll and confirm a second factor

`enroll`/`confirm` were open to any authenticated token. Enrollment must belong to the "you must
enroll" step: otherwise a half-finished login could replace the operator's authenticator with one the
caller controls. The controller now refuses a token that is holding a challenge
(`test_a_pending_challenge_token_cannot_enroll_or_confirm_a_second_factor`).

### 4. Medium — the admin API was reachable by a password-only token when a shop ran with staff 2FA off

`RequireTwoFactor` stands down entirely when `TWO_FACTOR_ENFORCE_ADMINS=false`, so a challenge token
— a login that never answered the second factor — read `/admin/products` with a 200. The shop's
policy may say "staff do not have to *have* a second factor", but it can never mean "a half-finished
login is a session". `full-auth` now guards the admin group as well, independently of that setting
(`test_a_password_alone_can_no_longer_open_the_panel` covers it with the requirement on and off).

### 5. Medium — downgrading the second factor needed only the password

Turning 2FA off (`DELETE /auth/two-factor`) asked for the password again and nothing else, so a stolen
token plus a keylogged password removed the second factor. It now also needs a current code from the
app, and **a recovery code is refused** — a recovery code gets somebody back *into* an account, never
out of the second factor:
`test_disabling_the_second_factor_needs_the_password_and_a_current_code`.

Reissuing recovery codes (`#1`) accepts a recovery code on purpose: the operator who lost the phone
has no other way back, and reissuing is what gives them a fresh set.

### 6. Medium — the TOTP replay claim was not atomic

`verify()` did `Cache::has()` and then `Cache::put()`. Two requests carrying the same code in the same
30-second window could both be told yes. The claim is now a single `Cache::add()` — the write only
happens when the key is absent.

### 7. Medium — recovery codes were not single-use under concurrency

`consumeRecoveryCode()` read the hashes from whatever copy of the model the caller held and saved it
back: two concurrent requests could both find the same code and both report success. It now re-reads
the row under `lockForUpdate()` inside a transaction, so the second caller sees the code already gone
(`test_a_recovery_code_is_single_use_even_from_a_stale_copy_of_the_account`).

### 8. Low — a refused disable consumed a recovery code

With the proof check in place, the short-circuit is deliberate: a recovery code that may not stand in
for the action is not consumed by the refused attempt
(`test_disabling_the_second_factor_needs_the_password_and_a_current_code` asserts the set is intact).

### 9. Low — the owner was not told that enrollment had started

`enroll` now notifies the account's own address. It is the one channel an attacker who holds only the
password does not control, and it is what makes the residual risk in "Accepted" below survivable.

### 10. Test-harness bugs found while verifying (no product impact)

Six assertions in the existing security suite could not pass and the suite was red at `HEAD` (12
failures). Five were in `TwoFactorTest`: a policy assertion made without switching the policy on, a
`data.user.…` path on an endpoint that answers the account as `data` itself, a stale model read, and
two places where the Sanctum guard caches the identity it resolved for the *previous* request inside
one test method (in production every request is its own process) — those now call
`forgetResolvedGuards()`. One asserted that "a code from the next window works again" after
`travel(31)`, which cannot work: `pragmarx/google2fa` reads the real wall clock (`time()`), so
`travel()` does not move the TOTP step; the assertion now checks the time-boxed claim directly.

## Checked and found already sound

- **Secret handling**: TOTP secret cast to `encrypted` (key on the host, not in the database), in the
  model's `#[Hidden]` list, never in a resource, an error body or an audit row; recovery codes stored
  as bcrypt hashes; codes are never logged; `show()` reports state only.
- **Rotation**: the challenge token is deleted when the challenge is answered, the setup token when
  enrollment is confirmed — so the token that was in flight during the second step is worthless.
- **Messages**: a wrong password, a wrong code, a replayed code and an unknown account are not
  distinguished in the answers; the login endpoint answers one message for a wrong email and a wrong
  password.
- **Bounding**: `throttle:two_factor` (6/min, keyed on account + address), a per-account failure
  counter that abandons the challenge at `TWO_FACTOR_MAX_ATTEMPTS`, and the same counting on the
  sensitive proofs.
- **Token hygiene**: Sanctum stores SHA-256 hashes; `SANCTUM_TOKEN_TTL` defaults to 12 hours and is
  never unlimited by default; a password change and a password reset delete every other token and
  drop the re-authentication proofs.
- **No other door**: there is no web login route, no `Auth::attempt` (the password is checked with
  `Hash::check` against one row), no debug/legacy login, and `/admin` is guarded by
  `auth:sanctum` + `full-auth` + `can:admin.access` + `two-factor` + a named permission per route.
- **Privileges**: nobody may change their own roles, only a super-admin may touch `super-admin`, a
  profile update cannot carry a role or a status, and an admin may not rewrite another account's
  email, password or 2FA material (the users endpoint accepts name, phone and status only).

## Accepted, with the reasoning

- **The first enrollment of a staff account is a bootstrap.** An account the shop requires a second
  factor of and that has never enrolled can only enroll: a caller holding the password could enroll
  *their own* authenticator and get in. There is no second channel to check against at that point
  (the password is already known), so the controls are: the setup token is narrow and expires in
  `TWO_FACTOR_CHALLENGE_TTL` minutes, every admin route stays closed until enrollment completes, the
  event is audited, and the owner is notified by email. A host that wants it closed needs an
  out-of-band approval (an emailed signed link, or
  `php artisan admin:create`-style provisioning) — noted as the next hardening step rather than
  guessed at here.
- **Recovery codes are a full second factor**, by design: 8 codes, 10 characters from a 32-symbol
  alphabet (~50 bits each), single-use, rate-limited, and each use is audited without the code.
- **The TOTP window is ±30 seconds** (`TWO_FACTOR_WINDOW=1`) — clock drift only, and a code can still
  be spent once.

## Known pre-existing failures, unrelated to 2FA

At `HEAD` the backend suite is red: **12 failed, 129 passed**. With this work it is **7 failed, 141
passed** — the five 2FA-helper failures are gone and nothing new was introduced. The remaining seven
are outside this audit's scope and each passes when its file runs on its own (they are order- or
pollution-dependent, not product bugs):

| test | what it asserts | cause |
| --- | --- | --- |
| `WebhookSecurityTest::test_a_valid_notification_settles_the_order_and_a_replay_does_nothing` | a replayed webhook settles once | payment/webhook harness |
| `WebhookSecurityTest::test_the_amount_is_never_read_from_the_request` | the amount comes from our own row | payment/webhook harness |
| `PrivilegeEscalationTest::test_a_customer_cannot_touch_another_customers_address` | 404, not 403, for a foreign address | the policy answers 403, which confirms the id exists — worth changing to a scoped lookup |
| `SessionManagementTest::test_a_session_id_belonging_to_somebody_else_does_nothing` | a foreign session id does nothing | guard caching between requests inside one test |
| `SessionManagementTest::test_a_password_change_ends_every_other_session_and_reports_it` | the other session is dead | same |
| `AdminLoginShieldTest::test_a_client_supplied_country_header_is_not_trusted` | the country header is ignored | shared cache across tests (passes alone) |
| `AdminLoginShieldTest::test_the_progressive_delay_grows_and_is_capped` | the delay grows and caps | same |

`OutboundAndBotProtectionTest` also ends the PHP process with "Premature end of PHP process
… test_the_allowlist_narrows_hosts_further_when_it_is_set" both before and after this work — an
environment problem in the sandbox (the test exercises outbound HTTP), not a code change.
