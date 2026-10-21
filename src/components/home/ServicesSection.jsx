import { Link } from 'react-router-dom';
import SectionHead from '../services/SectionHead.jsx';
import StatsBand from '../services/StatsBand.jsx';

// The four studio services, presented as editorial rows. Each row links to the
// service detail page that carries the full narrative.
const SERVICES = [
  {
    title: 'طراحی نقشه و پروتوتایپ',
    subtitle: 'Architecture plans',
    text: 'اجرای صفر تا ۱۰۰ طراحی معماری و سازه؛ از پلان و نما تا نقشه‌های اجرایی منطبق بر ضوابط.',
    image: '/img/service-image1.png',
    slug: 'architecture-plans',
  },
  {
    title: 'ساخت و اجرای پروژه‌های لوکس',
    subtitle: 'Luxury construction',
    text: 'اجرای صفر تا صد پروژه‌های مسکونی لوکس با مدیریت یکپارچهٔ زمان، هزینه و کیفیت.',
    image: '/img/service-image2.png',
    slug: 'luxury-construction',
  },
  {
    title: 'بازسازی خانه‌های قدیمی',
    subtitle: 'Renovation',
    text: 'بازسازی و نوسازی با تمرکز بر بهبود عملکرد فضا و تأسیسات، بدون آسیب به سازهٔ اصلی.',
    image: '/img/service-image4.png',
    slug: 'old-house-renovation',
  },
  {
    title: 'طراحی داخلی و دکوراسیون',
    subtitle: 'Interior design',
    text: 'اجرای صفر تا صد دکوراسیون و نمای داخلی؛ چیدمان، متریال، نور و مبلمان در یک روایت منسجم.',
    image: '/img/service-image2.png',
    slug: 'interior-design',
  },
];

const STATS = [
  { value: '۱۵+', label: 'سال تجربهٔ اجرایی' },
  { value: '۱۲۰+', label: 'پروژهٔ تحویل‌شده' },
  { value: '۹۵٪', label: 'رضایت کارفرمایان' },
  { value: '۲۵', label: 'طبقه در بلندترین پروژه' },
];

export default function ServicesSection() {
  return (
    <section className="hp-band hp-band--sand" id="services">
      <div className="hp-inner">
        <SectionHead
          kicker="خدمات لوکسینا"
          title="از ایدهٔ اولیه تا تحویل کلید"
          text="چهار مسیر تخصصی که در کنار هم یک پروژهٔ کامل را می‌سازند؛ هر مسیر تیم، فرایند و خروجی مشخص خود را دارد."
        />

        <div className="ed-service-rows">
          {SERVICES.map((service, index) => (
            <Link className="ed-service-row" to={`/services/${service.slug}`} key={service.title} data-reveal>
              <span className="ed-service-row-no">{String(index + 1).padStart(2, '۰')}</span>
              <h3 className="ed-service-row-title">
                {service.title}
                <span className="ed-service-row-sub">{service.subtitle}</span>
              </h3>
              <p className="ed-service-row-text">{service.text}</p>
              <figure className="ed-service-row-media">
                <img src={service.image} alt="" loading="lazy" width="900" height="560" />
              </figure>
            </Link>
          ))}
        </div>

        <div className="hp-stats-wrap">
          <StatsBand stats={STATS} />
        </div>
      </div>
    </section>
  );
}
