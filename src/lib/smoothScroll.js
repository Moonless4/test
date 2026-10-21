// Premium inertial scrolling for precise-pointer devices. Wheel input is
// accumulated into a target position and the page eases towards it once per
// frame, so the content glides with a little weight and settles softly instead
// of jumping. Only the scroll position changes — no layout wrapper, no
// transform, so sticky headers, reveal animations and carousels keep working.
//
// Everything else stays native:
// - touch devices (no `hover` / fine pointer) scroll with the browser,
// - horizontal gestures and carousels are never intercepted,
// - nested scrollers (drawers, panels) keep their own scroll,
// - `prefers-reduced-motion` users get instant scrolling,
// - keyboard, scrollbar drags and browser scroll restoration resync the target.

const DAMPING = 0.13; // share of the remaining distance covered per 60fps frame
const MAX_STEP = 240; // clamp one wheel event so a hard flick stays controlled
const SETTLE = 0.5; // px below which the motion counts as finished
const LINE_HEIGHT = 16; // px for `deltaMode: DOM_DELTA_LINE`
const ANCHOR_GAP = 16; // breathing room under a sticky header

let target = 0;
let current = 0;
let frameId = 0;
let previousTime = 0;
let bound = false;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Touch-first devices keep the browser's own momentum, which is smoother and
// lighter than anything scripted; a mouse/trackpad device (or one without a
// coarse pointer at all) gets the custom easing.
const touchFirstDevice = () =>
  window.matchMedia('(pointer: coarse)').matches && navigator.maxTouchPoints > 0;

export const smoothScrollEnabled = () => !touchFirstDevice() && !prefersReducedMotion();

function hasOverflow(element, axis) {
  const style = getComputedStyle(element);
  const overflow = axis === 'x' ? style.overflowX : style.overflowY;
  if (!/(auto|scroll|overlay)/.test(overflow)) return false;
  return axis === 'x'
    ? element.scrollWidth > element.clientWidth + 1
    : element.scrollHeight > element.clientHeight + 1;
}

// A wheel event over a nested scroller must scroll that element, not the page.
function insideScroller(node, axis) {
  for (let element = node; element && element !== document.body; element = element.parentElement) {
    if (element instanceof HTMLElement && hasOverflow(element, axis)) return true;
  }
  return false;
}

function isEditable(node) {
  return Boolean(
    node?.closest?.('input, textarea, select, button, a, summary, [contenteditable="true"]'),
  );
}

function step(time) {
  const elapsed = previousTime ? Math.min(64, time - previousTime) : 1000 / 60;
  previousTime = time;

  const max = maxScroll();
  target = clamp(target, 0, max);
  const ease = 1 - Math.pow(1 - DAMPING, elapsed / (1000 / 60));

  current = clamp(current + (target - current) * ease, 0, max);

  if (Math.abs(target - current) < SETTLE) {
    current = target;
    window.scrollTo(0, current);
    frameId = 0;
    previousTime = 0;
    return;
  }

  window.scrollTo(0, current);
  frameId = requestAnimationFrame(step);
}

// Ease towards a position. Calling it again mid-flight only moves the target,
// which is what keeps the motion continuous while the wheel keeps turning.
function animateTo(value) {
  if (!frameId) current = window.scrollY;
  target = clamp(value, 0, maxScroll());
  if (frameId) return;
  previousTime = 0;
  frameId = requestAnimationFrame(step);
}

export function smoothScrollTo(value) {
  if (!smoothScrollEnabled()) {
    window.scrollTo(0, clamp(value, 0, maxScroll()));
    return;
  }
  animateTo(value);
}

export function resetSmoothScroll() {
  if (frameId) cancelAnimationFrame(frameId);
  frameId = 0;
  previousTime = 0;
  target = 0;
  current = 0;
  window.scrollTo(0, 0);
}

function onWheel(event) {
  if (event.defaultPrevented || event.ctrlKey || !smoothScrollEnabled()) return;
  if (document.body.classList.contains('disable-scrolling')) return;

  // Horizontal gestures belong to the browser (and to the carousels).
  if (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  if (Math.abs(event.deltaY) < 0.5) return;
  if (insideScroller(event.target, 'y')) return;

  const unit =
    event.deltaMode === 1 ? LINE_HEIGHT : event.deltaMode === 2 ? window.innerHeight : 1;
  const delta = clamp(event.deltaY * unit, -MAX_STEP, MAX_STEP);

  event.preventDefault();
  animateTo((frameId ? target : window.scrollY) + delta);
}

// Anything that scrolls the page outside this engine — scrollbar drag, keyboard,
// browser scroll restoration — becomes the new reference point.
function onScroll() {
  const position = window.scrollY;
  if (!frameId) {
    target = position;
    current = position;
    return;
  }
  if (Math.abs(position - current) > 3) {
    target = position;
    current = position;
  }
}

function onKeyDown(event) {
  if (!smoothScrollEnabled() || event.defaultPrevented) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (isEditable(event.target)) return;

  const page = window.innerHeight * 0.9;
  let next = null;

  if (event.key === 'PageDown') next = (frameId ? target : window.scrollY) + page;
  else if (event.key === 'PageUp') next = (frameId ? target : window.scrollY) - page;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = maxScroll();
  if (next === null) return;

  event.preventDefault();
  animateTo(next);
}

function onAnchorClick(event) {
  if (event.defaultPrevented || event.button > 0) return;
  const link = event.target.closest?.('a[href^="#"]');
  if (!link) return;

  const hash = link.getAttribute('href');
  if (!hash || hash.length < 2) return;

  const section = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!section) return;

  event.preventDefault();
  const header = document.getElementById('header-container');
  const offset = (header ? header.getBoundingClientRect().height : 0) + ANCHOR_GAP;
  smoothScrollTo(section.getBoundingClientRect().top + window.scrollY - offset);

  if (window.history?.replaceState) window.history.replaceState(null, '', hash);
}

function onResize() {
  if (!frameId) {
    target = window.scrollY;
    current = target;
    return;
  }
  target = clamp(target, 0, maxScroll());
}

// The theme ships `html { scroll-behavior: smooth }`. Every frame write would
// restart the browser's own animation and the two would fight, so the engine
// turns it off while it is active and restores the theme behaviour otherwise.
function syncCssScrollBehavior() {
  document.documentElement.style.scrollBehavior = smoothScrollEnabled() ? 'auto' : '';
}

export function initSmoothScroll() {
  if (bound) return;
  bound = true;

  syncCssScrollBehavior();
  ['(pointer: coarse)', '(prefers-reduced-motion: reduce)'].forEach((query) => {
    window.matchMedia(query).addEventListener?.('change', syncCssScrollBehavior);
  });

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onResize);
  document.addEventListener('click', onAnchorClick);
}
