// Small markup builders shared by the reconstructed routes. They follow the
// reference page's own widget markup so the theme stylesheets apply unchanged.
import { homeSections } from '../content/home.js';

export const sectionWith = (widget) =>
  homeSections.find((section) => section.html.includes(`elementor-widget-luxina_${widget}`))?.html ?? '';

export const sectionById = (id) => homeSections.find((section) => section.id === id)?.html ?? '';

export const heading = (title, subtitle, icon = 'luxina-icon-home-5-line') => `
<div class="elementor-widget elementor-widget-luxina_heading">
  <div class="elementor-widget-container">
    <div class="luxina_heading_wrap">
      <i class="luxinaicon ${icon} luxina_heading_icon" aria-hidden="true"></i>
      <div class="luxina_heading_title_inner">
        <div class="luxina_heading_title">${title}</div>
        <span class="luxina_heading_subtitle">${subtitle}</span>
      </div>
    </div>
  </div>
</div>`;

export const section = (inner, className = '') => `
<div class="elementor-element e-flex e-con-boxed e-con e-parent rb-con ${className}">
  <div class="e-con-inner">${inner}</div>
</div>`;

export const parse = (html) => new DOMParser().parseFromString(html, 'text/html');
