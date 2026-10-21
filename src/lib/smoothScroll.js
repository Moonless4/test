// Premium inertial scrolling, powered by Lenis.
//
// Lenis owns the scroll position: wheel input is accumulated into a target and
// the page eases towards it once per frame, so content glides with weight and
// settles softly instead of stepping. Only the real scroll position changes —
// no transform wrapper — so the sticky header, the mega menu, the carousels and
// the theme's own scroll state keep working unchanged.
//
// What gets what:
// - desktop mouse wheel / trackpad: smoothed by Lenis on a single raf loop,
// - touch-first devices (phones, tablets): Lenis is never created, the browser
//   keeps its own momentum,
// - `prefers-reduced-motion`: native scrolling,
// - nested scrollers, horizontal gestures and the locked page (drawer,
//   lightbox) pass through untouched.

import Lenis from 'lenis';

// Physics, matched to the reference studio site (pethemes.com): Lenis with its
// default `lerp: 0.1` and a 1.25 wheel multiplier, so every wheel notch travels
// a quarter further and catches up slightly quicker than a heavier 0.08 while
// keeping the soft, weighted settle.
const LERP = 0.1;
const WHEEL_MULTIPLIER = 1.25;

// Programmatic moves (anchors, keyboard) get a fixed-length glide so they read
// as one deliberate motion rather than a decaying flick.
const MOVE_DURATION = 1.15;
const KEY_DURATION = 0.9;
const KEY_PAGE = 0.9;
const ANCHOR_GAP = 16;

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

let lenis = null;
let frame = 0;
let bound = false;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Touch-first devices keep the browser's own momentum, which is smoother and
// lighter than anything scripted.
const touchFirstDevice = () =>
  window.matchMedia('(pointer: coarse)').matches && navigator.maxTouchPoints > 0;

export const smoothScrollEnabled = () => !touchFirstDevice() && !prefersReducedMotion();

function isEditable(node) {
  return Boolean(
    node?.closest?.('input, textarea, select, button, a, summary, [contenteditable="true"]'),
  );
}

function tick(time) {
  lenis.raf(time);
  frame = requestAnimationFrame(tick);
}

function startLoop() {
  if (!frame) frame = requestAnimationFrame(tick);
}

function stopLoop() {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
}

function mount() {
  if (lenis || !smoothScrollEnabled()) return;

  lenis = new Lenis({
    lerp: LERP,
    wheelMultiplier: WHEEL_MULTIPLIER,
    smoothWheel: true,
    // Touch stays native even on hybrid devices (touchscreen laptops).
    syncTouch: false,
    // Let panels/modals that scroll on their own keep their own scroll.
    allowNestedScroll: true,
    stopInertiaOnNavigate: true,
  });

  // The theme ships `html { scroll-behavior: smooth }`. Every frame write would
  // restart the browser's own animation and the two would fight, so it is
  // switched off only while the engine is running.
  document.documentElement.style.scrollBehavior = 'auto';

  startLoop();
}

function unmount() {
  stopLoop();
  lenis?.destroy();
  lenis = null;
  document.documentElement.style.scrollBehavior = '';
}

// The drawer and the lightbox lock the page with `body.disable-scrolling`;
// Lenis has to stop too, otherwise it keeps easing towards a stale target and
// the page jumps when the overlay closes.
function syncLock() {
  if (!lenis) return;
  if (document.body.classList.contains('disable-scrolling')) lenis.stop();
  else lenis.start();
}

export function smoothScrollTo(value) {
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const target = clamp(value, 0, max);
  if (lenis) {
    lenis.scrollTo(target, { duration: MOVE_DURATION, easing: easeOutExpo });
    return;
  }
  window.scrollTo({ top: target, behavior: 'auto' });
}

export function resetSmoothScroll() {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
    lenis.resize();
    return;
  }
  window.scrollTo(0, 0);
}

function anchorOffset() {
  const header = document.getElementById('header-container');
  return (header ? header.getBoundingClientRect().height : 0) + ANCHOR_GAP;
}

function onAnchorClick(event) {
  if (!lenis || event.defaultPrevented || event.button > 0) return;

  const link = event.target.closest?.('a[href^="#"]');
  if (!link) return;

  const hash = link.getAttribute('href');
  if (!hash || hash.length < 2) return;

  const section = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!section) return;

  event.preventDefault();
  // A numeric target rather than the element: the theme sets
  // `html { scroll-padding-top: 160px }`, and Lenis would subtract that on top
  // of the sticky-header offset, leaving a double gap.
  const top = section.getBoundingClientRect().top + window.scrollY - anchorOffset();
  lenis.scrollTo(top, { duration: MOVE_DURATION, easing: easeOutExpo });

  if (window.history?.replaceState) window.history.replaceState(null, '', hash);
}

function onKeyDown(event) {
  if (!lenis || event.defaultPrevented) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (isEditable(event.target)) return;

  const page = window.innerHeight * KEY_PAGE;
  const from = lenis.targetScroll;
  let next = null;

  if (event.key === 'PageDown') next = from + page;
  else if (event.key === 'PageUp') next = from - page;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = document.documentElement.scrollHeight;
  if (next === null) return;

  event.preventDefault();
  lenis.scrollTo(next, { duration: KEY_DURATION, easing: easeOutExpo });
}

// A tab in the background must not keep a raf loop alive.
function onVisibilityChange() {
  if (!lenis) return;
  if (document.hidden) stopLoop();
  else startLoop();
}

export function initSmoothScroll() {
  if (bound) return;
  bound = true;

  mount();

  ['(pointer: coarse)', '(prefers-reduced-motion: reduce)'].forEach((query) => {
    window.matchMedia(query).addEventListener?.('change', () => {
      if (smoothScrollEnabled()) mount();
      else unmount();
    });
  });

  document.addEventListener('click', onAnchorClick);
  window.addEventListener('keydown', onKeyDown);
  document.addEventListener('visibilitychange', onVisibilityChange);

  new MutationObserver(syncLock).observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  });
}
