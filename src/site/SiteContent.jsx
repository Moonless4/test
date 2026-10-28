import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { defaultContent } from './defaultContent.js';

export const SITE_STORAGE_KEY = 'atrin-site-v1';

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

// Saved content only stores what the admin changed; defaults fill the rest so
// new fields added in code still appear for existing visitors.
const mergeContent = (base, saved) => {
  if (!isPlainObject(saved)) return Array.isArray(base) ? base : base;
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
const stripLegacyCredentials = (saved) => {
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

const readSaved = () => {
  try {
    const raw = localStorage.getItem(SITE_STORAGE_KEY);
    if (!raw) return defaultContent;
    return mergeContent(defaultContent, stripLegacyCredentials(JSON.parse(raw)));
  } catch {
    return defaultContent;
  }
};

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [content, setContent] = useState(readSaved);

  const persist = (next) => {
    try {
      localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(next));
      return true;
    } catch {
      window.alert('حجم اطلاعات ذخیره‌شده بیش از حد مجاز مرورگر است؛ تصویر یا متن کمتری ذخیره کنید.');
      return false;
    }
  };

  const update = useCallback((patchOrUpdater) => {
    setContent((prev) => {
      const next =
        typeof patchOrUpdater === 'function'
          ? patchOrUpdater(prev)
          : { ...prev, ...patchOrUpdater };
      persist(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(SITE_STORAGE_KEY);
    } catch {
      /* ignore storage errors */
    }
    setContent(defaultContent);
  }, []);

  const value = useMemo(() => ({ content, update, reset }), [content, update, reset]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used inside SiteProvider');
  return context;
}
