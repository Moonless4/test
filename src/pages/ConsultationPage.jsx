import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import RequestForm from '../components/RequestForm.jsx';
import PageMeta from '../components/PageMeta.jsx';
import { site } from '../content/site.js';

export default function ConsultationPage() {
  const page = site.pages?.consultation || {};

  return (
    <>
      <PageMeta title={page.seoTitle} description={page.seoDescription} path="/consultation" />
      <PageSection>
        <PageHeading
          title={page.title || 'درخواست مشاوره'}
          subtitle={page.subtitle || 'Consultation request'}
          icon={page.icon || 'luxina-icon-customer-service-2-line'}
        />
        <RequestForm
          type="consultation"
          messagePlaceholder={page.messagePlaceholder || 'دربارهٔ پروژه، متراژ و زمان‌بندی مورد نظرتان بنویسید'}
          submit={page.submitLabel || 'ثبت درخواست'}
          note={page.formNote || 'درخواست شما ثبت شد؛ برای هماهنگی جلسه تماس می‌گیریم.'}
        />
      </PageSection>
    </>
  );
}
