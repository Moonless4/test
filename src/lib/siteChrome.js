// The header and footer are the reference theme's captured markup, so their
// editable spots are filled in here instead of in JSX: the menu (items,
// dropdowns, order, visibility), the contact details, social links, licence
// marks and footer link columns all come from the saved content.
import { site } from '../content/site.js';

function setText(node, value) {
  if (node && typeof value === 'string' && value.trim()) node.textContent = value;
}

function setHref(node, value) {
  if (node && typeof value === 'string' && value) node.setAttribute('href', value);
}

const visible = (item) => item && item.enabled !== false && String(item.label || '').trim();

function menuItemHtml(item, index) {
  const children = (item.children || []).filter(visible);
  const icon = String(item.icon || 'luxina-icon-arrow-right-line');
  const home = item.href === '/' && index === 0;
  const classes = [
    'menu-item',
    'menu-item-type-custom',
    'menu-item-object-custom',
    children.length ? 'menu-item-has-children' : '',
    home ? 'menu-item-home current-menu-item page_item current_page_item' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const submenu = children.length
    ? `<ul class="sub-menu">${children
        .map(
          (child) =>
            `<li class="menu-item menu-item-type-custom menu-item-object-custom"><a href="${escapeAttr(
              child.href,
            )}"><span class="menu-item-title">${escapeHtml(child.label)}</span><i class="luxina-icon-arrow-left-line sub-menu-item-arrow"></i></a></li>`,
        )
        .join('')}</ul>`
    : '';

  return `<li class="${classes}"><a href="${escapeAttr(item.href)}"${
    home ? ' aria-current="page"' : ''
  }><span class="menu-item-icons-wrap"><i class="menu-item-icon normal-icon ${escapeAttr(
    icon,
  )}-line" aria-hidden="true"></i><i class="menu-item-icon hover-icon ${escapeAttr(
    icon,
  )}-fill" aria-hidden="true"></i></span><span class="menu-item-title">${escapeHtml(
    item.label,
  )}</span>${children.length ? '<i class="luxina-icon-arrow-down-s-line menu-item-arrow"></i>' : ''}</a>${submenu}</li>`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, '&#39;');
}

function renderMenu(root, menu) {
  const list = root?.querySelector('ul.menu');
  if (!list || !Array.isArray(menu)) return;
  const items = menu.filter(visible);
  list.innerHTML = items.map(menuItemHtml).join('');
}

export function applyHeaderChrome() {
  const header = document.getElementById('header-container');
  if (!header) return;

  header.querySelectorAll('.header-action-btn-wrap').forEach((wrap) => {
    setText(wrap.querySelector('.header-action-btn-text'), site.header.ctaLabel);
    setText(wrap.querySelector('.header-action-btn-text.bold'), site.header.ctaPhone);
    setHref(wrap, site.header.ctaHref);
  });

  // Brand marks: the first header image is the light mark used on the dark
  // homepage header, the second is the dark mark once the header turns solid.
  const headerLogos = header.querySelectorAll('#site-logo img, .site-logo img');
  if (headerLogos[0] && site.general?.logoLight) headerLogos[0].setAttribute('src', site.general.logoLight);
  if (headerLogos[1] && site.general?.logo) headerLogos[1].setAttribute('src', site.general.logo);
  if (site.general?.studioName) {
    headerLogos.forEach((logo) => logo.setAttribute('alt', `${site.general.studioName} | ARATAN`));
  }

  renderMenu(header.querySelector('.main-menu'), site.header.menu);
  renderMenu(document.querySelector('#mobile-menu-container'), site.header.menu);
}

function renderLinks(root, links) {
  const list = root?.querySelector('ul.menu');
  if (!list || !Array.isArray(links)) return;
  list.innerHTML = links
    .filter(visible)
    .map(
      (link) =>
        `<li class="menu-item menu-item-type-custom menu-item-object-custom"><a href="${escapeAttr(
          link.href,
        )}"><span class="menu-item-title">${escapeHtml(link.label)}</span></a></li>`,
    )
    .join('');
}

function setHeading(root, title, subtitle) {
  if (!root) return;
  setText(root.querySelector('.luxina_heading_title'), title);
  setText(root.querySelector('.luxina_heading_subtitle'), subtitle);
}

export function applyFooterChrome() {
  const footer = document.getElementById('footer');
  if (!footer) return;
  const { contact, socials } = site;
  const footerContent = site.footer || {};

  setText(footer.querySelector('.footer-about-us-text p'), footerContent.about);
  const footerLogo = footer.querySelector('#site-logo img');
  if (footerLogo && site.general?.logoLight) footerLogo.setAttribute('src', site.general.logoLight);

  setHeading(footer.querySelector('.footer-menu1'), footerContent.quickTitle, footerContent.quickSubtitle);
  setHeading(footer.querySelector('.footer-menu2'), footerContent.servicesTitle, footerContent.servicesSubtitle);
  setHeading(footer.querySelector('.footer-contact-info'), footerContent.contactTitle, footerContent.contactSubtitle);
  setHeading(footer.querySelector('.footer-orgs'), footerContent.licensesTitle, footerContent.licensesSubtitle);
  setHeading(footer.querySelector('.footer-social'), footerContent.socialTitle, footerContent.socialSubtitle);

  renderLinks(footer.querySelector('.footer-menu1'), footerContent.quickLinks);
  renderLinks(footer.querySelector('.footer-menu2'), footerContent.serviceLinks);

  const contacts = footer.querySelectorAll('.footer-contact-info-item-text');
  setText(contacts[0], contact.address);
  setText(contacts[1], contact.email);
  if (contacts[1] && contact.email) contacts[1].setAttribute('href', `mailto:${contact.email}`);

  footer.querySelectorAll('.footer-social-item').forEach((link, index) => {
    const social = socials[index];
    if (!social) return;
    if (social.href) link.setAttribute('href', social.href);
    setText(link.querySelector('.footer-social-item-text'), social.handle);
  });

  footer.querySelectorAll('.footer-orgs-item img').forEach((img, index) => {
    const licence = footerContent.licenses?.[index];
    if (!licence) return;
    if (licence.image) img.setAttribute('src', licence.image);
    img.setAttribute('alt', licence.label || '');
  });
}
