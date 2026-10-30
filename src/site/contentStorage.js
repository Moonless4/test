import { defaultContent, SITE_CONTENT_VERSION } from './defaultContent.js';

export const SITE_STORAGE_KEY = 'atrin-site-v1';

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

// Saved content only stores what the admin changed; defaults fill the rest so
// new fields added in code still appear for existing visitors.
export const mergeContent = (base, saved) => {
  if (!isPlainObject(saved)) return base;
  const result = { ...base };
  Object.keys(saved).forEach((key) => {
    const savedValue = saved[key];
    const baseValue = base?.[key];
    result[key] =
      isPlainObject(savedValue) && isPlainObject(baseValue)
        ? mergeContent(baseValue, savedValue)
        : savedValue;
  });
  return result;
};

// Older versions kept the admin username/password in plain text inside the
// content tree. Drop those keys so nobody can read them from storage or a backup.
export const stripLegacyCredentials = (saved) => {
  if (!saved?.settings) return saved;
  const { adminUsername, adminPassword, ...settings } = saved.settings;
  const next = { ...saved };
  if (Object.keys(settings).length) next.settings = settings;
  else delete next.settings;
  try {
    localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage can be unavailable */
  }
  return next;
};

// Lists are stored as the admin saved them, so a slide added or removed in the
// code would never reach a browser that already kept the old copy (it comes back
// on every refresh). Shipping a new slider lineup bumps SITE_CONTENT_VERSION and
// the saved slider is synced with it once: slides that no longer exist go away
// and new ones are added, while the admin's own images and order survive.
const syncHeroSlides = (savedSlides) => {
  const shipped = defaultContent.heroSlides;
  const kept = savedSlides.filter((slide) => shipped.some((item) => item.id === slide?.id));
  const added = shipped.filter((item) => !kept.some((slide) => slide.id === item.id));
  return [...kept, ...added];
};

export const migrateSavedContent = (saved) => {
  if (!isPlainObject(saved) || saved.contentVersion === SITE_CONTENT_VERSION) return saved;
  const next = { ...saved, contentVersion: SITE_CONTENT_VERSION };
  if (Array.isArray(next.heroSlides)) next.heroSlides = syncHeroSlides(next.heroSlides);
  return next;
};

export const readSavedContent = () => {
  try {
    const raw = localStorage.getItem(SITE_STORAGE_KEY);
    if (!raw) return defaultContent;
    const saved = migrateSavedContent(stripLegacyCredentials(JSON.parse(raw)));
    return mergeContent(defaultContent, saved);
  } catch {
    return defaultContent;
  }
};
