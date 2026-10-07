import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';

/**
 * Which way the rail travels: +1 when a larger `scrollLeft` moves forward through the
 * items, -1 when it moves backwards (RTL rails are offset towards negative values).
 * Measured once on the element, because the sign differs between writing directions.
 */
function travelSign(el: HTMLElement): number {
  const anchor = el.firstElementChild as HTMLElement | null;
  if (!anchor) return 1;

  const start = el.scrollLeft;
  const startLeft = anchor.getBoundingClientRect().left;
  const behavior = el.style.scrollBehavior;
  el.style.scrollBehavior = 'auto';

  for (const nudge of [40, -40]) {
    el.scrollLeft = start + nudge;
    const moved = el.scrollLeft - start;
    const shift = anchor.getBoundingClientRect().left - startLeft;
    if (moved !== 0 && shift !== 0) {
      el.scrollLeft = start;
      el.style.scrollBehavior = behavior;
      // Items moving left means the rail travelled forward.
      return (shift < 0) === (moved > 0) ? 1 : -1;
    }
  }

  el.scrollLeft = start;
  el.style.scrollBehavior = behavior;
  return 1;
}

type Metrics = { max: number; offset: number; sign: number };

function metricsOf(el: HTMLElement, sign: number): Metrics {
  return {
    sign,
    max: Math.max(0, el.scrollWidth - el.clientWidth),
    offset: sign * el.scrollLeft,
  };
}

/**
 * Mouse-wheel and drag scrolling for a horizontal rail. Touch keeps the browser's own
 * momentum scrolling, and the arrow buttons keep working.
 */
export function useDragScroll(ref: React.RefObject<HTMLElement>) {
  const sign = useRef(0);
  const drag = useRef({ active: false, moved: false, sign: 1, startX: 0, startLeft: 0 });

  const signOf = (el: HTMLElement) => {
    if (sign.current === 0) sign.current = travelSign(el);
    return sign.current;
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // React listens to wheel passively, so bind natively to be able to preventDefault.
    const onWheel = (e: WheelEvent) => {
      // Horizontal gestures (trackpad) scroll the rail on their own.
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      const direction = signOf(el);
      const { max, offset } = metricsOf(el, direction);
      const forward = e.deltaY > 0;
      // At either end let the page keep scrolling instead of trapping the wheel.
      if (max === 0 || (forward ? offset >= max - 1 : offset <= 1)) return;

      e.preventDefault();
      el.scrollLeft += direction * e.deltaY;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [ref]);

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse' || e.button !== 0) return;

    const direction = signOf(el);
    if (metricsOf(el, direction).max === 0) return;
    drag.current = {
      active: true,
      moved: false,
      sign: direction,
      startX: e.clientX,
      startLeft: el.scrollLeft,
    };
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

    // Dragging left must carry the items left, in either writing direction.
    el.scrollLeft = state.startLeft - state.sign * dx;
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
