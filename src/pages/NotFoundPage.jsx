import PageHero from '../components/editorial/PageHero.jsx';
import Band from '../components/editorial/Band.jsx';
import Button from '../components/Button.jsx';

// 404. It keeps the site's hero language so a wrong link still feels like the
// same website, and offers the main routes back.
export default function NotFoundPage() {
  return (
    <div className="ed-page">
      <PageHero
        tone="paper"
        eyebrow="خطای ۴۰۴"
        icon="luxina-icon-question-mark"
        title="این صفحه پیدا نشد"
        lead="نشانی واردشده وجود ندارد یا جابه‌جا شده است. از مسیرهای زیر می‌توانید ادامه دهید."
        breadcrumbs={[{ href: '/', label: 'خانه' }, { label: 'صفحه پیدا نشد' }]}
        size="compact"
      />

      <Band tone="soft">
        <div className="ed-notfound">
          <span className="ed-notfound-code" aria-hidden="true">
            404
          </span>
          <h2 className="ed-notfound-title">شاید نشانی تغییر کرده باشد</h2>
          <p className="ed-notfound-text">
            اگر از یک لینک قدیمی به این صفحه رسیده‌اید، از منوی سایت مسیر درست را انتخاب کنید یا مستقیم با ما تماس
            بگیرید.
          </p>
          <div className="rb-detail-actions">
            <Button href="/">بازگشت به خانه</Button>
            <Button href="/projects" variant="gray">
              پروژه‌ها
            </Button>
            <Button href="/blog" variant="gray">
              مقالات
            </Button>
            <Button href="/contact" variant="gray">
              تماس با ما
            </Button>
          </div>
        </div>
      </Band>
    </div>
  );
}
