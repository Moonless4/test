import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import RequestForm from '../components/RequestForm.jsx';

const CONTACT = [
  {
    icon: 'luxina-icon-map-pin-2-fill',
    label: 'آدرس',
    value: 'تهران، خیابان اسکندری، کوچه ۱۶ مهربان',
  },
  {
    icon: 'luxina-icon-customer-service-2-line',
    label: 'تلفن',
    value: '021-123 4567',
    ltr: true,
  },
  {
    icon: 'luxina-icon-mail-fill',
    label: 'ایمیل',
    value: 'info@archilux.ir',
    ltr: true,
  },
];

export default function ContactPage() {
  return (
    <PageSection>
      <PageHeading title="تماس با ما" subtitle="Contact us" icon="luxina-icon-question-answer-fill" />
      <div className="rb-contact-info">
        {CONTACT.map((item) => (
          <div className="rb-contact-card" key={item.label}>
            <i className={`luxinaicon ${item.icon}`} aria-hidden="true" />
            <span className="rb-contact-label">{item.label}</span>
            <span className="rb-contact-value" dir={item.ltr ? 'ltr' : undefined}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
      <RequestForm
        type="contact"
        messagePlaceholder="متن پیام شما"
        submit="ارسال پیام"
        note="پیام شما ثبت شد؛ کارشناسان ما در اولین فرصت پاسخ می‌دهند."
      />
    </PageSection>
  );
}
