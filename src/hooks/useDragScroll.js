import { useEffect } from 'react';

// ردیف‌های افقی سایت: هم با انگشت و هم با کشیدن ماوس حرکت می‌کنند.
const SCROLL_ROWS =
  '.acct-tabs, .account-nav, .menu-filters, .product-track, .category-track';

const isScrollable = (element) => element.scrollWidth > element.clientWidth + 2;

export default function useDragScroll() {
  useEffect(() => {
    let row = null;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let dragging = false;
    let suppressClickUntil = 0;

    const rowOf = (target) =>
      target instanceof Element ? target.closest(SCROLL_ROWS) : null;

    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const target = rowOf(event.target);
      if (!target || !isScrollable(target)) return;

      row = target;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startLeft = target.scrollLeft;
      dragging = false;
    };

    const onPointerMove = (event) => {
      if (!row || event.pointerId !== pointerId) return;

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      if (!dragging) {
        // کشیدن عمودی مال اسکرول صفحه است؛ فقط حرکت افقی ردیف را جابه‌جا می‌کند
        if (Math.abs(dx) < 6 || Math.abs(dx) <= Math.abs(dy)) return;
        dragging = true;
        row.classList.add('is-dragging');
      }

      if (event.cancelable) event.preventDefault();
      // چیدمان راست‌به‌چپ: محتوا با دست/ماوس همراه می‌شود
      row.scrollLeft = startLeft + dx;
    };

    const endDrag = () => {
      if (!row) return;
      if (dragging) suppressClickUntil = performance.now() + 350;
      row.classList.remove('is-dragging');
      row = null;
      pointerId = null;
      dragging = false;
    };

    // بعد از کشیدن، کلیک روی کارت‌های داخل ردیف نباید اجرا شود
    const onClick = (event) => {
      if (performance.now() > suppressClickUntil) return;
      suppressClickUntil = 0;
      event.preventDefault();
      event.stopPropagation();
    };

    // کشیدن نباید درگ بومی عکس/لینک را راه بیندازد و ردیف را رها کند
    const onDragStart = (event) => {
      if (row && event.cancelable) event.preventDefault();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove, { passive: false });
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', endDrag);
    document.addEventListener('dragstart', onDragStart, true);
    document.addEventListener('click', onClick, true);
    window.addEventListener('blur', endDrag);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', endDrag);
      document.removeEventListener('pointercancel', endDrag);
      document.removeEventListener('dragstart', onDragStart, true);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('blur', endDrag);
    };
  }, []);
}
