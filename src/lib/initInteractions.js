// Behaviours the reference theme's own JS provides: sticky header, the mobile
// drawer, collapsible mobile sub-menus and the FAQ accordion.
let listening = false;

export function initInteractions(root = document) {
  document.body.classList.add('sticky-header');

  if (!listening) {
    const onScroll = () =>
      document.body.classList.toggle('sticky-header-active', window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    listening = true;
  }
  document.body.classList.toggle('sticky-header-active', window.scrollY > 24);

  const drawer = root.querySelector('#mobile-menu-container');
  const overlay = root.querySelector('#mobile-menu-overlay');
  const openButton = root.querySelector('#header-toggle-mobile-menu');
  const closeButton = root.querySelector('.header-mobile-close-menu');

  const setDrawer = (open) => {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    if (overlay) overlay.style.display = open ? 'block' : 'none';
    document.body.classList.toggle('disable-scrolling', open);
  };

  setDrawer(false);
  openButton?.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
  overlay?.addEventListener('click', () => setDrawer(false));
  closeButton?.addEventListener('click', () => setDrawer(false));

  drawer?.querySelectorAll('.menu-item-has-children > a').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const item = link.parentElement;
      const submenu = item.querySelector('.sub-menu');
      const open = item.classList.toggle('open');
      if (submenu) submenu.style.display = open ? 'block' : 'none';
    });
  });

  root.querySelectorAll('.luxina_faq_container').forEach((list) => {
    const items = Array.from(list.querySelectorAll('.luxina_faq_item'));
    items.forEach((item) => {
      item.querySelector('.luxina_faq_item_head')?.addEventListener('click', () => {
        const wasOpen = item.classList.contains('first_expanded');
        items.forEach((other) => other.classList.remove('first_expanded'));
        if (!wasOpen) item.classList.add('first_expanded');
      });
    });
  });

  root.querySelectorAll('.rb-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const note = form.querySelector('.rb-form-note');
      if (note) note.hidden = false;
      form.querySelectorAll('input, textarea').forEach((field) => {
        field.value = '';
      });
    });
  });
}
