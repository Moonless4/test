import { Link } from 'react-router-dom';
import PageHero from '../components/editorial/PageHero.jsx';
import Band from '../components/editorial/Band.jsx';
import SectionHead from '../components/services/SectionHead.jsx';
import ServiceCta from '../components/services/ServiceCta.jsx';
import StatsBand from '../components/services/StatsBand.jsx';
import { services as plainServices } from '../content/services.js';
import {
  SERVICE_LINKS,
  interiorDesign,
  oldHouseRenovation,
  luxuryConstruction,
  architecturePlans,
} from '../content/service-pages.js';

const DETAIL = {
  'interior-design': interiorDesign,
  'old-house-renovation': oldHouseRenovation,
  'luxury-construction': luxuryConstruction,
  'architecture-plans': architecturePlans,
};

const STATS = [
  { value: '۴', label: 'مسیر تخصصی خدمات' },
  { value: '۱۵+', label: 'سال تجربه' },
  { value: '۱۲۰+', label: 'پروژهٔ اجراشده' },
  { value: '۹۵٪', label: 'رضایت کارفرما' },
];

// Services overview: the four flagship services as editorial rows that lead
// into their detail pages, then the secondary services of the footer menu.
export default function ServicesPage() {
  return (
    <div className="ed-page">
      <PageHero
        image="/img/services/plans-hero.jpg"
        eyebrow="خدمات لوکسینا"
        icon="luxina-icon-pencil-ruler-2-fill"
        title="خدماتی که یک پروژه را کامل می‌کنند"
        lead="از طراحی نقشه تا تحویل کلید، هر بخش از پروژه یک مسیر تخصصی با تیم، فرایند و خروجی مشخص است."
        breadcrumbs={[{ href: '/', label: 'خانه' }, { label: 'خدمات' }]}
        facts={[
          { label: 'دامنهٔ کار', value: 'طراحی تا اجرا' },
          { label: 'نوع قرارداد', value: 'طراحی یا کلید در دست' },
          { label: 'موقعیت', value: 'تهران' },
        ]}
        actions={[
          { label: 'درخواست مشاوره', href: '/consultation' },
          { label: 'دیدن پروژه‌ها', href: '/projects' },
        ]}
      />

      <Band tone="soft">
        <SectionHead
          kicker="مسیرهای تخصصی"
          title="چهار خدمت اصلی لوکسینا"
          text="هر خدمت صفحهٔ اختصاصی خود را دارد: فرایند کار، نمونه‌کارها و پاسخ پرسش‌های رایج."
        />

        <div className="ed-service-rows">
          {SERVICE_LINKS.map((service, index) => {
            const detail = DETAIL[service.slug];
            return (
              <Link
                className="ed-service-row"
                to={`/services/${service.slug}`}
                key={service.slug}
                data-reveal
                style={{ '--reveal-delay': `${index * 60}ms` }}
              >
                <span className="ed-service-row-no">{String(index + 1).padStart(2, '۰')}</span>
                <h2 className="ed-service-row-title">
                  {service.title}
                  <span className="ed-service-row-sub">{service.subtitle}</span>
                </h2>
                <p className="ed-service-row-text">{detail?.lead}</p>
                <figure className="ed-service-row-media">
                  <img src={service.image} alt="" loading="lazy" width="900" height="560" />
                </figure>
              </Link>
            );
          })}
        </div>

        <StatsBand stats={STATS} />
      </Band>

      <Band>
        <SectionHead
          kicker="خدمات تکمیلی"
          title="پشتیبانی تخصصی در طول پروژه"
          text="این خدمت‌ها در کنار مسیر اصلی پروژه ارائه می‌شوند و بسته به نیاز کارفرما انتخاب می‌شوند."
        />
        <div className="ed-mini-services">
          {plainServices.map((service, index) => (
            <Link
              className="ed-mini-card"
              to={`/services/${service.slug}`}
              key={service.slug}
              data-reveal
              style={{ '--reveal-delay': `${index * 50}ms` }}
            >
              <span className="ed-mini-card-icon">
                <i className={`luxinaicon ${service.icon}`} aria-hidden="true" />
              </span>
              <h3 className="ed-mini-card-title">{service.title}</h3>
              <p className="ed-mini-card-text">{service.intro}</p>
              <span className="ed-mini-card-more">
                مشاهدهٔ خدمت
                <i className="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </Band>

      <Band>
        <ServiceCta
          image="/img/services/lux-hero.jpg"
          title="برای پروژه‌تان مسیر درست را پیدا کنیم"
          text="در جلسهٔ مشاوره، محدودهٔ پروژه، متراژ، بازهٔ بودجه و زمان‌بندی را بررسی می‌کنیم و خدمت مناسب را پیشنهاد می‌دهیم."
        />
      </Band>
    </div>
  );
}
