/**
 * The admin panel's transport to the Laravel API (`/api/v1`).
 *
 * Exactly the rules the storefront's services follow: no component builds a URL or calls `fetch`,
 * and the panel only ever sees the app's own shapes. Two things differ:
 *
 *  - a write answers with **both** the changed resource and the API's own Persian confirmation, so
 *    the panel can tell the operator what happened instead of inventing a message;
 *  - `/auth/login` hands back a Sanctum bearer token, which is kept in the same
 *    `styleon.api.token` slot the rest of the app reads — one identity, one place.
 *
 * Permissions are never decided here. `can()` in `AdminAuthContext` decides what to *render*; every
 * admin route checks its named permission again on the server, so a hidden button is a convenience
 * and never a protection.
 */
import {
  ApiError,
  clearCache,
  get,
  getPage,
  mutateVoid,
  request,
  type Mutation,
  type Query,
} from '../lib/api/client';
import type {
  ApiAdminCategory,
  ApiAdminCoupon,
  ApiAdminFaq,
  ApiAdminMedia,
  ApiAdminOrder,
  ApiAdminPage,
  ApiAdminPost,
  ApiAdminProduct,
  ApiAdminSetting,
  ApiAdminUser,
  ApiProductImage,
} from '../lib/api/types';

/** A write answers with the changed resource and the API's own message; both are optional. */
export type AdminResult<T = undefined> = { data?: T; message?: string };

type Body<T> = { data?: T; message?: string };

const write = async <T>(
  path: string,
  method: Mutation,
  body?: unknown,
): Promise<AdminResult<T>> => {
  const payload = await request<Body<T>>(path, { method, body });
  // A write changes what a read would answer, so the shared read cache is dropped.
  clearCache();
  return { data: payload?.data, message: payload?.message };
};

const upload = async <T>(path: string, form: FormData): Promise<AdminResult<T>> => {
  const payload = await request<Body<T>>(path, { method: 'POST', form });
  clearCache();
  return { data: payload?.data, message: payload?.message };
};

/** A `file` plus optional extra fields, as the API's upload endpoints expect them. */
export const fileForm = (file: File, fields: Record<string, string> = {}): FormData => {
  const form = new FormData();
  form.append('file', file);
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  return form;
};

/* ---------------------------------------------------------------------------------------------
 | Session
 -------------------------------------------------------------------------------------------- */

export type AdminSession = { user: ApiAdminUser; token: string; expires_at: string | null };

export const adminLogin = async (email: string, password: string): Promise<AdminSession> => {
  const payload = await request<Body<AdminSession>>('/auth/login', {
    method: 'POST',
    // The device name is the token's own label, not a credential.
    body: { email, password, device_name: 'admin-panel' },
  });

  const session = payload?.data;

  if (!session?.token) throw new ApiError('پاسخ نامعتبر از سرور فروشگاه.', 0);

  return session;
};

/** Who am I and what may I do. Read-only: the server decides again on every route. */
export const adminMe = () => get<ApiAdminUser>('/auth/me');

export const adminLogout = () => mutateVoid('/auth/logout', 'POST');

/* ---------------------------------------------------------------------------------------------
 | Catalogue and stock
 -------------------------------------------------------------------------------------------- */

export const adminProducts = (query: Query) =>
  getPage<ApiAdminProduct>('/admin/products', query);

export const adminProduct = (id: number) => get<ApiAdminProduct>(`/admin/products/${id}`);

export const adminCreateProduct = (body: Record<string, unknown>) =>
  write<{ product: ApiAdminProduct }>('/admin/products', 'POST', body);

export const adminUpdateProduct = (id: number, body: Record<string, unknown>) =>
  write<{ product: ApiAdminProduct }>(`/admin/products/${id}`, 'PATCH', body);

export const adminDeleteProduct = (id: number) => write(`/admin/products/${id}`, 'DELETE');

/**
 * Stock is its own endpoint on purpose: it writes through the API's inventory service, so the
 * movement lands in the ledger. A price edit and a stock correction are two different actions.
 */
export const adminUpdateStock = (id: number, stockQuantity: number, note?: string) =>
  write<{ product: ApiAdminProduct }>(`/admin/products/${id}/stock`, 'PUT', {
    stock_quantity: stockQuantity,
    note,
  });

export const adminUploadProductImage = (id: number, file: File, alt?: string) =>
  upload<{ image: ApiProductImage }>(
    `/admin/products/${id}/images`,
    fileForm(file, alt ? { alt } : {}),
  );

/** Attach a photo that already lives in the media library, without uploading it twice. */
export const adminAttachProductImage = (id: number, mediaId: number, alt?: string) =>
  write<{ image: ApiProductImage }>(`/admin/products/${id}/images`, 'POST', {
    media_id: mediaId,
    ...(alt ? { alt } : {}),
  });

export const adminRemoveProductImage = (id: number, imageId: number) =>
  write(`/admin/products/${id}/images/${imageId}`, 'DELETE');

export const adminCategories = (query?: Query) =>
  get<ApiAdminCategory[]>('/admin/categories', query);

export const adminCreateCategory = (body: Record<string, unknown>) =>
  write<{ category: ApiAdminCategory }>('/admin/categories', 'POST', body);

export const adminUpdateCategory = (id: number, body: Record<string, unknown>) =>
  write<{ category: ApiAdminCategory }>(`/admin/categories/${id}`, 'PATCH', body);

export const adminDeleteCategory = (id: number) =>
  write(`/admin/categories/${id}`, 'DELETE');

/* ---------------------------------------------------------------------------------------------
 | Orders and discount codes
 -------------------------------------------------------------------------------------------- */

export const adminOrders = (query: Query) => getPage<ApiAdminOrder>('/admin/orders', query);

export const adminOrder = (id: number) => get<ApiAdminOrder>(`/admin/orders/${id}`);

/**
 * The only thing the panel may change on an order. An illegal move is refused by the API against
 * its own transition table, so the panel never invents a status.
 */
export const adminSetOrderStatus = (id: number, status: string, note?: string) =>
  write<{ order: ApiAdminOrder }>(`/admin/orders/${id}/status`, 'PUT', { status, note });

export const adminCoupons = (query: Query) => getPage<ApiAdminCoupon>('/admin/coupons', query);

export const adminCreateCoupon = (body: Record<string, unknown>) =>
  write<{ coupon: ApiAdminCoupon }>('/admin/coupons', 'POST', body);

export const adminUpdateCoupon = (id: number, body: Record<string, unknown>) =>
  write<{ coupon: ApiAdminCoupon }>(`/admin/coupons/${id}`, 'PATCH', body);

export const adminDeleteCoupon = (id: number) => write(`/admin/coupons/${id}`, 'DELETE');

/* ---------------------------------------------------------------------------------------------
 | Content
 -------------------------------------------------------------------------------------------- */

export const adminPages = (query: Query) => getPage<ApiAdminPage>('/admin/pages', query);

export const adminCreatePage = (body: Record<string, unknown>) =>
  write<{ page: ApiAdminPage }>('/admin/pages', 'POST', body);

export const adminUpdatePage = (id: number, body: Record<string, unknown>) =>
  write<{ page: ApiAdminPage }>(`/admin/pages/${id}`, 'PATCH', body);

export const adminDeletePage = (id: number) => write(`/admin/pages/${id}`, 'DELETE');

export const adminPosts = (query: Query) => getPage<ApiAdminPost>('/admin/posts', query);

export const adminCreatePost = (body: Record<string, unknown>) =>
  write<{ post: ApiAdminPost }>('/admin/posts', 'POST', body);

export const adminUpdatePost = (id: number, body: Record<string, unknown>) =>
  write<{ post: ApiAdminPost }>(`/admin/posts/${id}`, 'PATCH', body);

export const adminDeletePost = (id: number) => write(`/admin/posts/${id}`, 'DELETE');

export const adminFaqs = (query: Query) => getPage<ApiAdminFaq>('/admin/faqs', query);

export const adminCreateFaq = (body: Record<string, unknown>) =>
  write<{ faq: ApiAdminFaq }>('/admin/faqs', 'POST', body);

export const adminUpdateFaq = (id: number, body: Record<string, unknown>) =>
  write<{ faq: ApiAdminFaq }>(`/admin/faqs/${id}`, 'PATCH', body);

export const adminDeleteFaq = (id: number) => write(`/admin/faqs/${id}`, 'DELETE');

/* ---------------------------------------------------------------------------------------------
 | Settings and the media library
 -------------------------------------------------------------------------------------------- */

export const adminSettings = (query: Query) => getPage<ApiAdminSetting>('/admin/settings', query);

export const adminCreateSetting = (body: Record<string, unknown>) =>
  write<{ setting: ApiAdminSetting }>('/admin/settings', 'POST', body);

/** The key is immutable: only the value, its type and its visibility move. */
export const adminUpdateSetting = (id: number, body: Record<string, unknown>) =>
  write<{ setting: ApiAdminSetting }>(`/admin/settings/${id}`, 'PATCH', body);

/** Retiring a key the storefront no longer reads. */
export const adminDeleteSetting = (id: number) => write(`/admin/settings/${id}`, 'DELETE');

export const adminMedia = (query: Query) => getPage<ApiAdminMedia>('/admin/media', query);

export const adminUploadMedia = (file: File) =>
  upload<{ media: ApiAdminMedia }>('/admin/media', fileForm(file));

export const adminDeleteMedia = (id: number) => write(`/admin/media/${id}`, 'DELETE');
