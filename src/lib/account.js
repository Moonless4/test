// Lightweight client-side account state for the demo storefront. The theme's
// login/signup screens post to WordPress; this rebuild keeps the same flow in
// the browser so the header reflects a signed-in visitor without a backend.
const STORAGE_KEY = 'luxina-account';

export function getAccount() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return parsed && parsed.name ? parsed : null;
  } catch {
    return null;
  }
}

export function setAccount(account) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
}

export function clearAccount() {
  localStorage.removeItem(STORAGE_KEY);
}

export function applyAccount(root = document) {
  const account = getAccount();
  const wrappers = root.querySelectorAll('.luxina-account-wrap');
  if (!wrappers.length) return;

  wrappers.forEach((wrap) => {
    wrap.classList.toggle('guest-user-wrap', !account);
    wrap.classList.toggle('logged-in-wrap', Boolean(account));
  });

  const trigger = root.querySelector('.luxina-account-wrap .luxina-account');
  if (trigger) {
    trigger.classList.toggle('guest-user', !account);
    trigger.classList.toggle('logged-in', Boolean(account));
    trigger.setAttribute('href', account ? '/' : '/login');
    const name = trigger.querySelector('.luxina-account-display_name');
    if (name) {
      name.innerHTML = account
        ? `<span class="luxina-account-display_name-login">${account.name}</span>`
        : `<span class="luxina-account-display_name-login">ورود</span>
           <span class="luxina-account-display_name-divider" aria-hidden="true"></span>
           <span class="luxina-account-display_name-signup">عضویت</span>`;
    }
  }

  // Guests get no popover: the header icon itself reads "ورود | عضویت" on hover.
  const items = root.querySelector('.header-actions-wrap .account-items');
  if (items) {
    items.innerHTML = account
      ? `<li class="luxina-account-item account-item menu-item account-logout">
           <a href="#" class="account-item-link rb-logout">
             <span class="account-item-label menu-item-title">خروج از حساب</span>
             <i class="account-item-arrow-icon luxina-icon-arrow-left-line sub-menu-item-arrow"></i>
           </a>
         </li>`
      : '';
  }

  const mobile = root.querySelector('.header-mobile-actions-wrap .luxina-account-wrap');
  if (mobile) {
    mobile.innerHTML = account
      ? `<a href="#" class="button button-start rounded button-primary fullwidth rb-logout">
           <span class="button-text">خروج از حساب</span>
           <i class="luxina-icon-user-6-line button-icon" aria-hidden="true"></i>
         </a>`
      : `<a href="/login" class="button button-start rounded button-primary fullwidth">
           <span class="button-text">ورود</span>
           <i class="luxina-icon-user-6-line button-icon" aria-hidden="true"></i>
         </a>
         <a href="/login?section=signup" class="button button-start rounded button-tertiary fullwidth">
           <span class="button-text">عضویت</span>
           <i class="luxina-icon-user-6-line button-icon" aria-hidden="true"></i>
         </a>`;
  }
}
