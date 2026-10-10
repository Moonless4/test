/**
 * The storefront's content — blog posts, the FAQ and the public settings.
 *
 * This is what makes the blog, the FAQ page and the shop's own numbers editable from the admin
 * panel instead of living in JSX: the API is the source, and the storefront only asks for what it
 * renders.
 */
import { get, getPage } from '../lib/api/client';
import { groupFaqs, toBlogPost, type FaqGroup } from '../lib/api/map';
import type { ApiFaq, ApiPost, ApiSetting } from '../lib/api/types';
import type { BlogPost } from '../lib/types';

export type PostQuery = {
  page?: number;
  /** 1–24, the API's own ceiling; anything above it is refused. */
  perPage?: number;
  search?: string;
};

export const listPosts = async (
  { page = 1, perPage = 9, search }: PostQuery = {},
  signal?: AbortSignal,
): Promise<{ posts: BlogPost[]; total: number; totalPages: number }> => {
  const result = await getPage<ApiPost>(
    '/content/posts',
    { page, per_page: perPage, q: search },
    signal,
  );
  return {
    posts: result.items.map(toBlogPost),
    total: result.total,
    totalPages: result.totalPages,
  };
};

/** Accepts the post's slug — that is what a route carries. */
export const getPost = async (slug: string, signal?: AbortSignal): Promise<BlogPost> =>
  toBlogPost(await get<ApiPost>(`/content/posts/${encodeURIComponent(slug)}`, undefined, signal));

/** The FAQ page is one call, grouped by the API's own `group` key. */
export const listFaqGroups = async (signal?: AbortSignal): Promise<FaqGroup[]> =>
  groupFaqs(await get<ApiFaq[]>('/content/faqs', undefined, signal));

/**
 * Only settings marked public exist here. The shop's own numbers — the free-shipping threshold,
 * the flat shipping rate, the return window — must be read from here rather than duplicated in
 * the frontend, or the screen and the checkout can disagree.
 */
export const getSettings = async (signal?: AbortSignal): Promise<Record<string, string>> => {
  const settings = await get<ApiSetting[]>('/content/settings', undefined, signal);
  return Object.fromEntries(settings.map((setting) => [setting.key, String(setting.value)]));
};
