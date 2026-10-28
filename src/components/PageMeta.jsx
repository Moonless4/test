import { useEffect } from 'react';
import { applySeo } from '../lib/seo.js';
import { site } from '../content/site.js';

// Per-page <head> metadata from the admin panel's SEO fields, with the site
// defaults from `settings.seo` as the fallback.
export default function PageMeta({ title, description, image, path, type = 'website' }) {
  useEffect(() => {
    const cleanTitle = title || site.seo?.title || document.title;
    const cleanDescription = description || site.seo?.description || site.general?.tagline || '';
    if (!cleanTitle) return undefined;
    return applySeo({
      title: cleanTitle,
      description: cleanDescription,
      keywords: site.seo?.keywords,
      image: image || site.seo?.ogImage,
      path: path || window.location.pathname,
      type,
    });
  }, [title, description, image, path, type]);

  return null;
}
