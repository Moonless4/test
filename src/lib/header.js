// Header behaviours from the reference theme's JS: sticky state, the mobile
// drawer and collapsible sub-menus. The header markup lives for the whole
// session, so everything here is bound exactly once.

let bound = false;

// The header only starts leaving once the page has scrolled past its own band,
// so it never slides away while it is still the first thing on screen.
const HIDE_AFTER = 200;

// Ignore sub-threshold movement: Lenis writes a scroll position every frame and
// a rounding wobble would otherwise flip the direction on each one.
const DIRECTION_DELTA = 6;

function setDrawer(drawer, overlay, open) {
  if (!drawer) return;
  if (open) document.body.classList.remove('header-hidden');
  drawer.classList.toggle('open', open);
  if (overlay) overlay.style.display = open ? 'block' : 'none';
  document.body.classList.toggle('disable-scrolling', open);
}

export function initHeader(root) {
  if (!root) return;
  if (bound) return;
  bound = true;

  document.body.classList.add('sticky-header');

  // Scrolling down slides the header out, scrolling up brings it straight back
  // (`header-hidden` is what `styles/site.css` animates).
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    document.body.classList.toggle('sticky-header-active', y > 24);

    if (Math.abs(y - lastY) < DIRECTION_DELTA) return;
    const goingDown = y > lastY;
    lastY = y;
    const hide = goingDown && y > HIDE_AFTER && !document.body.classList.contains('disable-scrolling');
    document.body.classList.toggle('header-hidden', hide);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const drawer = root.querySelector('#mobile-menu-container');
  const overlay = root.querySelector('#mobile-menu-overlay');
  const openButton = root.querySelector('#header-toggle-mobile-menu');
  const closeButton = root.querySelector('.header-mobile-close-menu');

  setDrawer(drawer, overlay, false);
  openButton?.addEventListener('click', () => setDrawer(drawer, overlay, !drawer?.classList.contains('open')));
  overlay?.addEventListener('click', () => setDrawer(drawer, overlay, false));
  closeButton?.addEventListener('click', () => setDrawer(drawer, overlay, false));

  drawer?.querySelectorAll('.menu-item-has-children > a').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const item = link.parentElement;
      const submenu = item.querySelector('.sub-menu');
      const open = item.classList.toggle('open');
      if (submenu) submenu.style.display = open ? 'block' : 'none';
    });
  });

  root.querySelectorAll('.menu-item-has-children > a[href="#"]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });
}
