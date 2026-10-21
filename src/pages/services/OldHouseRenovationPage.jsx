import ServiceHero from '../../components/services/ServiceHero.jsx';
import ServiceIntro from '../../components/services/ServiceIntro.jsx';
import SectionHead from '../../components/services/SectionHead.jsx';
import RenovationTimeline from '../../components/services/RenovationTimeline.jsx';
import FeatureList from '../../components/services/FeatureList.jsx';
import StatsBand from '../../components/services/StatsBand.jsx';
import ProjectStrip from '../../components/services/ProjectStrip.jsx';
import RelatedServices from '../../components/services/RelatedServices.jsx';
import ServiceCta from '../../components/services/ServiceCta.jsx';
import { oldHouseRenovation } from '../../content/service-pages.js';

export default function OldHouseRenovationPage() {
  const data = oldHouseRenovation;

  return (
    <>
      <ServiceHero service={data} />

      <section className="sp-band" id="service-content">
        <div className="sp-container">
          <ServiceIntro intro={data.intro} />
        </div>
      </section>

      <section className="sp-band sp-band-soft">
        <div className="sp-container">
          <SectionHead
            kicker="از بررسی تا تحویل"
            title="هشت مرحلهٔ بازسازی یک خانۀ قدیمی"
            text="ترتیب تصمیم‌گیری در یک بازسازی: از بررسی و آسیب‌شناسی تا تحویل نهایی."
          />
          <FeatureList items={data.survey} />
        </div>
      </section>

      <section className="sp-band sp-band-reno">
        <div className="sp-container">
          <SectionHead kicker={data.timeline.kicker} title={data.timeline.title} text={data.timeline.text} />
          <RenovationTimeline states={data.timeline.states} stages={data.timeline.stages} />
        </div>
      </section>

      <section className="sp-band">
        <div className="sp-container">
          <StatsBand stats={data.stats} />
          <SectionHead kicker="نمونه‌کارها" title="خانه‌هایی که دوباره قابل زندگی شدند" />
          <ProjectStrip projects={data.projects} />
        </div>
      </section>

      <section className="sp-band sp-band-soft">
        <div className="sp-container">
          <SectionHead kicker="خدمات مرتبط" title="بازسازی، ساخت یا طراحی داخلی؟" />
          <RelatedServices slug={data.slug} />
        </div>
      </section>

      <section className="sp-band sp-band-cta">
        <div className="sp-container">
          <ServiceCta
            image="/img/services/reno-courtyard.jpg"
            title="خانۀ قدیمی‌تان را از دست ندهید"
            text="پیش از تصمیم به تخریب یا تغییر، وضعیت سازه و ارزش معماری بنا را بررسی می‌کنیم."
          />
        </div>
      </section>
    </>
  );
}
