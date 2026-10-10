/**
 * WordPress content — blog posts, media, menus and pages.
 *
 * This is what makes the header, the mega menu, the footer and the blog editable in
 * wp-admin instead of in JSX: the site's own menus come back as a tree, and posts arrive
 * with their featured image, author and terms already embedded.
 */
import { get, getList } from '../lib/woo/client';
import { stripHtml, toBlogPost } from '../lib/woo/map';
import type { WpMedia, WpMenu, WpMenuItem, WpPost, WpTerm } from '../lib/woo/types';
import type { BlogPost } from '../lib/types';

export type PostQuery = {
  page?: number;
  perPage?: number;
  category?: number;
  tag?: number;
  search?: string;
};

export const listPosts = async (
  { page = 1, perPage = 9, category, tag, search }: PostQuery = {},
  signal?: AbortSignal,
): Promise<{ posts: BlogPost[]; total: number; totalPages: number }> => {
  const { items, total, totalPages } = await getList<WpPost>(
    '/content/posts',
    {
      _embed: true,
      page,
      per_page: perPage,
      categories: category,
      tags: tag,
      search,
      orderby: 'date',
      order: 'desc',
    },
    signal,
  );
  return { posts: items.map(toBlogPost), total, totalPages };
};

/** Accepts the numeric id or the slug. */
export const getPost = async (idOrSlug: string, signal?: AbortSignal): Promise<BlogPost> =>
  toBlogPost(
    await get<WpPost>(`/content/posts/${encodeURIComponent(idOrSlug)}`, { _embed: true }, signal),
  );

export const listPostCategories = (signal?: AbortSignal): Promise<WpTerm[]> =>
  get<WpTerm[]>('/content/categories', { per_page: 100, hide_empty: true }, signal);

/** The Media Library — every backend-managed image, by URL. */
export const listMedia = (signal?: AbortSignal): Promise<WpMedia[]> =>
  getList<WpMedia>('/content/media', { per_page: 100, media_type: 'image' }, signal).then(
    (page) => page.items,
  );

export const listMenus = (signal?: AbortSignal): Promise<WpMenu[]> =>
  get<WpMenu[]>('/content/menus', { per_page: 20 }, signal);

export const listMenuItems = (menuId: number, signal?: AbortSignal): Promise<WpMenuItem[]> =>
  get<WpMenuItem[]>(
    '/content/menu-items',
    { menus: menuId, per_page: 100, orderby: 'menu_order', order: 'asc' },
    signal,
  );

export type MenuNode = {
  id: number;
  label: string;
  url: string;
  children: MenuNode[];
};

/** WordPress returns menu items flat with a `parent`; the header needs the tree. */
export const buildMenuTree = (items: WpMenuItem[]): MenuNode[] => {
  const nodes = new Map<number, MenuNode>();
  for (const item of items) {
    nodes.set(item.id, {
      id: item.id,
      label: stripHtml(item.title?.rendered ?? ''),
      url: item.url,
      children: [],
    });
  }

  const roots: MenuNode[] = [];
  for (const item of items) {
    const node = nodes.get(item.id);
    if (!node) continue;
    const parent = item.parent ? nodes.get(item.parent) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  // `orderby=menu_order` already sorted the flat list; keep that order inside each level.
  const position = new Map(items.map((item, index) => [item.id, index]));
  const sort = (list: MenuNode[]) => {
    list.sort((a, b) => (position.get(a.id) ?? 0) - (position.get(b.id) ?? 0));
    for (const node of list) sort(node.children);
  };
  sort(roots);

  return roots;
};
