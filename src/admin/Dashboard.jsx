import { PAGES } from './schema.js';

const TYPE_LABEL = { contact: 'تماس', consultation: 'مشاوره', cooperation: 'همکاری' };

const shortDate = (iso) => {
  try {
    return new Intl.DateTimeFormat('fa-IR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
      new Date(iso),
    );
  } catch {
    return '';
  }
};

function Stat({ label, value, hint }) {
  return (
    <div className="adm-stat">
      <span className="adm-stat-value">{value}</span>
      <span className="adm-stat-label">{label}</span>
      {hint ? <span className="adm-stat-hint">{hint}</span> : null}
    </div>
  );
}

// A quiet editorial dashboard: the numbers that matter, the latest work and the
// inbox — no chart walls.
export default function Dashboard({ doc, messages, onNavigate, onOpenPage, onOpenItem }) {
  const settings = doc?.settings || {};
  const projects = Array.isArray(doc?.projects) ? doc.projects : [];
  const articles = Array.isArray(doc?.articles) ? doc.articles : [];
  const services = Array.isArray(doc?.services) ? doc.services : [];
  const team = settings.team?.members || [];
  const unread = messages.filter((message) => !message.read);
  const published = articles.filter((article) => article.published !== false);

  return (
    <div className="adm-view">
      <header className="adm-head adm-head-dashboard">
        <div className="adm-head-copy">
          <span className="adm-eyebrow">داشبورد مدیریت</span>
          <h1>{settings.general?.studioName || 'آراتان'}</h1>
          <p className="adm-muted">وضعیت محتوای سایت در یک نگاه.</p>
        </div>
        <div className="adm-head-actions">
          <a className="adm-btn adm-btn-quiet" href="/" target="_blank" rel="noreferrer">
            مشاهدهٔ سایت ↗
          </a>
          <button type="button" className="adm-btn" onClick={() => onNavigate('projects')}>
            + پروژهٔ جدید
          </button>
        </div>
      </header>

      <section className="adm-stats">
        <Stat label="پروژه" value={projects.length} hint="مجموع ثبت‌شده" />
        <Stat label="مقالهٔ منتشرشده" value={published.length} hint={`از ${articles.length} مقاله`} />
        <Stat label="خدمت" value={services.length} hint="در فهرست خدمات" />
        <Stat label="عضو تیم" value={team.length} hint="در صفحهٔ درباره ما" />
        <Stat label="پیام خوانده‌نشده" value={unread.length} hint={unread.length ? 'نیازمند بررسی' : 'همه بررسی شده'} />
      </section>

      <div className="adm-columns">
        <section className="adm-card">
          <header className="adm-card-head">
            <h2>آخرین پروژه‌ها</h2>
            <button type="button" className="adm-text-btn" onClick={() => onNavigate('projects')}>
              همهٔ پروژه‌ها
            </button>
          </header>
          <div className="adm-table">
            {projects.slice(0, 4).map((project) => (
              <button type="button" className="adm-table-row" key={project.slug} onClick={() => onOpenItem('projects', project.slug)}>
                <span className="adm-list-thumb">{project.image ? <img src={project.image} alt="" /> : null}</span>
                <span className="adm-table-main">
                  <strong>{project.title}</strong>
                  <em>{project.status || 'بدون وضعیت'}</em>
                </span>
                <span className="adm-table-meta">{project.details?.location || project.slug}</span>
              </button>
            ))}
            {!projects.length ? <p className="adm-muted adm-empty">هنوز پروژه‌ای ثبت نشده است.</p> : null}
          </div>
        </section>

        <section className="adm-card">
          <header className="adm-card-head">
            <h2>آخرین مقالات</h2>
            <button type="button" className="adm-text-btn" onClick={() => onNavigate('articles')}>
              همهٔ مقالات
            </button>
          </header>
          <div className="adm-table">
            {articles.slice(0, 4).map((article) => (
              <button type="button" className="adm-table-row" key={article.slug} onClick={() => onOpenItem('articles', article.slug)}>
                <span className="adm-table-main">
                  <strong>{article.cardTitle || article.title}</strong>
                  <em>{article.category || 'بدون دسته'} · {article.dateLabel || ''}</em>
                </span>
                <span className={`adm-tag${article.published === false ? ' is-muted' : ''}`}>
                  {article.published === false ? 'پیش‌نویس' : 'منتشرشده'}
                </span>
              </button>
            ))}
            {!articles.length ? <p className="adm-muted adm-empty">هنوز مقاله‌ای ثبت نشده است.</p> : null}
          </div>
        </section>

        <section className="adm-card">
          <header className="adm-card-head">
            <h2>پیام‌های تماس</h2>
            <button type="button" className="adm-text-btn" onClick={() => onNavigate('messages')}>
              همهٔ پیام‌ها
            </button>
          </header>
          <div className="adm-table">
            {messages.slice(0, 4).map((message) => (
              <button type="button" className="adm-table-row" key={message.id} onClick={() => onNavigate('messages')}>
                <span className="adm-table-main">
                  <strong>
                    {message.read ? null : <span className="adm-unread-dot" aria-label="خوانده‌نشده" />}
                    {message.name}
                  </strong>
                  <em>{TYPE_LABEL[message.type] || 'تماس'} · {shortDate(message.createdAt)}</em>
                </span>
                <span className="adm-table-meta" dir="ltr">{message.phone}</span>
              </button>
            ))}
            {!messages.length ? <p className="adm-muted adm-empty">پیامی دریافت نشده است.</p> : null}
          </div>
        </section>

        <section className="adm-card">
          <header className="adm-card-head">
            <h2>اقدام‌های سریع</h2>
          </header>
          <div className="adm-quick">
            <button type="button" className="adm-quick-btn" onClick={() => onOpenPage('home')}>
              ویرایش صفحهٔ اصلی
              <span>هیرو، بخش‌ها و سئو</span>
            </button>
            <button type="button" className="adm-quick-btn" onClick={() => onNavigate('projects')}>
              مدیریت پروژه‌ها
              <span>افزودن، ترتیب و انتشار</span>
            </button>
            <button type="button" className="adm-quick-btn" onClick={() => onNavigate('articles')}>
              نوشتن مقاله
              <span>متن، تصویر و سئو</span>
            </button>
            <button type="button" className="adm-quick-btn" onClick={() => onNavigate('media')}>
              کتابخانهٔ رسانه
              <span>بارگذاری و انتخاب تصویر</span>
            </button>
          </div>
          <div className="adm-quick-pages">
            {PAGES.slice(0, 5).map((page) => (
              <button type="button" className="adm-text-btn" key={page.id} onClick={() => onOpenPage(page.id)}>
                {page.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
