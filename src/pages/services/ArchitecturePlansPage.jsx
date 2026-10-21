import ServiceHero from '../../components/services/ServiceHero.jsx';
import ServiceIntro from '../../components/services/ServiceIntro.jsx';
import SectionHead from '../../components/services/SectionHead.jsx';
import FeatureList from '../../components/services/FeatureList.jsx';
import PlanViewer from '../../components/services/PlanViewer.jsx';
import StatsBand from '../../components/services/StatsBand.jsx';
import ProjectStrip from '../../components/services/ProjectStrip.jsx';
import RelatedServices from '../../components/services/RelatedServices.jsx';
import ServiceCta from '../../components/services/ServiceCta.jsx';
import { architecturePlans } from '../../content/service-pages.js';

export default function ArchitecturePlansPage() {
  const data = architecturePlans;

  return (
    <>
      <ServiceHero service={data} />

      <section className="sp-band" id="service-content">
        <div className="sp-container">
          <ServiceIntro intro={data.intro} />
        </div>
      </section>

      <section className="sp-band sp-band-plans">
        <div className="sp-container">
          <SectionHead
            kicker={data.viewer.kicker}
            title={data.viewer.title}
            text={data.viewer.text}
          />
          <PlanViewer viewer={data.viewer} />
        </div>
      </section>

      <section className="sp-band sp-band-soft">
        <div className="sp-container">
          <SectionHead
            kicker="فرایند طراحی"
            title="هشت گام از ایده تا پروتوتایپ"
            text="از تحلیل سایت تا برد ارائه؛ هر گام یک خروجی قابل بررسی دارد و مبنای گام بعدی است."
          />
          <FeatureList items={data.stages} />
        </div>
      </section>

      <section className="sp-band">
        <div className="sp-container">
          <div className="sp-deliverables">
            <div className="sp-deliverables-body">
              <SectionHead kicker="بستهٔ تحویل" title="دقیقاً چه چیزی دریافت می‌کنید؟" />
              <ul className="sp-deliverables-list">
                {data.deliverables.map((item) => (
                  <li key={item}>
                    <i className="luxinaicon luxina-icon-check-line" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <figure className="sp-deliverables-media">
              <img src="/img/services/plans-detail.jpg" alt="جزئیات نقشهٔ معماری" loading="lazy" width="900" height="1120" />
            </figure>
          </div>
          <StatsBand stats={data.stats} />
        </div>
      </section>

      <section className="sp-band sp-band-soft">
        <div className="sp-container">
          <SectionHead kicker="نمونه‌کارها" title="نقشه‌هایی که ساخته شدند" />
          <ProjectStrip projects={data.projects} />
        </div>
      </section>

      <section className="sp-band">
        <div className="sp-container">
          <SectionHead kicker="خدمات مرتبط" title="ادامهٔ مسیر با لوکسینا" />
          <RelatedServices slug={data.slug} />
        </div>
      </section>

      <section className="sp-band sp-band-cta">
        <div className="sp-container">
          <ServiceCta
            image="/img/services/plans-technical.jpg"
            title="پلان پروژهٔ خود را با ما شروع کنید"
            text="اگر زمین یا بنای موجودی دارید و می‌خواهید بدانید چه چیزی می‌توان از آن ساخت، جلسهٔ بررسی سایت و امکان‌سنجی اولین قدم است."
          />
        </div>
      </section>
    </>
  );
}
