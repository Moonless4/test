import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';

/** RTL rails scroll towards negative offsets, LTR ones towards positive. */
function forwardSign(el: HTMLElement) {
  return getComputedStyle(el).direction === 'rtl' ? -1 : 1;
}

/** Wheel deltas arrive in pixels, lines or pages depending on the device. */
function wheelAmount(el: HTMLElement, e: WheelEvent) {
  if (e.deltaMode === 1) return e.deltaY * 16;
  if (e.deltaMode === 2) return e.deltaY * el.clientWidth;
  return e.deltaY;
}

/**
 * Mouse-wheel and drag scrolling for a horizontal rail. Touch keeps the browser's own
 * momentum scrolling, and the arrow buttons keep working.
 */
export function useDragScroll(ref: React.RefObject<HTMLElement>) {
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // React listens to wheel passively, so bind natively to be able to preventDefault.
    const onWheel = (e: WheelEvent) => {
      // Horizontal gestures (trackpad) scroll the rail on their own.
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      const sign = forwardSign(el);
      const amount = wheelAmount(el, e);
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      const progress = sign * el.scrollLeft;
      const forward = amount > 0;
      // At either end let the page keep scrolling instead of trapping the wheel.
      if (max === 0 || (forward ? progress >= max - 1 : progress <= 1)) return;

      e.preventDefault();
      el.scrollLeft += sign * amount;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [ref]);

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse' || e.button !== 0) return;
    if (el.scrollWidth - el.clientWidth <= 0) return;

    drag.current = { active: true, moved: false, startX: e.clientX, startLeft: el.scrollLeft };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const el = ref.current;
    const state = drag.current;
    if (!el || !state.active) return;

    const dx = e.clientX - state.startX;
    if (!state.moved) {
      if (Math.abs(dx) < 5) return;
      state.moved = true;
      // Follow the pointer even once it leaves the rail.
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
      // Snapping and smooth scrolling would fight the pointer mid-drag; restore on release.
      el.style.scrollSnapType = 'none';
      el.style.scrollBehavior = 'auto';
    }

    // Cards always sit at -1px per scroll unit, in either writing direction.
    el.scrollLeft = state.startLeft - dx;
  };

  const endDrag = () => {
    const el = ref.current;
    drag.current.active = false;
    if (!el) return;
    el.style.scrollSnapType = '';
    el.style.scrollBehavior = '';
  };

  /** A drag across a card must not open it. */
  const onClickCapture = (e: React.MouseEvent) => {
    if (!drag.current.moved) return;
    drag.current.moved = false;
    e.preventDefault();
    e.stopPropagation();
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onDragStart: (e: React.DragEvent) => e.preventDefault(),
    onClickCapture,
  };
}
