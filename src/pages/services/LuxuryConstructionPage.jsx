import { useState } from 'react';
import ServiceHero from '../../components/services/ServiceHero.jsx';
import ServiceIntro from '../../components/services/ServiceIntro.jsx';
import SectionHead from '../../components/services/SectionHead.jsx';
import ConstructionStages from '../../components/services/ConstructionStages.jsx';
import FeatureList from '../../components/services/FeatureList.jsx';
import StatsBand from '../../components/services/StatsBand.jsx';
import ProjectStrip from '../../components/services/ProjectStrip.jsx';
import RelatedServices from '../../components/services/RelatedServices.jsx';
import ServiceCta from '../../components/services/ServiceCta.jsx';
import Lightbox from '../../components/Lightbox.jsx';
import { luxuryConstruction } from '../../content/service-pages.js';

export default function LuxuryConstructionPage() {
  const data = luxuryConstruction;
  const [lightbox, setLightbox] = useState(null);

  return (
    <>
      <ServiceHero service={data} />

      <section className="sp-band" id="service-content">
        <div className="sp-container">
          <ServiceIntro intro={data.intro} reverse extraImage="/img/services/lux-interior.jpg" />
        </div>
      </section>

      <section className="sp-band sp-band-deep">
        <div className="sp-container">
          <SectionHead
            kicker="پیشرفت پروژه"
            title="هشت مرحله، از کانسپت تا تحویل کلید"
            text="مرحله را انتخاب کنید تا تصویر، شرح فنی و خروجی همان بخش را ببینید."
          />
          <ConstructionStages stages={data.stages} />
        </div>
      </section>

      <section className="sp-band sp-band-soft">
        <div className="sp-container">
          <SectionHead
            kicker={data.gallery.title}
            title="معماری در جزئیات دیده می‌شود"
            text={data.gallery.text}
          />
          <div className="sp-gallery">
            {data.gallery.items.map((item, index) => (
              <button
                type="button"
                key={item.src + item.label}
                className={`sp-gallery-item sp-gallery-item-${index + 1}`}
                onClick={() => setLightbox(item.src)}
                aria-label={`بزرگ‌نمایش ${item.label}`}
              >
                <img src={item.src} alt={item.label} loading="lazy" width="1200" height="900" />
                <span className="sp-gallery-label">{item.label}</span>
                <span className="sp-gallery-zoom" aria-hidden="true">
                  <i className="luxinaicon luxina-icon-zoom-in-line" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-band">
        <div className="sp-container">
          <SectionHead kicker="کنترل و اجرا" title="چهار ضمانت اجرایی در پروژه‌های لوکس" />
          <FeatureList items={data.capabilities} />
          <StatsBand stats={data.stats} tone="dark" />
        </div>
      </section>

      <section className="sp-band sp-band-soft">
        <div className="sp-container">
          <SectionHead kicker="نمونه‌کارها" title="پروژه‌های شاخص ساخت" />
          <ProjectStrip projects={data.projects} />
        </div>
      </section>

      <section className="sp-band">
        <div className="sp-container">
          <SectionHead kicker="خدمات مرتبط" title="سه خدمت مکمل ساخت" />
          <RelatedServices slug={data.slug} />
        </div>
      </section>

      <section className="sp-band sp-band-cta">
        <div className="sp-container">
          <ServiceCta
            image="/img/services/lux-gallery-2.jpg"
            title="پروژهٔ لوکس خود را با ما بسازید"
            text="پیش از هر قراردادی، یک جلسهٔ امکان‌سنجی برگزار می‌کنیم: زمین، بودجه، برنامهٔ زمانی و سطح کیفیت."
          />
        </div>
      </section>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}
