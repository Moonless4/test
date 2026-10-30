import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { defaultContent } from './defaultContent.js';
import { SITE_STORAGE_KEY, readSavedContent } from './contentStorage.js';

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [content, setContent] = useState(readSavedContent);

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
