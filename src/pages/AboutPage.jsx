import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import Button from '../components/Button.jsx';
import TeamBand from '../components/TeamBand.jsx';
import Faq from '../components/Faq.jsx';

const STATS = [
  { value: '۱۵+', label: 'سال تجربهٔ اجرایی' },
  { value: '۱۲۰+', label: 'پروژهٔ تحویل‌شده' },
  { value: '۹۵٪', label: 'رضایت کارفرمایان' },
];

export default function AboutPage() {
  return (
    <>
      <PageSection>
        <PageHeading title="درباره ما" subtitle="About us" icon="luxina-icon-building-line" />
        <div className="rb-about">
          <p className="rb-service-intro">
            لوکسینا یک استودیوی طراحی و اجراست؛ در طراحی داخلی، طراحی نقشه، بازسازی خانه‌های قدیمی و ساخت پروژه‌های
            لوکس.
          </p>
          <p className="rb-detail-text">
            کار از شناخت سبک زندگی کارفرما شروع می‌شود و با برنامهٔ شفاف، انتخاب متریال و نظارت مستمر تا تحویل کلید
            ادامه پیدا می‌کند. معمار، مهندس سازه و مدیر اجرا در یک تیم کار می‌کنند و تصمیم‌ها روی یک مدل مشترک گرفته
            می‌شود. معیار ما ساده است: فضایی که سال‌ها بعد هم درست به نظر برسد و درست کار کند.
          </p>
          <div className="rb-about-stats">
            {STATS.map((stat) => (
              <div className="rb-about-stat" key={stat.label}>
                <span className="rb-about-stat-value">{stat.value}</span>
                <span className="rb-about-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="rb-detail-actions">
            <Button href="/consultation" variant="primary">
              دریافت مشاوره
            </Button>
            <Button href="/projects" variant="gray">
              مشاهدهٔ پروژه‌ها
            </Button>
          </div>
        </div>
      </PageSection>
      <TeamBand />
      <Faq />
    </>
  );
}
