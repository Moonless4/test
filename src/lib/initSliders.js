// The theme's rows carry their own breakpoint config in `data-settings`
// (`desktop/tablet/mobile.slider.enabled`). When a row is a slider — or simply
// wider than its container — it becomes a horizontally scrollable track and the
// prev/next buttons start paging it. Rows configured as grids keep their grid.
const MOBILE_MAX = 767;
const TABLET_MAX = 1200;

function breakpoint() {
  if (window.innerWidth <= MOBILE_MAX) return 'mobile';
  if (window.innerWidth <= TABLET_MAX) return 'tablet';
  return 'desktop';
}

export function initSliders(root = document) {
  const current = breakpoint();

  root.querySelectorAll('.luxina-slider-wrap').forEach((wrap) => {
    let settings = {};
    try {
      settings = JSON.parse(wrap.dataset.settings || '{}');
    } catch {
      settings = {};
    }

    const track = wrap.querySelector('.desktop-columns, .tablet-columns, .mobile-columns');
    if (!track) return;

    const sliderEnabled = settings[current]?.slider?.enabled === true;
    const overflowing = track.scrollWidth > track.clientWidth + 4;
    if (!sliderEnabled && !overflowing) return;

    track.classList.add('rb-track');

    const prev = wrap.querySelector('.swiper-button-prev');
    const next = wrap.querySelector('.swiper-button-next');
    const direction = getComputedStyle(track).direction === 'rtl' ? -1 : 1;
    const step = () => Math.round(track.clientWidth * 0.9);

    if (prev) {
      prev.style.display = 'flex';
      prev.addEventListener('click', () =>
        track.scrollBy({ left: direction * step(), behavior: 'smooth' }),
      );
    }
    if (next) {
      next.style.display = 'flex';
      next.addEventListener('click', () =>
        track.scrollBy({ left: -direction * step(), behavior: 'smooth' }),
      );
    }
  });
}
