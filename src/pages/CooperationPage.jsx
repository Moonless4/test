import PageHero from '../components/editorial/PageHero.jsx';
import Band from '../components/editorial/Band.jsx';
import SectionHead from '../components/services/SectionHead.jsx';
import FeatureList from '../components/services/FeatureList.jsx';
import RequestForm from '../components/RequestForm.jsx';

const POINTS = [
  { no: '۰۱', title: 'معمار و طراح داخلی', text: 'طراحی مفهومی، پلان و جزئیات اجرایی با نگاه به شرایط واقعی کارگاه.' },
  { no: '۰۲', title: 'مهندس سازه و تأسیسات', text: 'هماهنگی سازه و تأسیسات با معماری، از مرحلهٔ طراحی تا اجرا.' },
  { no: '۰۳', title: 'مدیر پروژه و ناظر اجرا', text: 'کنترل برنامهٔ زمانی، کیفیت اجرا و ارتباط مستمر با کارفرما.' },
];

// Cooperation: the open collaboration route, beside the team photograph.
export default function CooperationPage() {
  return (
    <div className="ed-page">
      <PageHero
        image="/img/team-bg.png"
        eyebrow="همکاری با لوکسینا"
        icon="luxina-icon-team-fill"
        title="فرصت همکاری"
        lead="برای هر پروژه به معمار، مهندس، ناظر و مجری متخصص نیاز داریم. اگر با استانداردهای اجرایی ما هم‌مسیر هستید، با ما صحبت کنید."
        breadcrumbs={[{ href: '/', label: 'خانه' }, { label: 'فرصت همکاری' }]}
        size="compact"
        facts={[
          { label: 'حوزه‌ها', value: 'طراحی و اجرا' },
          { label: 'نوع همکاری', value: 'پروژه‌ای یا مستمر' },
          { label: 'موقعیت', value: 'تهران' },
        ]}
      />

      <Band tone="soft">
        <div className="ed-contact">
          <div className="ed-contact-info">
            <SectionHead
              kicker="تیم ما"
              title="با چه کسانی کار می‌کنیم"
              text="کیفیت اجرای لوکسینا به تیم ثابت و همکاران متخصص آن وابسته است."
            />
            <FeatureList items={POINTS} columns={1} />
            <div className="ed-contact-hours">
              <i className="luxinaicon luxina-icon-mail-fill" aria-hidden="true" />
              <span>ارسال رزومه: </span>
              <a className="ed-contact-item-value" href="mailto:info@archilux.ir" dir="ltr">
                info@archilux.ir
              </a>
            </div>
          </div>

          <div className="ed-contact-form">
            <h2 className="ed-contact-form-title">فرم درخواست همکاری</h2>
            <p className="ed-sp-panel-note">
              زمینهٔ همکاری و سابقهٔ کاری خود را کوتاه بنویسید؛ در صورت تطابق تماس می‌گیریم.
            </p>
            <div className="ed-form-card">
              <RequestForm
                type="cooperation"
                messagePlaceholder="زمینهٔ همکاری و سابقهٔ کاری"
                submit="ارسال درخواست"
                note="درخواست همکاری شما ثبت شد؛ در صورت تطابق با فرصت‌های موجود تماس می‌گیریم."
              />
            </div>
          </div>
        </div>
      </Band>
    </div>
  );
}
