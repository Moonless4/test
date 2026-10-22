import { useEffect, useRef } from 'react';

// Homepage services band. The cards are the theme's own service tiles (hover
// opens the subtitle), so the only thing React has to do is measure each
// subtitle once so the CSS height transition knows its target height.
const SERVICES = [
  {
    title: 'طراحی نقشه و پروتوتایپ',
    subtitle: 'از تحلیل سایت تا نقشه‌های اجرایی',
    icon: 'luxina-iconbrush-fill',
    image: '/img/service-image1.png',
    slug: 'architecture-plans',
  },
  {
    title: 'ساخت و اجرای پروژه‌های لوکس',
    subtitle: 'یک تیم، از کانسپت تا تحویل کلید',
    icon: 'luxina-iconbuilding-3-fill',
    image: '/img/service-image2.png',
    slug: 'luxury-construction',
  },
  {
    title: 'بازسازی خانه های قدیمی',
    subtitle: 'هویت بنا می‌ماند، عملکرد به‌روز می‌شود',
    icon: 'luxina-iconbuilding-fill',
    image: '/img/service-image4.png',
    slug: 'old-house-renovation',
  },
  {
    title: 'طراحی داخلی و دکوراسیون',
    subtitle: 'چیدمان، متریال و نور در یک روایت',
    icon: 'luxina-iconpencil-ruler-2-fill',
    image: '/img/service-image2.png',
    slug: 'interior-design',
  },
];

const TRACK_STYLE = {
  '--desktop-cols': 2,
  '--desktop-gap': '16px',
  '--tablet-cols': 2,
  '--tablet-gap': '12px',
  '--mobile-cols': 2,
  '--mobile-gap': '12px',
};

export default function ServicesSection() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      root.querySelectorAll('.luxina_services_item').forEach((item) => {
        const content = item.querySelector('.luxina_services_item-subtitle-content');
        if (content) item.style.setProperty('--subtitle-height', `${content.offsetHeight}px`);
      });
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <section className="hp-section hp-services">
      <div className="hp-inner">
        <div className="luxina_services_container" ref={rootRef}>
          <div className="luxina_services_title-wrap">
            <div className="luxina_services_title_bg-wrap" aria-hidden="true">
              <svg width="184" height="201" viewBox="0 0 184 201" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="hp-services-stroke" x1="92" y1="42.5" x2="92" y2="201" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fff" stopOpacity="0" />
                    <stop offset="1" stopColor="#fff" />
                  </linearGradient>
                </defs>
                <path
                  d="M16.0596 0.5L167.94 0.5C177.575 0.5 184.875 9.19601 183.206 18.6846L153.485 187.685C152.182 195.095 145.744 200.5 138.22 200.5L45.7803 200.5C38.2557 200.5 31.818 195.095 30.5146 187.685L0.793945 18.6846C-0.874695 9.19602 6.4254 0.5 16.0596 0.5Z"
                  fill="#fff"
                  fillOpacity="0.2"
                  stroke="url(#hp-services-stroke)"
                />
              </svg>
            </div>
            <i className="luxina-icon-pencil-ruler-fill luxina_services_title-icon" aria-hidden="true" />
            <span className="luxina_services_title-text">خدمات</span>
            <span className="luxina_services_title-subtitle">Services</span>
          </div>

          <div
            className="luxina-slider-wrap luxina_services_container_inner desktop-columns-wrap tablet-columns-wrap mobile-columns-wrap"
            style={TRACK_STYLE}
          >
            <div className="luxina-slider-arrows">
              <button type="button" className="button button-start rounded button-gray small luxina-slider-nav-btn luxina-slider-nav-prev swiper-button-prev" aria-label="خدمات قبلی">
                <i className="luxina-icon-arrow-right-line button-icon" aria-hidden="true" />
              </button>
              <button type="button" className="button button-start rounded button-gray small luxina-slider-nav-btn luxina-slider-nav-next swiper-button-next" aria-label="خدمات بعدی">
                <i className="luxina-icon-arrow-left-line button-icon" aria-hidden="true" />
              </button>
            </div>

            <div className="wrapper luxina_services_wrap desktop-columns desktop-columns-2 desktop-display-grid tablet-columns tablet-columns-2 tablet-display-grid mobile-columns mobile-columns-2 mobile-display-grid">
              {SERVICES.map((service) => (
                <a
                  className="luxina_services_item-wrapper slider-slide"
                  href={`/services/${service.slug}`}
                  key={service.title}
                  aria-label={`${service.title} — مشاهدهٔ صفحهٔ خدمت`}
                >
                  <div
                    className="luxina_services_item"
                    style={{ backgroundImage: `url(${service.image})` }}
                  >
                    <div className="luxina_services_item-title-wrap">
                      <i className={`luxinaicon ${service.icon} luxina_services_item-icon`} aria-hidden="true" />
                      <span className="luxina_services_item-title">{service.title}</span>
                    </div>

                    <div className="luxina_services_item-subtitle-wrap">
                      <div className="luxina_services_item-subtitle-arrow-wrap" aria-hidden="true">
                        <div className="luxina_pro_icon_container direction-up">
                          <span className="luxina_pro_icon_bg-wrap" />
                          <i className="luxina-icon-arrow-up-line luxina_services_item-subtitle-arrow luxina_pro_icon" />
                        </div>
                      </div>
                      <div className="luxina_services_item-subtitle-content">
                        <span className="luxina_services_item-subtitle-bg" aria-hidden="true" />
                        <span className="luxina_services_item-subtitle">{service.subtitle}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
