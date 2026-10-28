import { site } from '../../content/site.js';

// The two masked call-to-action cards ("catalogue" and "consultation"). The
// masked-card geometry comes from the theme's own CSS; each card only supplies
// its direction, artwork, copy and buttons from the admin panel.
function PromoCard({ variant, direction, image, title, subtitle, icon, primary, secondary }) {
  return (
    <div className={`hp-promo hp-promo--${variant}`}>
      <div className={`luxina_masked_cart_container direction-${direction} mobile_direction-up luxina_cta_cart_container`}>
        <div className="luxina_masked_cart_img_wrap">
          <img className="luxina_masked_cart_img" src={image} alt={title} decoding="async" />
        </div>

        <div className="luxina_masked_cart_content_wrap">
          <span
            className={`luxina_masked_cart_content_bg luxina_masked_cart_content_bg_start direction-${direction} direction-mobile-up${
              direction === 'left' ? ' hide-desktop hide-tablet' : ''
            }`}
            aria-hidden="true"
          />
          <div className="luxina_masked_cart_content_inner">
            <span className="luxina_cta_cart_title">{title}</span>
            <span className="luxina_cta_cart_subtitle">{subtitle}</span>
            <div className="luxina_cta_cart_buttons_wrap">
              <a href={primary.href} className="button button-start rounded button-primary luxina_cta_cart_button1">
                <span className="button-text">{primary.label}</span>
              </a>
              <a
                href={secondary.href}
                className="button button-start rounded button-primary luxina_cta_cart_button2"
                target={secondary.external ? '_blank' : undefined}
                rel={secondary.external ? 'noopener' : undefined}
              >
                {secondary.icon ? <i className={`luxinaicon ${secondary.icon} button-icon`} aria-hidden="true" /> : null}
                <span className="button-text">{secondary.label}</span>
              </a>
            </div>
          </div>
          {direction === 'left' ? (
            <span
              className="luxina_masked_cart_content_bg luxina_masked_cart_content_bg_end direction-left hide-mobile"
              aria-hidden="true"
            />
          ) : null}
          <div className={`luxina_masked_cart_icon_wrap luxina_pro_icon_container direction-${direction} mobile_direction-up`} aria-hidden="true">
            <span className="luxina_pro_icon_bg-wrap" />
            <i className={`luxinaicon ${icon} luxina_masked_cart_icon luxina_pro_icon`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PromoSection() {
  const promo = site.promo || {};

  return (
    <section className="hp-section hp-promos">
      <div className="hp-inner">
        <PromoCard
          variant="catalog"
          direction="right"
          image={promo.catalogImage || '/img/catalog-image.png'}
          title={promo.catalogTitle || 'کاتـالـــوگ پـــروژه هـــا'}
          subtitle={promo.catalogSubtitle || 'Projects catalogue'}
          icon="luxina-iconfile-4-fill"
          primary={{ label: promo.catalogPrimaryLabel || 'مشاهده', href: promo.catalogPrimaryHref || '/projects' }}
          secondary={{
            label: promo.catalogSecondaryLabel || 'دانلود',
            href: promo.catalogSecondaryHref || '#',
            icon: 'luxina-icondownload-line',
            external: /^https?:/.test(promo.catalogSecondaryHref || ''),
          }}
        />
        <PromoCard
          variant="consult"
          direction="left"
          image={promo.consultImage || '/img/consult-image.png'}
          title={promo.consultTitle || 'درخواست مشاوره'}
          subtitle={promo.consultSubtitle || 'Consultation request'}
          icon="luxina-iconquestion-answer-fill"
          primary={{ label: promo.consultPrimaryLabel || 'شروع مشاوره', href: promo.consultPrimaryHref || '/consultation' }}
          secondary={{ label: promo.consultSecondaryLabel || 'تماس با ما', href: promo.consultSecondaryHref || '/contact' }}
        />
      </div>
    </section>
  );
}
