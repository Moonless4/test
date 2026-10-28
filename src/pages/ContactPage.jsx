import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import RequestForm from '../components/RequestForm.jsx';
import PageMeta from '../components/PageMeta.jsx';
import { site } from '../content/site.js';

// The contact cards and the form copy are filled from the admin panel.
export default function ContactPage() {
  const { contact, pages } = site;
  const page = pages?.contact || {};
  const cards = [
    { icon: 'luxina-icon-map-pin-2-fill', label: 'آدرس', value: contact.address },
    { icon: 'luxina-icon-customer-service-2-line', label: 'تلفن', value: contact.phone, ltr: true },
    { icon: 'luxina-icon-mail-fill', label: 'ایمیل', value: contact.email, ltr: true },
  ].filter((item) => item.value);

  return (
    <>
      <PageMeta title={page.seoTitle} description={page.seoDescription} path="/contact" />
      <PageSection>
        <PageHeading
          title={page.title || 'تماس با ما'}
          subtitle={page.subtitle || 'Contact us'}
          icon={page.icon || 'luxina-icon-question-answer-fill'}
        />
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
          messagePlaceholder={page.formMessagePlaceholder || 'دربارهٔ پروژه یا فضای خود بنویسید'}
          submit={page.submitLabel || 'ارسال پیام'}
          note={page.formNote || 'پیام شما ثبت شد. در اولین فرصت کاری پاسخ می‌دهیم.'}
        />
      </PageSection>
    </>
  );
}
