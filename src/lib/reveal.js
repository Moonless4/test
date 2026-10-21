// Scroll-entrance animations. Any element marked with `[data-reveal]` fades up
// once, when it enters the viewport. The observer is rebuilt on every route
// render (lazy pages mount after the previous pass), so it is created lazily
// and reused; unobserved elements are simply dropped by the browser.
let observer = null;

export function initReveals(root = document) {
  const items = root.querySelectorAll('[data-reveal]:not(.is-revealed)');
  if (!items.length) return;

  const reduceMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-revealed'));
    return;
  }

  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
    );
  }

  items.forEach((item) => observer.observe(item));
}
