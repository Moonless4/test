// Comments left by visitors on a food (`product`) or a blog post (`post`).
// There is no backend, so every comment lives in localStorage under one key and
// is filtered by target; the admin panel does not read this list.

const COMMENTS_KEY = 'atrin-comments-v1';

export const COMMENT_TARGETS = {
  product: 'product',
  post: 'post',
};

const readAll = () => {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAll = (list) => {
  try {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(list));
  } catch {
    /* storage can be unavailable */
  }
  return list;
};

const createId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const listComments = (targetType, targetId) =>
  readAll()
    .filter((item) => item.targetType === targetType && item.targetId === targetId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const addComment = ({ targetType, targetId, name, text, rating = 0 }) => {
  const entry = {
    id: createId('cmt'),
    targetType,
    targetId,
    name: (name || '').trim(),
    text: (text || '').trim(),
    rating: targetType === COMMENT_TARGETS.product ? Number(rating) || 0 : 0,
    createdAt: new Date().toISOString(),
  };
  writeAll([entry, ...readAll()]);
  return entry;
};

export const commentStats = (targetType, targetId) => {
  const list = listComments(targetType, targetId);
  const rated = list.filter((item) => item.rating > 0);
  const average = rated.length
    ? Math.round((rated.reduce((sum, item) => sum + item.rating, 0) / rated.length) * 10) / 10
    : 0;
  return { count: list.length, average, rated: rated.length };
};
