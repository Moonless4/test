// Per-page <head> metadata for client-rendered routes. `applySeo` returns a
// cleanup that restores whatever the document had before, so leaving an article
// brings back the site-wide title and description.
function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  const created = !el;
  if (created) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  const previous = created ? null : el.getAttribute('content');
  el.setAttribute('content', content);
  return () => {
    if (created) el.remove();
    else el.setAttribute('content', previous ?? '');
  };
}

export function applySeo({ title, description, keywords, image, path, type = 'article', published, jsonLd }) {
  const origin = window.location.origin;
  const url = `${origin}${path}`;
  const previousTitle = document.title;
  const restores = [];

  document.title = title;
  restores.push(() => {
    document.title = previousTitle;
  });

  restores.push(setMeta('name', 'description', description));
  if (keywords?.length) restores.push(setMeta('name', 'keywords', keywords.join('، ')));
  restores.push(setMeta('property', 'og:title', title));
  restores.push(setMeta('property', 'og:description', description));
  restores.push(setMeta('property', 'og:type', type));
  restores.push(setMeta('property', 'og:url', url));
  if (image) restores.push(setMeta('property', 'og:image', `${origin}${image}`));
  if (published) restores.push(setMeta('property', 'article:published_time', published));

  const canonical = document.createElement('link');
  canonical.rel = 'canonical';
  canonical.href = url;
  document.head.appendChild(canonical);
  restores.push(() => canonical.remove());

  if (jsonLd) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    restores.push(() => script.remove());
  }

  return () => restores.reverse().forEach((restore) => restore());
}
