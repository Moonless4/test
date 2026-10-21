import SectionHead from '../services/SectionHead.jsx';
import ProcessRail from '../services/ProcessRail.jsx';

// The five stages every Luxina project goes through, on the shared process rail.
const STEPS = [
  { no: '۰۱', title: 'مشاورهٔ اولیه', text: 'شناخت نیاز، بازدید از زمین و تعریف محدودهٔ پروژه.' },
  { no: '۰۲', title: 'طراحی مفهومی', text: 'پلان‌های اولیه، حجم‌شناسی و بررسی گزینه‌های طراحی.' },
  { no: '۰۳', title: 'برآورد هزینه‌ها', text: 'برآورد شفاف متریال، نیروی کار و برنامهٔ زمانی اجرا.' },
  { no: '۰۴', title: 'شروع عملیات اجرایی', text: 'آماده‌سازی کارگاه، اجرای سازه و کنترل کیفیت مرحله‌ای.' },
  { no: '۰۵', title: 'تکمیل و تحویل', text: 'نازک‌کاری، تحویل کلید و پشتیبانی پس از بهره‌برداری.' },
];

export default function TimelineSection() {
  return (
    <section className="hp-band hp-band--sand">
      <div className="hp-inner">
        <div className="hp-band-head">
          <SectionHead
            kicker="تایم‌لاین پروژه"
            title="مسیری که هر پروژه طی می‌کند"
            text="پنج مرحلهٔ روشن؛ هر مرحله خروجی مشخصی دارد و تا تأیید کارفرما مرحلهٔ بعد آغاز نمی‌شود."
          />
        </div>
        <ProcessRail steps={STEPS} />
      </div>
    </section>
  );
}
