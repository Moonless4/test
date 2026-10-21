import PageHero from '../components/editorial/PageHero.jsx';
import Band from '../components/editorial/Band.jsx';
import WorkCard from '../components/editorial/WorkCard.jsx';
import SectionHead from '../components/services/SectionHead.jsx';
import StatsBand from '../components/services/StatsBand.jsx';
import ProcessRail from '../components/services/ProcessRail.jsx';
import ServiceCta from '../components/services/ServiceCta.jsx';
import Button from '../components/Button.jsx';
import FaqList from '../components/FaqList.jsx';
import { projects } from '../content/projects.js';
import { findProjectDetails } from '../content/project-details.js';

const STATS = [
  { value: '۱۵+', label: 'سال تجربهٔ اجرایی' },
  { value: '۱۲۰+', label: 'پروژهٔ تحویل‌شده' },
  { value: '۹۵٪', label: 'رضایت کارفرمایان' },
  { value: '۲۵', label: 'طبقه در بلندترین پروژه' },
];

const PILLARS = [
  {
    no: '۰۱',
    title: 'طراحی مبتنی بر اجرا',
    text: 'هر تصمیم طراحی پیش از ثبت، از فیلتر سازه، تأسیسات و هزینه عبور می‌کند تا طرح روی کاغذ نماند.',
  },
  {
    no: '۰۲',
    title: 'شفافیت هزینه',
    text: 'برآورد مرحله‌ای و فهرست متریال از ابتدا مشخص است؛ تغییرات فقط با تأیید کارفرما اعمال می‌شود.',
  },
  {
    no: '۰۳',
    title: 'نظارت مستمر',
    text: 'مدیر پروژهٔ ثابت در همهٔ مراحل حاضر است و گزارش پیشرفت به‌صورت منظم ارائه می‌شود.',
  },
];

const STEPS = [
  { no: '۰۱', title: 'شناخت و بررسی', text: 'بازدید، اندازه‌گیری و ثبت محدودیت‌های زمین یا بنای موجود.' },
  { no: '۰۲', title: 'طراحی و تأیید', text: 'ارائهٔ گزینه‌های طراحی و نهایی‌سازی طرح با کارفرما.' },
  { no: '۰۳', title: 'برآورد و برنامه', text: 'برآورد هزینه، انتخاب متریال و تدوین برنامهٔ زمانی.' },
  { no: '۰۴', title: 'اجرا و کنترل کیفیت', text: 'اجرای مرحله‌ای با بازرسی منظم و گزارش پیشرفت.' },
  { no: '۰۵', title: 'تحویل و پشتیبانی', text: 'تحویل کلید، آموزش بهره‌برداری و پشتیبانی پس از تحویل.' },
];

// About: the studio's story, philosophy, figures, process and team.
export default function AboutPage() {
  return (
    <div className="ed-page">
      <PageHero
        image="/img/Building-Types-Hero.webp"
        eyebrow="دربارهٔ لوکسینا"
        icon="luxina-icon-building-line"
        title="معماری، مهندسی و اجرا در یک تیم"
        lead="لوکسینا با ترکیب هنر معماری و دانش اجرا، فضاهایی می‌سازد که هم زیبا باشند و هم سال‌ها درست کار کنند."
        breadcrumbs={[{ href: '/', label: 'خانه' }, { label: 'درباره ما' }]}
        facts={[
          { label: 'سال تأسیس', value: '۱۳۸۸' },
          { label: 'تیم', value: 'معمار، سازه، اجرا' },
          { label: 'حوزهٔ فعالیت', value: 'مسکونی و اداری' },
          { label: 'موقعیت', value: 'تهران' },
        ]}
        actions={[{ label: 'فرصت‌های همکاری', href: '/cooperation' }]}
      />

      <Band tone="soft">
        <div className="ed-split">
          <div className="ed-split-body">
            <span className="sp-kicker">
              <span className="sp-kicker-rule" aria-hidden="true" />
              داستان ما
            </span>
            <h2 className="ed-split-title">از یک دفتر طراحی تا یک استودیوی کامل اجرا</h2>
            <p className="ed-split-text">
              ما در لوکسینا با افتخار هنر و تخصص خود را در خدمت ساخت و ساز، انبوه‌سازی، بازسازی خانه‌های قدیمی و طراحی
              خانه‌های لوکس قرار داده‌ایم. هدف ما خلق فضاهایی است که نه تنها نیازهای عملکردی را برآورده کنند، بلکه
              الهام‌بخش زندگی مدرن و سبک زندگی منحصر به فرد شما باشند.
            </p>
            <p className="ed-split-text">
              تیم ما از معماران، مهندسان سازه و مدیران اجرایی تشکیل شده است که از مرحلهٔ ایده تا تحویل کلید در کنار شما
              هستند. هر پروژه با شناخت دقیق نیاز کارفرما آغاز می‌شود و با برنامه‌ریزی شفاف، انتخاب متریال مناسب و نظارت
              مستمر به پایان می‌رسد.
            </p>
            <blockquote className="ed-quote">
              <i className="luxinaicon luxina-icon-question-answer-fill" aria-hidden="true" />
              <span>پروژهٔ خوب، پروژه‌ای است که ده سال بعد هم همان‌طور کار کند که روز تحویل کار می‌کرد.</span>
            </blockquote>
            <div className="ed-split-note">
              <div className="ed-split-note-item">
                <span className="ed-split-note-value">۱۵+</span>
                <span className="ed-split-note-label">سال تجربهٔ اجرایی</span>
              </div>
              <div className="ed-split-note-item">
                <span className="ed-split-note-value">۱۲۰+</span>
                <span className="ed-split-note-label">پروژهٔ تحویل‌شده</span>
              </div>
            </div>
            <div className="rb-detail-actions">
              <Button href="/projects">مشاهدهٔ پروژه‌ها</Button>
              <Button href="/consultation" variant="gray">
                درخواست مشاوره
              </Button>
            </div>
          </div>

          <div className="ed-split-media">
            <figure className="ed-split-figure">
              <img src="/img/team.png" alt="تیم لوکسینا" loading="lazy" width="900" height="1120" />
            </figure>
            <figure className="ed-split-figure ed-split-figure-small">
              <img src="/img/team-bg.png" alt="" loading="lazy" width="640" height="640" />
            </figure>
          </div>
        </div>
      </Band>

      <Band>
        <SectionHead
          kicker="اصول کاری"
          title="سه اصل که پروژه را سر پا نگه می‌دارد"
          text="این اصول در همهٔ پروژه‌ها، از یک واحد بازسازی‌شده تا یک برج ۲۵ طبقه، یکسان اجرا می‌شود."
        />
        <div className="ed-pillars">
          {PILLARS.map((pillar) => (
            <article className="ed-pillar" key={pillar.title} data-reveal>
              <span className="ed-pillar-no">{pillar.no}</span>
              <h3 className="ed-pillar-title">{pillar.title}</h3>
              <p className="ed-pillar-text">{pillar.text}</p>
            </article>
          ))}
        </div>

        <div className="ed-about-stats" data-reveal>
          <StatsBand stats={STATS} tone="dark" />
        </div>
      </Band>

      <Band tone="soft">
        <SectionHead
          kicker="فرایند کار"
          title="از اولین بازدید تا تحویل کلید"
          text="پنج مرحلهٔ ثابت که خروجی هرکدام پیش از شروع مرحلهٔ بعد تأیید می‌شود."
        />
        <ProcessRail steps={STEPS} />
      </Band>

      <Band>
        <div className="ed-related-head">
          <SectionHead kicker="نمونه‌کارها" title="پروژه‌هایی که ساختیم" />
          <a className="ed-more-link" href="/projects">
            همهٔ پروژه‌ها
            <i className="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true" />
          </a>
        </div>
        <div className="ed-portfolio ed-portfolio--pair">
          {projects.slice(0, 3).map((project, index) => (
            <WorkCard
              key={project.slug}
              project={project}
              details={findProjectDetails(project.slug)}
              index={index}
              size="third"
              reveal={false}
            />
          ))}
        </div>
      </Band>

      <Band tone="soft">
        <div className="ed-split ed-split--reverse">
          <div className="ed-split-body">
            <SectionHead kicker="سوالات متداول" title="پرسش‌های رایج کارفرمایان" />
            <FaqList />
          </div>
          <div className="ed-split-media">
            <figure className="ed-split-figure ed-faq-figure">
              <img src="/img/faq-img.png" alt="" width="295" height="381" loading="lazy" />
            </figure>
          </div>
        </div>
      </Band>

      <Band>
        <ServiceCta
          image="/img/NA1442_shutterstock_355734689.webp"
          title="با تیم لوکسینا آشنا شوید"
          text="اگر به همکاری با تیم ما علاقه دارید یا برای پروژه‌تان به مشاوره نیاز دارید، یک جلسهٔ کوتاه کافی است."
        />
      </Band>
    </div>
  );
}
