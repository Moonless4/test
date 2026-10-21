// Header behaviours from the reference theme's JS: sticky state, the mobile
// drawer, collapsible sub-menus and the account display. The header markup lives
// for the whole session, so everything here is bound exactly once.
import { applyAccount, clearAccount } from './account.js';

let bound = false;

function setDrawer(drawer, overlay, open) {
  if (!drawer) return;
  drawer.classList.toggle('open', open);
  if (overlay) overlay.style.display = open ? 'block' : 'none';
  document.body.classList.toggle('disable-scrolling', open);
}

// The captured markup marks "خانه" as the current item. The route decides the
// real active entry, so every menu (desktop + mobile drawer) is re-marked on
// each navigation.
export function syncHeaderActive(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  document
    .querySelectorAll('#header_inner .menu > li, .luxina-mobile-menu-wrap .menu > li')
    .forEach((item) => {
      const link = item.querySelector(':scope > a[href]');
      const href = link?.getAttribute('href');
      const active =
        Boolean(href) &&
        href.startsWith('/') &&
        (href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`));

      item.classList.toggle('current-menu-item', active);
      item.classList.toggle('current_page_item', active);
      if (active) {
        link.setAttribute('aria-current', 'page');
        const parent = item.parentElement?.closest('li');
        if (parent) parent.classList.add('current-menu-parent', 'current-menu-ancestor');
      } else {
        link.removeAttribute('aria-current');
      }
    });
}

export function initHeader(root) {
  if (!root) return;
  applyAccount(root);

  if (bound) return;
  bound = true;

  document.body.classList.add('sticky-header');
  const onScroll = () => document.body.classList.toggle('sticky-header-active', window.scrollY > 24);
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

  document.addEventListener('click', (event) => {
    if (!event.target.closest?.('.rb-logout')) return;
    event.preventDefault();
    clearAccount();
    applyAccount(document);
  });
}
