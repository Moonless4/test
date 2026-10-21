import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import Button from '../components/Button.jsx';

export default function NotFoundPage() {
  return (
    <PageSection>
      <PageHeading title="صفحه پیدا نشد" subtitle="Page not found" icon="luxina-icon-error-warning-fill" />
      <p className="rb-empty">صفحه‌ای که به دنبال آن هستید وجود ندارد یا جابه‌جا شده است.</p>
      <div className="rb-detail-actions">
        <Button href="/" variant="primary">
          بازگشت به خانه
        </Button>
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
    </PageSection>
  );
}
