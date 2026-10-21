import Button from '../Button.jsx';
import { SERVICE_CONTACT } from '../../content/service-pages.js';

// Closing consultation band: architectural photograph behind a deep teal veil,
// a direct phone line and the two contact routes of the site.
export default function ServiceCta({ image, title = 'برای پروژه خود با ما صحبت کنید', text }) {
  return (
    <div className="sp-cta">
      <div className="sp-cta-media" aria-hidden="true">
        <img src={image} alt="" loading="lazy" width="1920" height="1080" />
      </div>
      <div className="sp-cta-veil" aria-hidden="true" />

      <div className="sp-cta-body">
        <span className="sp-kicker sp-kicker-light">
          <span className="sp-kicker-rule" aria-hidden="true" />
          مشاورهٔ پروژه
        </span>
        <h2 className="sp-cta-title">{title}</h2>
        <p className="sp-cta-text">
          {text ||
            'در یک جلسهٔ حضوری یا آنلاین، نیازها، محدودیت‌های فضا و برآورد اولیهٔ هزینه را با هم مرور می‌کنیم. مشاورهٔ اولیه بدون هزینه است.'}
        </p>
        <div className="sp-cta-actions">
          <Button href="/consultation" variant="primary">
            درخواست مشاوره
          </Button>
          <a className="sp-cta-ghost" href={SERVICE_CONTACT.phoneHref}>
            <i className="luxinaicon luxina-icon-customer-service-2-line" aria-hidden="true" />
            <span>تماس مستقیم</span>
          </a>
        </div>
      </div>

      <ul className="sp-cta-contact">
        <li>
          <i className="luxinaicon luxina-icon-customer-service-2-line" aria-hidden="true" />
          <span className="sp-cta-contact-label">تلفن</span>
          <a href={SERVICE_CONTACT.phoneHref} dir="ltr" className="sp-cta-contact-value">
            {SERVICE_CONTACT.phone}
          </a>
        </li>
        <li>
          <i className="luxinaicon luxina-icon-mail-fill" aria-hidden="true" />
          <span className="sp-cta-contact-label">ایمیل</span>
          <a href={`mailto:${SERVICE_CONTACT.email}`} dir="ltr" className="sp-cta-contact-value">
            {SERVICE_CONTACT.email}
          </a>
        </li>
        <li>
          <i className="luxinaicon luxina-icon-map-pin-2-fill" aria-hidden="true" />
          <span className="sp-cta-contact-label">دفتر</span>
          <span className="sp-cta-contact-value">{SERVICE_CONTACT.address}</span>
        </li>
        <li>
          <i className="luxinaicon luxina-icon-guide-fill" aria-hidden="true" />
          <span className="sp-cta-contact-label">ساعات پاسخ</span>
          <span className="sp-cta-contact-value">{SERVICE_CONTACT.hours}</span>
        </li>
      </ul>
    </div>
  );
}
