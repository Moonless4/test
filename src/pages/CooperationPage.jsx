import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import RequestForm from '../components/RequestForm.jsx';
import TeamBand from '../components/TeamBand.jsx';
import PageMeta from '../components/PageMeta.jsx';
import { site } from '../content/site.js';

export default function CooperationPage() {
  const page = site.pages?.cooperation || {};

  return (
    <>
      <PageMeta title={page.seoTitle} description={page.seoDescription} path="/cooperation" />
      <PageSection>
        <PageHeading
          title={page.title || 'فرصت همکاری'}
          subtitle={page.subtitle || 'Cooperation'}
          icon={page.icon || 'luxina-icon-team-fill'}
        />
        <RequestForm
          type="cooperation"
          messagePlaceholder={page.messagePlaceholder || 'تجربه و زمینهٔ همکاری خود را بنویسید'}
          submit={page.submitLabel || 'ارسال درخواست'}
          note={page.formNote || 'درخواست همکاری ثبت شد؛ در صورت تطابق با فرصت‌های موجود تماس می‌گیریم.'}
        />
      </PageSection>
      <TeamBand />
    </>
  );
}
