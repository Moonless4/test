// The header and footer are the reference theme's captured markup, so their
// editable spots are filled in here instead of in JSX: the contact details,
// social links, licence marks and menu labels come from the saved content.
import { site } from '../content/site.js';

function setText(node, value) {
  if (node && typeof value === 'string' && value.trim()) node.textContent = value;
}

function patchMenu(root, menu) {
  if (!root || !Array.isArray(menu)) return;
  root.querySelectorAll('ul.menu > li > a').forEach((link, index) => {
    const item = menu[index];
    if (!item) return;
    setText(link.querySelector('.menu-item-title'), item.label);
    if (typeof item.href === 'string' && item.href) link.setAttribute('href', item.href);
  });
}

export function applyHeaderChrome() {
  const header = document.getElementById('page-header');
  if (!header) return;

  header.querySelectorAll('.header-action-btn-wrap').forEach((wrap) => {
    setText(wrap.querySelector('.header-action-btn-text'), site.header.ctaLabel);
    setText(wrap.querySelector('.header-action-btn-text.bold'), site.header.ctaPhone);
  });

  patchMenu(header.querySelector('.main-menu'), site.header.menu);
  patchMenu(document.querySelector('#mobile-menu-container'), site.header.menu);
}

export function applyFooterChrome() {
  const footer = document.getElementById('footer');
  if (!footer) return;
  const { contact, socials } = site;

  setText(footer.querySelector('.footer-about-us-text p'), site.footer.about);

  const contacts = footer.querySelectorAll('.footer-contact-info-item-text');
  setText(contacts[0], contact.address);
  setText(contacts[1], contact.email);

  footer.querySelectorAll('.footer-social-item').forEach((link, index) => {
    const social = socials[index];
    if (!social) return;
    if (social.href) link.setAttribute('href', social.href);
    setText(link.querySelector('.footer-social-item-text'), social.handle);
  });

  footer.querySelectorAll('.footer-orgs-item img').forEach((img, index) => {
    const licence = site.footer.licenses[index];
    if (!licence) return;
    if (licence.image) img.setAttribute('src', licence.image);
    img.setAttribute('alt', licence.label || '');
  });
}
