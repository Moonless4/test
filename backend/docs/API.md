# Medora API reference

Headless REST API for the Medora storefront: catalogue, basket, checkout, payments, content,
customer accounts and administration.

- **Base URL** — `<APP_URL>/api/v1` (e.g. `https://api.example.com/api/v1`). Every application route
  is versioned from the first release; there is no unversioned path except `/` and `/up`.
- **Format** — JSON in, JSON out, UTF-8. Send `Accept: application/json` and, on a write,
  `Content-Type: application/json`.
- **Bare domain** — `GET /` answers a small JSON banner (`name`, `status`, `api`, `documentation`).
  `/up` is Laravel's health route (200 when the application boots).

---

## 1. Conventions

| Convention | Detail |
| --- | --- |
| **Money** | Integers in **Toman** — never a string, never Rial, never a float. Rial conversion happens only inside the gateway call. The currency code is `IRT`. |
| **Dates** | ISO 8601 (`2026-10-10T09:15:00+03:30`), timezone `Asia/Tehran`. |
| **Digits** | Send Latin digits; Persian/Arabic digits in `phone` and `postal_code` are normalized server-side, so both forms are accepted. Never print a raw number in a Persian UI — format client-side. |
| **Phone** | `^09\d{9}$` (11 digits, starts `09`). |
| **Postal code** | `^\d{10}$`. |
| **Prices on products** | `price` is what the shopper pays; `compare_at_price` is the original. When `discount_percent > 0`, the storefront must show `compare_at_price` struck through above `price`. |
| **Brand & rating on products** | `brand` is the product's own label and `rating` its score out of 5 — both nullable, and `null` means the catalogue has nothing to say (not "zero"). `POST/PUT /admin/products` edits them. |
| **Success envelope** | A resource read returns `{"data": …}`; a write also returns `"message"` (Persian) where a human-readable result helps. |
| **Ownership failures** | Answer **404**, never 403 — a 403 would confirm a record exists. |

---

## 2. Authentication

Token-based (Laravel Sanctum). Two ways to identify a caller, and neither trusts a client-supplied id:

| Caller | How |
| --- | --- |
| Signed-in account | `Authorization: Bearer <token>` on every request. |
| Guest basket | `X-Cart-Token: <token>` returned by the first cart call and echoed on every cart response. |
| Guest order | `X-Order-Token: <token>` returned **once** by the checkout response. |

Getting a token:

```http
POST /api/v1/auth/login
{ "email": "shopper@example.com", "password": "…", "device_name": "iPhone" }
```

```json
{
  "data": {
    "user": { "…": "…" },
    "token": "12|plainTextToken…",
    "token_type": "Bearer",
    "expires_at": "2026-10-10T21:15:00+03:30"
  }
}
```

- Tokens expire after `SANCTUM_TOKEN_TTL` (12 hours by default).
- Abilities are derived from the account's roles, not from the request.
- `POST /api/v1/auth/logout` revokes the token used; `logout-all` revokes every token.
- `PUT /api/v1/auth/password` requires `current_password` and revokes every **other** session.

---

## 3. Errors

| Status | Meaning |
| --- | --- |
| `400` | Host header not in the allowlist, or a malformed payment callback. |
| `401` | Missing, expired or revoked token. |
| `403` | A foreign `Origin` on a write; a suspended account; a missing permission. |
| `404` | Unknown route or record — including a record that exists but is not yours. |
| `405` | Method not allowed on that path. |
| `422` | Validation failure (see below); also a coupon that is unknown, expired, used up or below its minimum, and a coupon that has been redeemed and cannot be deleted. |
| `429` | Rate limited — `Retry-After` says how long to wait. |
| `500` | Unexpected server error; the detail is in the server log, never in the body. |
| `502` / `504` | The payment gateway could not be reached. |

A `422` body lists the field errors:

```json
{ "message": "…", "errors": { "postal_code": ["کد پستی باید ۱۰ رقم باشد."] } }
```

### Rate limits

Per minute, keyed on the account when signed in and on the IP otherwise:

| Scope | Default |
| --- | --- |
| Everything (`api`) | 120 |
| Sensitive endpoints (`sensitive`) | 20 |
| `POST /checkout`, `POST /checkout/record` | 15 |
| `POST /auth/login` | 10 (per email **and** IP) |
| `POST /auth/register` | 5 (per IP) |
| `POST /auth/password/forgot`, `/auth/password/reset` | 5 |
| `POST /auth/email/resend` | 3 |

### Pagination

Paginated lists come from Laravel's paginator and carry `links` and `meta`:

```json
{
  "data": [ "…" ],
  "links": { "first": "…", "last": "…", "prev": null, "next": "…" },
  "meta": { "current_page": 1, "last_page": 4, "per_page": 12, "total": 41 }
}
```

`content/faqs` is the exception: the FAQ page is built from a single call, so that list is **not**
paginated and carries `meta.total` only.

---

## 4. Public storefront

No token required. All of these are rate limited.

### Health and banner

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/` (no `/api/v1`) | Service banner; not the storefront. |
| `GET` | `/up` | Laravel health route; 200 when the app boots. |

### Catalogue

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/v1/products` | Paginated, filterable. Returns summaries (no full descriptions). |
| `GET` | `/api/v1/products/filters` | The filter rail's own options — `{ sizes, colors, brands }` — read from the **whole** published catalogue. Takes no parameters: one page's results must never shrink the rail. |
| `GET` | `/api/v1/products/{product}` | Full product. `{product}` is the **id or the slug**. |
| `GET` | `/api/v1/products/{product}/related` | Same-category, same-kind items; may be empty (hide the rail). |
| `GET` | `/api/v1/categories` | All active categories. |
| `GET` | `/api/v1/categories/{category}` | One active category by id or slug; inactive = 404. |

`GET /products` query parameters (all optional):

| Parameter | Type | Notes |
| --- | --- | --- |
| `category` | string | Category slug or id. An unknown category returns **nothing**, never the whole catalogue. |
| `q` | string | 2–80 chars, escaped before `LIKE`. |
| `min_price`, `max_price` | integer | Toman; `max_price` must be ≥ `min_price`. |
| `discounted` | boolean | Only items with a sale price. |
| `featured` | boolean | Only featured items. |
| `sort` | enum | `newest`, `price_asc`, `price_desc`, `name`, `discount`. |
| `per_page` | integer | 1–48 (default 12). |
| `page` | integer | 1-based. |

### Content

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/v1/content/pages/{page}` | Published page by slug. A draft is a 404, indistinguishable from a missing slug. |
| `GET` | `/api/v1/content/posts` | Paginated published posts, newest first. `q` (2–80), `per_page` (1–24, default 10), `page`. |
| `GET` | `/api/v1/content/posts/{post}` | Published post by slug. |
| `GET` | `/api/v1/content/faqs` | All active FAQ entries, grouped by the client. Optional `group`. Returns `meta.total`. |
| `GET` | `/api/v1/content/settings` | Only settings marked public. A non-public key does not exist here. |
| `GET` | `/api/v1/content/admin-path` | The admin panel's URL segment (`data.path`), for the storefront's router to read before it renders. Served whether `admin.path` is public or internal, so that setting can stay internal. An address, never a lock: every admin route is guarded on its own. |

### Basket (guest-friendly)

The basket is always resolved from the request — token or session. No endpoint accepts a cart id, so
one shopper cannot reach another's basket by guessing a number. Every cart response returns the same
object and (for a guest) the `X-Cart-Token` header.

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/v1/cart` | — | Creates the guest basket on first call. |
| `POST` | `/api/v1/cart/items` | `product_id`, `quantity` | 201. An unpublished or deactivated product cannot be added. |
| `PATCH` | `/api/v1/cart/items/{product}` | `quantity` | `0` removes the line. Quantity is capped per line (`CART_MAX_QUANTITY_PER_LINE`, default 10). |
| `DELETE` | `/api/v1/cart/items/{product}` | — | Removing an absent line is success, not an error. |
| `POST` | `/api/v1/cart/coupon` | `code` | Case-insensitive. Unknown, expired, used-up or below-minimum codes all give the same 422. |
| `DELETE` | `/api/v1/cart/coupon` | — | Removes the applied code. |

### Checkout and payment

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/v1/checkout` | Turns the basket into an order and opens a payment. Works signed in or as a guest. |
| `POST` | `/api/v1/checkout/record` | Records an order the storefront's own browser basket already placed and paid for. Line prices are re-read from the catalogue; shipping and the discount are reported by the caller. Answers 201 with the order and its access token. |
| `GET` | `/api/v1/payments/callback` | Where the gateway returns the shopper. Not for clients to call. |
| `GET` | `/api/v1/orders/{order:number}` | Reads one order — the owner's token, or a guest's `X-Order-Token`. |

`POST /checkout` body:

| Field | Required | Notes |
| --- | --- | --- |
| `customer_name` | yes | ≤ 160 chars. |
| `customer_email` | guests only | Not required when signed in (the account already has one). |
| `customer_phone` | yes | `09xxxxxxxxx`; Persian digits normalized. |
| `shipping_province`, `shipping_city` | yes | ≤ 80 chars. |
| `shipping_postal_code` | yes | 10 digits. |
| `shipping_line1` | yes | ≤ 255 chars. |
| `shipping_line2` | no | ≤ 255 chars. |
| `note` | no | ≤ 500 chars. |

**There is no amount, price or total in the request** — the server computes every figure from locked
catalogue rows. Response (201):

```json
{
  "data": {
    "order": { "number": "MD-1042", "grand_total": 2450000, "…": "…", "access_token": "…" },
    "payment": { "status": "pending", "redirect_url": "https://payment.zarinpal.com/…", "error": null }
  }
}
```

- `access_token` appears **only here**, only for the order just created — store it to read the order
  as a guest later (`X-Order-Token`).
- A gateway failure still answers 201 with the order and `payment.status = "failed"` plus a Persian
  `payment.error`: the shopper keeps an order they can pay for, instead of losing the basket.
- After paying, the gateway returns the browser to `/api/v1/payments/callback?Authority=…&Status=OK`,
  which verifies server-side and returns `order_number`, `status`, `payment_status` and, when the shop
  configured a return page, `return_url`.

---

## 5. Customer account

All routes need `Authorization: Bearer`.

### Session and profile

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/v1/auth/me` | The caller, with roles and permissions. |
| `POST` | `/api/v1/auth/logout` | Revokes the current token. |
| `POST` | `/api/v1/auth/logout-all` | Revokes every token of the account. |
| `PUT` | `/api/v1/auth/password` | `current_password`, `password`, `password_confirmation`. Keeps this session, revokes the others. |
| `GET` | `/api/v1/profile` | Account profile. |
| `PUT` | `/api/v1/profile` | `name`, `email`, `phone` — all optional, validated when present. |
| `POST` | `/api/v1/auth/cart/merge` | Hands the guest basket (identified by `X-Cart-Token`) to the account; the guest token is retired. |

Email verification: `GET /api/v1/auth/email/verify/{id}/{hash}` is public (it is the signed link from
the mail), while `POST /api/v1/auth/email/resend` needs a bearer token. Verification is a trust
signal, not an access gate — an unverified account can still order.

Unauthenticated auth routes: `POST /auth/register` (`name`, `email`, `phone?`, `password`,
`password_confirmation`), `POST /auth/login`, `POST /auth/password/forgot` (`email`) and
`POST /auth/password/reset` (`token`, `email`, `password`, `password_confirmation`).

### Addresses, orders, wishlist

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/v1/addresses` | — | The caller's address book only. |
| `POST` | `/api/v1/addresses` | address fields | `receiver_first_name`, `receiver_last_name`, `phone`, `province`, `city`, `postal_code`, `label?`, `is_default?`. |
| `PUT/PATCH` | `/api/v1/addresses/{address}` | any address field | Another account's address is a 404. |
| `DELETE` | `/api/v1/addresses/{address}` | — | |
| `POST` | `/api/v1/addresses/{address}/default` | — | Makes it the default address. |
| `GET` | `/api/v1/orders` | — | The caller's orders, paginated (`per_page` 1–50, default 15). |
| `GET` | `/api/v1/wishlist` | — | Visible products in the caller's wishlist. |
| `POST` | `/api/v1/wishlist` | `product_id` | 201; adding twice is harmless. |
| `DELETE` | `/api/v1/wishlist/{product}` | — | |

Order status is one of `pending_payment`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`,
`refunded`, and only the transitions the enum allows are accepted:

```
pending_payment → paid, cancelled
paid            → processing, cancelled, refunded
processing      → shipped, cancelled, refunded
shipped         → delivered, refunded
delivered       → refunded
cancelled, refunded → (final)
```

Every transition is recorded in the order's status history; payment status is separate and is one of
`pending`, `succeeded`, `failed`, `cancelled`, `refunded`.

---

## 6. Administration

Every admin route requires a staff account **and** the named permission. The permission names come
from `RoleAndPermissionSeeder`; `super-admin` holds all of them, `admin` all but the user-management
ones, `staff` the operational subset.

| Area | Endpoints | Permission |
| --- | --- | --- |
| Products | `GET /admin/products`, `GET /admin/products/{product}` | `products.view` |
| | `POST /admin/products`, `PUT /admin/products/{product}` | `products.create` / `products.update` |
| | `DELETE /admin/products/{product}` | `products.delete` |
| | `PUT /admin/products/{product}/stock` | `products.update` (atomic ledger movement) |
| | `POST /admin/products/{product}/images`, `DELETE …/images/{image}` | `products.update` |
| Categories | `/admin/categories` (index, store, show, update, destroy) | `categories.manage` |
| Orders | `GET /admin/orders`, `GET /admin/orders/{order}` | `orders.view` |
| | `PUT /admin/orders/{order}/status` | `orders.update` (transition constraints enforced) |
| Coupons | `/admin/coupons` (index, store, show, update, destroy) | `coupons.manage` |
| Content | `/admin/pages`, `/admin/posts`, `/admin/faqs` (index, store, show, update, destroy) | `content.manage` |
| Settings | `/admin/settings` (index, store, update, destroy) | `settings.manage` (setting keys are immutable) |
| Media | `GET /admin/media`, `POST /admin/media`, `DELETE /admin/media/{media}` | `media.manage` |
| Users | `GET /admin/users`, `GET /admin/users/{user}` | `users.view` |
| | `PUT /admin/users/{user}` | `users.update` (an operator cannot suspend themselves) |
| | `PUT /admin/users/{user}/roles` | `users.roles` |
| Audit trail | `GET /admin/audit-logs`, `GET /admin/audit-logs/{auditLog}` | `audit.view` |

Admin list endpoints accept `q` (search), `status`, `per_page` and `page` where the resource has them
(`AdminIndexRequest`), and paginate with the same `meta`/`links` shape as the public lists.

Notes that surprise people:

- **A coupon that has been redeemed cannot be deleted** — the redemption rows would lose their
  history. The endpoint answers 422 and points at deactivation (`is_active = false`).
- **A percentage coupon must carry a ceiling** (`max_discount`); values above 90% are refused.
- **A setting's key is immutable** after creation; change the value, not the key.
- **Stock changes are ledger-backed**: `PUT …/stock` writes a stock movement in the same transaction,
  and the same is true of the movements the checkout and cancellation paths write.
- **Order status changes are constrained** — an illegal transition is a validation error, not a
  silent write.
- **Audit rows are append-only** and can never be edited or deleted through the API.
