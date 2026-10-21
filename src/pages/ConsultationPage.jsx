import PageHero from '../components/editorial/PageHero.jsx';
import Band from '../components/editorial/Band.jsx';
import SectionHead from '../components/services/SectionHead.jsx';
import FeatureList from '../components/services/FeatureList.jsx';
import RequestForm from '../components/RequestForm.jsx';
import { SERVICE_CONTACT } from '../content/service-pages.js';

const STEPS = [
  {
    no: '۰۱',
    title: 'ثبت درخواست',
    text: 'نام، شماره تماس و توضیح کوتاه پروژه را می‌فرستید؛ نیازی به مدارک نیست.',
  },
  {
    no: '۰۲',
    title: 'تماس کارشناس',
    text: 'در کمتر از یک روز کاری تماس می‌گیریم و زمان جلسه را هماهنگ می‌کنیم.',
  },
  {
    no: '۰۳',
    title: 'جلسهٔ مشاوره',
    text: 'متراژ، محدودیت‌ها، بازهٔ بودجه و مسیر پیشنهادی اجرا را بررسی می‌کنیم.',
  },
];

// Consultation request: the form beside the expectations of the first meeting.
export default function ConsultationPage() {
  return (
    <div className="ed-page">
      <PageHero
        tone="paper"
        eyebrow="مشاورهٔ پروژه"
        icon="luxina-icon-customer-service-2-line"
        title="درخواست مشاوره"
        lead="در یک جلسهٔ کوتاه، دربارهٔ زمین یا بنای شما صحبت می‌کنیم و مسیر واقع‌بینانهٔ طراحی و اجرا را روشن می‌کنیم."
        breadcrumbs={[{ href: '/', label: 'خانه' }, { label: 'درخواست مشاوره' }]}
        size="compact"
        facts={[
          { label: 'مدت جلسه', value: '۳۰ تا ۴۵ دقیقه' },
          { label: 'هزینه', value: 'بدون هزینه' },
          { label: 'نوع جلسه', value: 'حضوری یا آنلاین' },
        ]}
      />

      <Band tone="soft">
        <div className="ed-contact">
          <div className="ed-contact-info">
            <SectionHead
              kicker="چه اتفاقی می‌افتد"
              title="مسیر درخواست مشاوره"
              text="سه گام ساده؛ بدون فرم طولانی و بدون تعهد."
            />
            <FeatureList items={STEPS} columns={1} />
            <div className="ed-contact-hours">
              <i className="luxinaicon luxina-icon-customer-service-2-line" aria-hidden="true" />
              <span>تماس مستقیم: </span>
              <a className="ed-contact-item-value" href={SERVICE_CONTACT.phoneHref} dir="ltr">
                021-123 4567
              </a>
            </div>
          </div>

          <div className="ed-contact-form">
            <h2 className="ed-contact-form-title">فرم درخواست مشاوره</h2>
            <p className="ed-sp-panel-note">
              هرچه دربارهٔ پروژه بنویسید، جلسهٔ اول دقیق‌تر خواهد بود.
            </p>
            <div className="ed-form-card">
              <RequestForm
                type="consultation"
                messagePlaceholder="دربارهٔ پروژه‌تان بنویسید (متراژ، موقعیت، نوع کار)"
                submit="ثبت درخواست"
                note="درخواست مشاورهٔ شما ثبت شد؛ برای هماهنگی جلسه تماس می‌گیریم."
              />
            </div>
          </div>
        </div>
      </Band>
    </div>
  );
}
