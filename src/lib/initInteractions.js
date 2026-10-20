// Behaviours the reference theme's own JS provides: sticky header, the mobile
// drawer, collapsible mobile sub-menus and the FAQ accordion.
import { applyAccount, clearAccount, setAccount } from './account.js';

let listening = false;
let authListening = false;
let lightboxListening = false;

function closeLightbox(lightbox) {
  lightbox.hidden = true;
  if (!document.querySelector('#mobile-menu-container.open')) {
    document.body.classList.remove('disable-scrolling');
  }
}

const toEnglishDigits = (value) =>
  value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));

const validators = {
  name: (value) => value.trim().length >= 3 || 'نام را کامل وارد کنید.',
  email: (value) => {
    const text = value.trim();
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text)) return true;
    const digits = toEnglishDigits(text).replace(/\D/g, '');
    return (digits.length >= 8 && digits.length <= 11) || 'ایمیل یا شماره موبایل معتبر وارد کنید.';
  },
  phone: (value) => {
    const digits = toEnglishDigits(value).replace(/\D/g, '');
    return (digits.length >= 8 && digits.length <= 11) || 'شماره تماس معتبر وارد کنید.';
  },
  password: (value) => value.length >= 6 || 'رمز عبور باید حداقل ۶ کاراکتر باشد.',
};

function setFieldError(field, message) {
  field.classList.toggle('rb-invalid', Boolean(message));
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  const next = field.nextElementSibling;
  const existing = next && next.classList?.contains('rb-field-error') ? next : null;
  if (!message) {
    if (existing) existing.remove();
    return;
  }
  const error = existing || document.createElement('span');
  if (!existing) {
    error.className = 'rb-field-error';
    field.insertAdjacentElement('afterend', error);
  }
  error.textContent = message;
}

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const fields = Array.from(form.querySelectorAll('input, textarea'));
  let valid = true;

  fields.forEach((field) => {
    const validate = validators[field.name];
    if (!validate) {
      setFieldError(field, '');
      return;
    }
    const result = validate(field.value);
    const message = result === true ? '' : result;
    setFieldError(field, message);
    if (message) valid = false;
  });

  if (!valid) {
    const firstInvalid = form.querySelector('.rb-invalid');
    firstInvalid?.focus();
    return;
  }

  const note = form.querySelector('.rb-form-note');
  const type = form.dataset.rbForm;
  if (type === 'login' || type === 'signup') {
    const email = form.querySelector('[name="email"]')?.value.trim() || '';
    const name = form.querySelector('[name="name"]')?.value.trim() || email.split('@')[0];
    setAccount({ name, email });
    applyAccount(document);
  }

  if (note) note.hidden = false;
  fields.forEach((field) => {
    field.value = '';
  });
}

export function initInteractions(root = document) {
  document.body.classList.add('sticky-header');
  applyAccount(root);

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
    form.addEventListener('submit', handleFormSubmit);
  });

  root.querySelectorAll('.menu-item-has-children > a[href="#"]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });

  root.querySelectorAll('.rb-gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      const lightbox = root.querySelector('.rb-lightbox');
      const image = lightbox?.querySelector('img');
      if (!lightbox || !image) return;
      image.src = item.dataset.full;
      lightbox.hidden = false;
      document.body.classList.add('disable-scrolling');
    });
  });

  root.querySelectorAll('.rb-lightbox').forEach((lightbox) => {
    lightbox.addEventListener('click', (event) => {
      if (event.target !== lightbox && !event.target.closest('.rb-lightbox-close')) return;
      closeLightbox(lightbox);
    });
  });

  if (!lightboxListening) {
    lightboxListening = true;
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      document.querySelectorAll('.rb-lightbox:not([hidden])').forEach(closeLightbox);
    });
  }

  if (!authListening) {
    authListening = true;
    document.addEventListener('click', (event) => {
      if (!event.target.closest?.('.rb-logout')) return;
      event.preventDefault();
      clearAccount();
      applyAccount(document);
    });
  }
}
