import PageHero from '../components/editorial/PageHero.jsx';
import Band from '../components/editorial/Band.jsx';
import SectionHead from '../components/services/SectionHead.jsx';
import RequestForm from '../components/RequestForm.jsx';
import { SERVICE_CONTACT } from '../content/service-pages.js';

const CONTACT = [
  {
    icon: 'luxina-icon-map-pin-2-fill',
    label: 'آدرس دفتر',
    value: SERVICE_CONTACT.address,
  },
  {
    icon: 'luxina-icon-customer-service-2-line',
    label: 'تلفن',
    value: '021-123 4567',
    href: SERVICE_CONTACT.phoneHref,
    ltr: true,
  },
  {
    icon: 'luxina-icon-mail-fill',
    label: 'ایمیل',
    value: 'info@archilux.ir',
    href: 'mailto:info@archilux.ir',
    ltr: true,
  },
];

const SOCIAL = [
  { icon: 'luxina-icon-instagram-fill', label: 'اینستاگرام', value: 'archilux.ir', href: 'https://archilux.ir' },
  { icon: 'luxina-icon-telegram-2-fill', label: 'تلگرام', value: 'archilux.ir', href: 'https://archilux.ir' },
];

// Contact: office details on one side, the inquiry form on the other, plus the
// direct channels and the location note.
export default function ContactPage() {
  return (
    <div className="ed-page">
      <PageHero
        image="/img/services/interior-detail.jpg"
        eyebrow="ارتباط با لوکسینا"
        icon="luxina-icon-question-answer-fill"
        title="تماس با ما"
        lead="برای شروع یک پروژه، بازدید از ملک یا حتی یک پرسش کوتاه دربارهٔ هزینه‌ها، از همین‌جا با ما در ارتباط باشید."
        breadcrumbs={[{ href: '/', label: 'خانه' }, { label: 'تماس با ما' }]}
        size="compact"
        facts={[
          { label: 'پاسخ‌گویی', value: 'شنبه تا پنجشنبه' },
          { label: 'ساعت کاری', value: '۹ تا ۱۸' },
          { label: 'زمان پاسخ', value: 'حداکثر ۲۴ ساعت' },
        ]}
      />

      <Band tone="soft">
        <div className="ed-contact">
          <div className="ed-contact-info">
            <SectionHead
              kicker="راه‌های ارتباطی"
              title="هر کدام از این مسیرها را که راحت‌تر است"
              text="برای هماهنگی جلسه، بازدید پروژه یا ارسال نقشه و مدارک، می‌توانید مستقیم تماس بگیرید."
            />

            <div className="ed-contact-list">
              {CONTACT.map((item) => (
                <div className="ed-contact-item" key={item.label}>
                  <span className="ed-contact-item-icon">
                    <i className={`luxinaicon ${item.icon}`} aria-hidden="true" />
                  </span>
                  <div>
                    <span className="ed-contact-item-label">{item.label}</span>
                    {item.href ? (
                      <a className="ed-contact-item-value" href={item.href} dir={item.ltr ? 'ltr' : undefined}>
                        {item.value}
                      </a>
                    ) : (
                      <span className="ed-contact-item-value">{item.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="ed-contact-hours">
              <i className="luxinaicon luxina-icon-guide-fill" aria-hidden="true" />
              <span>{SERVICE_CONTACT.hours}</span>
            </div>

            <div className="ed-contact-social">
              {SOCIAL.map((item) => (
                <a
                  className="ed-social-link"
                  href={item.href}
                  key={item.label}
                  target="_blank"
                  rel="noopener"
                >
                  <i className={`luxinaicon ${item.icon}`} aria-hidden="true" />
                  <span>{item.label}</span>
                  <i className="luxinaicon luxina-icon-arrow-right-up-long-line ed-social-arrow" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="ed-contact-form">
            <h2 className="ed-contact-form-title">فرم درخواست پروژه</h2>
            <p className="ed-sp-panel-note">
              نام و شماره تماس را وارد کنید؛ کارشناس ما برای هماهنگی جلسهٔ مشاوره با شما تماس می‌گیرد.
            </p>
            <div className="ed-form-card">
              <RequestForm
                type="contact"
                messagePlaceholder="دربارهٔ پروژه یا پرسش خود بنویسید"
                submit="ارسال پیام"
                note="پیام شما ثبت شد؛ کارشناسان ما در اولین فرصت پاسخ می‌دهند."
              />
            </div>
          </div>
        </div>
      </Band>

      <Band>
        <div className="ed-contact-map">
          <div className="ed-contact-map-copy">
            <span className="sp-kicker">
              <span className="sp-kicker-rule" aria-hidden="true" />
              موقعیت دفتر
            </span>
            <h2 className="ed-split-title">تهران، خیابان اسکندری</h2>
            <p className="ed-split-text">{SERVICE_CONTACT.address}</p>
            <a
              className="ed-more-link"
              href="https://maps.google.com/?q=Tehran,+Eskandari+Street"
              target="_blank"
              rel="noopener"
            >
              مشاهدهٔ مسیر روی نقشه
              <i className="luxinaicon luxina-icon-arrow-right-up-long-line" aria-hidden="true" />
            </a>
          </div>
          <div className="ed-contact-map-card">
            <i className="luxinaicon luxina-icon-map-pin-2-fill" aria-hidden="true" />
            <span>دفتر مرکزی لوکسینا</span>
            <strong>تهران، اسکندری</strong>
            <span className="ed-contact-map-hint">برای بازدید حضوری، هماهنگی قبلی لازم است.</span>
          </div>
        </div>
      </Band>
    </div>
  );
}
