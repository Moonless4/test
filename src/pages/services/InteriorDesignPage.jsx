import ServiceHero from '../../components/services/ServiceHero.jsx';
import ServiceIntro from '../../components/services/ServiceIntro.jsx';
import SectionHead from '../../components/services/SectionHead.jsx';
import BeforeAfterSlider from '../../components/services/BeforeAfterSlider.jsx';
import ProcessRail from '../../components/services/ProcessRail.jsx';
import FeatureList from '../../components/services/FeatureList.jsx';
import StatsBand from '../../components/services/StatsBand.jsx';
import ProjectStrip from '../../components/services/ProjectStrip.jsx';
import RelatedServices from '../../components/services/RelatedServices.jsx';
import ServiceCta from '../../components/services/ServiceCta.jsx';
import { interiorDesign } from '../../content/service-pages.js';

export default function InteriorDesignPage() {
  const data = interiorDesign;

  return (
    <>
      <ServiceHero service={data} />

      <section className="sp-band" id="service-content">
        <div className="sp-container">
          <ServiceIntro intro={data.intro} extraImage={data.intro.image} />
        </div>
      </section>

      <section className="sp-band sp-band-soft">
        <div className="sp-container">
          <SectionHead
            kicker="مقایسهٔ قبل و بعد"
            title={data.beforeAfter.title}
            text={data.beforeAfter.text}
          />
          <BeforeAfterSlider
            before={data.beforeAfter.before}
            after={data.beforeAfter.after}
            beforeLabel={data.beforeAfter.beforeLabel}
            afterLabel={data.beforeAfter.afterLabel}
            caption={data.beforeAfter.caption}
            meta={data.beforeAfter.meta}
          />
        </div>
      </section>

      <section className="sp-band">
        <div className="sp-container">
          <SectionHead
            kicker="پروژه‌های منتخب"
            title="سه فضا، سه دگرگونی"
            text="وضعیت پیش از طراحی در سمت راست، نتیجهٔ اجراشده در سمت چپ."
          />
          <div className="sp-ba-grid">
            {data.beforeAfterProjects.map((project, index) => (
              <article className="sp-ba-card" key={project.title}>
                <BeforeAfterSlider
                  variant="mini"
                  before={project.before}
                  after={project.after}
                  initial={[58, 46, 62][index]}
                  caption={project.title}
                  meta={project.tag}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-band sp-band-soft">
        <div className="sp-container">
          <SectionHead
            kicker="فرایند طراحی"
            title="هفت گام تا خانۀ نهایی"
            text="هر گام خروجی مشخصی دارد و تا تأیید کارفرما، مرحلهٔ بعد آغاز نمی‌شود."
          />
          <ProcessRail steps={data.process} />
        </div>
      </section>

      <section className="sp-band">
        <div className="sp-container">
          <SectionHead kicker="توانمندی‌ها" title="آنچه در طراحی داخلی به ما می‌سپارید" />
          <FeatureList items={data.capabilities} />
          <StatsBand stats={data.stats} />
        </div>
      </section>

      <section className="sp-band sp-band-soft">
        <div className="sp-container">
          <SectionHead kicker="نمونه‌کارها" title="پروژه‌های طراحی داخلی" />
          <ProjectStrip projects={data.projects} />
        </div>
      </section>

      <section className="sp-band">
        <div className="sp-container">
          <SectionHead kicker="خدمات مرتبط" title="از فضای داخلی تا نقشه و اجرا" />
          <RelatedServices slug={data.slug} />
        </div>
      </section>

      <section className="sp-band sp-band-cta">
        <div className="sp-container">
          <ServiceCta
            image={data.image}
            title="برای فضای خود با ما صحبت کنید"
            text="در یک جلسهٔ مشاوره، نیازها، متراژ و بازهٔ بودجه را مرور می‌کنیم و مسیر پیشنهادی را توضیح می‌دهیم."
          />
        </div>
      </section>
    </>
  );
}
