import { PAGES } from './schema.js';

// The page directory: every public page with its edit entry and a live preview.
export default function PagesList({ doc, onOpenPage }) {
  const pages = doc?.settings?.pages || {};

  return (
    <div className="adm-view">
      <header className="adm-head">
        <div className="adm-head-copy">
          <span className="adm-eyebrow">محتوا</span>
          <h1>صفحات</h1>
          <p className="adm-muted">متن، بخش‌ها و سئوی هر صفحه را از اینجا ویرایش کنید.</p>
        </div>
      </header>

      <div className="adm-page-grid">
        {PAGES.map((page, index) => {
          const copy = page.id === 'home' ? null : pages[page.id];
          return (
            <article className="adm-page-card" key={page.id}>
              <span className="adm-page-index">{String(index + 1).padStart(2, '0')}</span>
              <h2>{page.label}</h2>
              <p>{copy?.subtitle || page.description}</p>
              <div className="adm-page-card-foot">
                <span className="adm-page-route" dir="ltr">{page.route}</span>
                <div className="adm-head-actions">
                  <a className="adm-text-btn" href={page.route} target="_blank" rel="noreferrer">
                    پیش‌نمایش ↗
                  </a>
                  <button type="button" className="adm-btn adm-btn-quiet" onClick={() => onOpenPage(page.id)}>
                    ویرایش
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
