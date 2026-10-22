import { useEffect } from 'react';

// ردیف‌های افقی سایت: با تبلت/موبایل طبیعی اسکرول می‌شوند، این هوک همین اسکرول را با کشیدن ماوس هم فعال می‌کند.
const SCROLL_ROWS = '.acct-tabs, .account-nav, .menu-filters, .product-track, .category-track';

export default function useDragScroll() {
  useEffect(() => {
    let row = null;
    let startX = 0;
    let startLeft = 0;
    let dragged = false;

    const onPointerDown = (event) => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      const target = event.target instanceof Element ? event.target.closest(SCROLL_ROWS) : null;
      if (!target || target.scrollWidth <= target.clientWidth + 1) return;
      row = target;
      startX = event.clientX;
      startLeft = target.scrollLeft;
      dragged = false;
      target.classList.add('is-dragging');
    };

    const onPointerMove = (event) => {
      if (!row) return;
      const dx = event.clientX - startX;
      if (!dragged && Math.abs(dx) < 5) return;
      dragged = true;
      // چیدمان راست‌به‌چپ: محتوا با انگشت همراه می‌شود
      row.scrollLeft = startLeft + dx;
    };

    const endDrag = () => {
      if (!row) return;
      row.classList.remove('is-dragging');
      row = null;
    };

    // کشیدن نباید روی دکمه‌های داخل ردیف کلیک حساب شود
    const onClick = (event) => {
      if (!dragged) return;
      dragged = false;
      event.preventDefault();
      event.stopPropagation();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', endDrag);
    document.addEventListener('click', onClick, true);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', endDrag);
      document.removeEventListener('pointercancel', endDrag);
      document.removeEventListener('click', onClick, true);
    };
  }, []);
}
