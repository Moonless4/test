/**
 * Content, as hooks: the blog and the FAQ. Same three states as the catalogue hooks, so a screen
 * handles a slow or refused read the same way whatever it is showing.
 */
import { useAsync, type AsyncState } from './useAsync';
import { getPost, listFaqGroups, listPosts, type PostQuery } from '../services/content';
import type { FaqGroup } from '../lib/api/map';
import type { BlogPost } from '../lib/types';

export const usePosts = (
  query: PostQuery = {},
): AsyncState<{ posts: BlogPost[]; total: number; totalPages: number }> =>
  useAsync((signal) => listPosts(query, signal), [JSON.stringify(query)]);

export const usePost = (slug: string): AsyncState<BlogPost> =>
  useAsync((signal) => getPost(slug, signal), [slug]);

export const useFaqGroups = (): AsyncState<FaqGroup[]> =>
  useAsync((signal) => listFaqGroups(signal), []);
