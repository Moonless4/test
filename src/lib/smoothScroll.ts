import type Lenis from 'lenis';

/**
 * The page keeps scrolling natively — Lenis only decides *when* each frame lands — so nothing else
 * on the site has to know about it: sticky headers, fixed bars, IntersectionObserver reveals and
 * `window` scroll listeners all keep reading the real, up-to-date scroll position.
 *
 * What they must not do is move the page on their own while the scroller runs: an animation frame
 * would overwrite the jump. Those few places ask this module instead.
 */
let instance: Lenis | null = null;

/** Called by `components/layout/SmoothScroll.tsx` only. */
export function setSmoothScroller(lenis: Lenis | null) {
  instance = lenis;
}

type ScrollTarget = number | HTMLElement | string;

type ScrollToTargetOptions = {
  /** Jump instead of animating — route changes. */
  immediate?: boolean;
  /** Distance to keep between the target and the top of the viewport (the sticky header). */
  offset?: number;
};

/**
 * Scroll to a position or an element. Without a running scroller (a phone, or `prefers-reduced-
 * motion`) this is the browser's own scroll, so the two paths never disagree about the destination.
 */
export function scrollToTarget(target: ScrollTarget, options: ScrollToTargetOptions = {}) {
  if (instance) {
    instance.scrollTo(target, options);
    return;
  }

  const behavior: ScrollBehavior = options.immediate ? 'auto' : 'smooth';
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior });
    return;
  }

  const element =
    typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  element?.scrollIntoView({ behavior, block: 'start' });
}

/**
 * Freeze the page while an overlay is open. The body's own overflow lock stays in charge of the
 * native paths (a phone's touch drag); this stops the wheel animation that was already in flight.
 */
export function pauseSmoothScroll(paused: boolean) {
  if (!instance) return;
  if (paused) instance.stop();
  else instance.start();
}
