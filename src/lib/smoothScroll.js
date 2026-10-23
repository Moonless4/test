import Lenis from 'lenis';

const OPTIONS = {
  lerp: 0.06,
  wheelMultiplier: 1.2,
  smoothWheel: true,
  syncTouch: true,
  syncTouchLerp: 0.06,
  respectReducedMotion: false,
  allowNestedScroll: true,
  stopInertiaOnNavigate: true,
  autoRaf: false,
};

const hasWindow = typeof window !== 'undefined';

let lenis = null;
let rafId = 0;
let locks = 0;
let initialized = false;

function loop(time) {
  if (!lenis) return;
  lenis.raf(time);
  rafId = window.requestAnimationFrame(loop);
}

function startLoop() {
  if (!hasWindow || rafId) return;
  rafId = window.requestAnimationFrame(loop);
}

function stopLoop() {
  if (!hasWindow || !rafId) return;
  window.cancelAnimationFrame(rafId);
  rafId = 0;
}

export function getLenis() {
  if (!hasWindow) return null;
  if (!lenis) {
    lenis = new Lenis({ ...OPTIONS });
    startLoop();
  }
  return lenis;
}

export function lockScroll() {
  locks += 1;
  stopLoop();
  getLenis()?.stop();
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0 && !document.hidden) {
    getLenis()?.start();
    startLoop();
  }
}

export function scrollToTop({ smooth = false } = {}) {
  const instance = getLenis();
  if (!instance) {
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    return;
  }
  instance.scrollTo(0, { immediate: !smooth, force: true });
}

function isEditable(target) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
}

function onKeyDown(event) {
  const instance = lenis;
  if (!instance || locks > 0) return;
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
  if (isEditable(event.target)) return;

  const page = window.innerHeight * 0.9;
  const limit = instance.limit ?? document.documentElement.scrollHeight - window.innerHeight;
  const current = instance.targetScroll ?? window.scrollY;

  if (event.key === 'PageDown') {
    event.preventDefault();
    instance.scrollTo(Math.min(current + page, limit));
  } else if (event.key === 'PageUp') {
    event.preventDefault();
    instance.scrollTo(Math.max(current - page, 0));
  } else if (event.key === 'Home') {
    event.preventDefault();
    instance.scrollTo(0);
  } else if (event.key === 'End') {
    event.preventDefault();
    instance.scrollTo(limit);
  }
}

function onAnchorClick(event) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const anchor = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
  if (!anchor) return;

  const hash = anchor.getAttribute('href');
  if (!hash || hash === '#') return;

  let target = null;
  try {
    target = document.querySelector(hash);
  } catch {
    target = null;
  }
  if (!target) return;

  const instance = getLenis();
  if (!instance) return;

  event.preventDefault();
  const header = document.querySelector('.site-header');
  instance.scrollTo(target, { offset: header ? -header.offsetHeight : 0, force: true });
  window.history.replaceState(null, '', hash);
}

function onVisibilityChange() {
  if (document.hidden) {
    stopLoop();
    lenis?.stop();
    return;
  }
  if (locks === 0) {
    lenis?.start();
    startLoop();
  }
}

export function initSmoothScroll() {
  if (!hasWindow || initialized) return;
  initialized = true;

  getLenis();
  window.addEventListener('keydown', onKeyDown);
  document.addEventListener('click', onAnchorClick);
  document.addEventListener('visibilitychange', onVisibilityChange);
  if (document.hidden) onVisibilityChange();
}
