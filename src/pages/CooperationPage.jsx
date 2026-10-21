import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import RequestForm from '../components/RequestForm.jsx';
import TeamBand from '../components/TeamBand.jsx';

export default function CooperationPage() {
  return (
    <>
      <PageSection>
        <PageHeading title="فرصت همکاری" subtitle="Cooperation" icon="luxina-icon-team-fill" />
        <RequestForm
          type="cooperation"
          messagePlaceholder="زمینه همکاری"
          submit="ارسال درخواست"
          note="درخواست همکاری شما ثبت شد؛ در صورت تطابق با فرصت‌های موجود تماس می‌گیریم."
        />
      </PageSection>
      <TeamBand />
    </>
  );
}
