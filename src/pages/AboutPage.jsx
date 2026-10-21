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
            ما در لوکسینا با افتخار هنر و تخصص خود را در خدمت ساخت و ساز، انبوه‌سازی، بازسازی خانه‌های قدیمی و طراحی
            خانه‌های لوکس قرار داده‌ایم. هدف ما خلق فضاهایی است که نه تنها نیازهای عملکردی را برآورده کنند، بلکه
            الهام‌بخش زندگی مدرن و سبک زندگی منحصر به فرد شما باشند.
          </p>
          <p className="rb-detail-text">
            تیم ما از معماران، مهندسان سازه و مدیران اجرایی تشکیل شده است که از مرحلهٔ ایده تا تحویل کلید در کنار شما
            هستند. هر پروژه با شناخت دقیق نیاز کارفرما آغاز می‌شود و با برنامه‌ریزی شفاف، انتخاب متریال مناسب و نظارت
            مستمر به پایان می‌رسد.
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
              درخواست مشاوره
            </Button>
            <Button href="/projects" variant="gray">
              مشاهده پروژه‌ها
            </Button>
          </div>
        </div>
      </PageSection>
      <TeamBand />
      <Faq />
    </>
  );
}
