import SectionHead from '../services/SectionHead.jsx';

// Partner logo wall ("افتخارات همکاری").
const LOGOS = [
  '/img/customer-2.png',
  '/img/customer-3.png',
  '/img/customer-4.png',
  '/img/customer-6.png',
  '/img/customer-7-1.png',
  '/img/customer-8.png',
  '/img/customer-9.png',
  '/img/customer-1.png',
];

export default function CustomersSection() {
  return (
    <section className="hp-band hp-band--paper">
      <div className="hp-inner">
        <div className="hp-band-head hp-band-head--center">
          <SectionHead
            kicker="افتخارات همکاری"
            title="همراهان لوکسینا"
            text="در طول سال‌ها، با کارفرمایان، تأمین‌کنندگان و مجموعه‌هایی کار کرده‌ایم که کیفیت اجرا برایشان اولویت اول بود."
            align="center"
          />
        </div>

        <div className="hp-logo-wall">
          {LOGOS.map((logo, index) => (
            <div className="hp-logo" key={logo} data-reveal style={{ '--reveal-delay': `${index * 45}ms` }}>
              <img src={logo} alt="" loading="lazy" decoding="async" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
