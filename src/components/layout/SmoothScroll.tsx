import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { setSmoothScroller } from '../../lib/smoothScroll';

/**
 * Expo-out: most of the distance is covered in the first frames, then it settles gently — that
 * fast start is what keeps the page feeling attached to the wheel, and the long tail is the weight.
 */
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * One page-level smooth scroller for the whole site (storefront and panel). It renders nothing and
 * never wraps the app: Lenis animates `window` scroll itself, so there is no transformed content
 * layer, no second scroll container and no layout to shift.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | null = null;

    const onHashClick = (event: MouseEvent) => {
      if (!lenis || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as Element | null)?.closest?.('a[href]');
      if (!(link instanceof HTMLAnchorElement) || link.target || link.hasAttribute('download')) {
        return;
      }

      const url = new URL(link.href, window.location.href);
      const isSamePage =
        url.origin === window.location.origin && url.pathname === window.location.pathname;
      if (!isSamePage || !url.hash) return;

      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;

      // The browser's own jump would land instantly and fight the animation, so it is replaced by
      // a smooth travel to the same element (it honours the element's `scroll-mt-*` margin).
      event.preventDefault();
      lenis.scrollTo(target);
      window.history.replaceState(null, '', url.hash);
    };

    const enable = () => {
      if (lenis) return;
      lenis = new Lenis({
        // ~1.1 s of travel per gesture, with the easing above: responsive first, settled last.
        duration: 1.1,
        easing: easeOutExpo,
        // Desktop wheel only. A phone keeps its own momentum — syncing it replaces a gesture the
        // user trusts with a smoothed one, which is what makes a page feel slippery.
        smoothWheel: true,
        syncTouch: false,
        // 1 keeps the distance travelled equal to the distance the wheel reported.
        wheelMultiplier: 1,
        // Inner scroll areas (the cart list, the category sheet, the panel's tables) keep their own
        // native scrolling instead of feeding the page.
        allowNestedScroll: true,
        // A link to another route must not carry the previous page's momentum into the next one.
        stopInertiaOnNavigate: true,
        autoRaf: true,
        // Belt and braces: the instance is not created at all when motion is reduced, and this
        // also covers a setting that flips between mount and the first wheel event.
        respectReducedMotion: true,
      });
      setSmoothScroller(lenis);
      document.addEventListener('click', onHashClick);
    };

    const disable = () => {
      document.removeEventListener('click', onHashClick);
      setSmoothScroller(null);
      lenis?.destroy();
      lenis = null;
    };

    // Reduced motion means native scrolling: no instance, no rAF loop, no listeners.
    const sync = () => (reducedMotion.matches ? disable() : enable());

    sync();
    reducedMotion.addEventListener('change', sync);
    return () => {
      reducedMotion.removeEventListener('change', sync);
      disable();
    };
  }, []);

  return null;
}
