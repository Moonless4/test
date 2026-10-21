// The theme's rows carry their own breakpoint config in `data-settings`
// (`desktop/tablet/mobile.slider.enabled`). When a row is a slider — or simply
// wider than its container — it becomes a horizontally scrollable track and the
// prev/next buttons start paging it. Rows configured as grids keep their grid.
const MOBILE_MAX = 767;
const TABLET_MAX = 1200;

let resizeBound = false;

function breakpoint() {
  if (window.innerWidth <= MOBILE_MAX) return 'mobile';
  if (window.innerWidth <= TABLET_MAX) return 'tablet';
  return 'desktop';
}

function syncSlider(wrap) {
  const track = wrap.querySelector('.desktop-columns, .tablet-columns, .mobile-columns');
  if (!track) return;

  // Re-clone the arrows so a re-sync (e.g. on resize) never stacks listeners.
  wrap.querySelectorAll('.swiper-button-prev, .swiper-button-next').forEach((button) => {
    const clone = button.cloneNode(true);
    clone.style.display = 'none';
    button.replaceWith(clone);
  });
  track.classList.remove('rb-track');

  let settings = {};
  try {
    settings = JSON.parse(wrap.dataset.settings || '{}');
  } catch {
    settings = {};
  }

  const current = breakpoint();
  const sliderEnabled = settings[current]?.slider?.enabled === true;
  const overflowing = track.scrollWidth > track.clientWidth + 4;
  if (!sliderEnabled && !overflowing) return;

  track.classList.add('rb-track');

  const prev = wrap.querySelector('.swiper-button-prev');
  const next = wrap.querySelector('.swiper-button-next');
  const direction = getComputedStyle(track).direction === 'rtl' ? -1 : 1;
  const step = () => Math.round(track.clientWidth * 0.9);

  // In RTL the track scrolls towards negative `scrollLeft`, so advancing is
  // always `direction * step` and going back is its negation.
  const advance = () => direction * step();

  if (prev) {
    prev.style.display = 'flex';
    prev.addEventListener('click', () =>
      track.scrollBy({ left: -advance(), behavior: 'smooth' }),
    );
  }
  if (next) {
    next.style.display = 'flex';
    next.addEventListener('click', () =>
      track.scrollBy({ left: advance(), behavior: 'smooth' }),
    );
  }
}

export function initSliders(root = document) {
  root.querySelectorAll('.luxina-slider-wrap').forEach(syncSlider);

  if (!resizeBound) {
    resizeBound = true;
    let timer;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => initSliders(document), 200);
    });
  }
}
