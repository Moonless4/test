import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import RequestForm from '../components/RequestForm.jsx';

export default function ConsultationPage() {
  return (
    <PageSection>
      <PageHeading title="درخواست مشاوره" subtitle="Consultation request" icon="luxina-icon-customer-service-2-line" />
      <RequestForm
        type="consultation"
        messagePlaceholder="دربارهٔ پروژه، متراژ و زمان‌بندی مورد نظرتان بنویسید"
        submit="ثبت درخواست"
        note="درخواست شما ثبت شد؛ برای هماهنگی جلسه تماس می‌گیریم."
      />
    </PageSection>
  );
}
