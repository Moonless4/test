import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import RequestForm from '../components/RequestForm.jsx';
import { site } from '../content/site.js';

// The contact cards are filled from the admin panel's contact settings.
export default function ContactPage() {
  const { contact } = site;
  const cards = [
    { icon: 'luxina-icon-map-pin-2-fill', label: 'آدرس', value: contact.address },
    { icon: 'luxina-icon-customer-service-2-line', label: 'تلفن', value: contact.phone, ltr: true },
    { icon: 'luxina-icon-mail-fill', label: 'ایمیل', value: contact.email, ltr: true },
  ].filter((item) => item.value);

  return (
    <PageSection>
      <PageHeading title="تماس با ما" subtitle="Contact us" icon="luxina-icon-question-answer-fill" />
      <div className="rb-contact-info">
        {cards.map((item) => (
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
        messagePlaceholder="دربارهٔ پروژه یا فضای خود بنویسید"
        submit="ارسال پیام"
        note="پیام شما ثبت شد. در اولین فرصت کاری پاسخ می‌دهیم."
      />
    </PageSection>
  );
}
