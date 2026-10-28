import { useState } from 'react';
import { useSite } from '../../site/SiteContent.jsx';
import Icon from '../../components/Icons.jsx';
import { AdminPanel, EmptyNote, TextArea, TextInput } from '../ui.jsx';

const emptyPage = () => ({
  kicker: 'اطلاعات و قوانین',
  title: '',
  intro: '',
  sections: [['عنوان بخش', 'متن این بخش را بنویسید.']],
});

export default function PagesPanel() {
  const { content, update } = useSite();
  const slugs = Object.keys(content.pages || {});
  const [active, setActive] = useState(slugs[0] || '');
  const [newSlug, setNewSlug] = useState('');

  const page = content.pages?.[active];

  const setPages = (pages) => update((prev) => ({ ...prev, pages }));

  const patch = (data) =>
    setPages({ ...content.pages, [active]: { ...content.pages[active], ...data } });

  const patchSection = (index, key, value) =>
    patch({
      sections: content.pages[active].sections.map((section, sectionIndex) =>
        sectionIndex === index ? (key === 0 ? [value, section[1]] : [section[0], value]) : section
      ),
    });

  const addPage = () => {
    const slug = newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!slug || content.pages?.[slug]) return;
    setPages({ ...content.pages, [slug]: emptyPage() });
    setActive(slug);
    setNewSlug('');
  };

  const removePage = () => {
    if (!window.confirm('این صفحه حذف شود؟')) return;
    const next = { ...content.pages };
    delete next[active];
    setPages(next);
    setActive(Object.keys(next)[0] || '');
  };

  return (
    <AdminPanel
      title="صفحات سایت"
      description="صفحاتی مثل حریم خصوصی، شرایط و ضوابط و راهنماها؛ هر صفحه آدرس /p/نام‌صفحه دارد."
    >
      <div className="adm-inline-add">
        <TextInput
          label="نام انگلیسی صفحه جدید"
          value={newSlug}
          onChange={setNewSlug}
          dir="ltr"
          placeholder="مثلاً warranty"
        />
        <button type="button" className="adm-btn adm-btn--gold" onClick={addPage}>
          <Icon name="plus" size={16} />
          افزودن صفحه
        </button>
      </div>

      <div className="adm-tabs">
        {slugs.map((slug) => (
          <button
            type="button"
            key={slug}
            className={`adm-tab${slug === active ? ' is-active' : ''}`}
            onClick={() => setActive(slug)}
          >
            {content.pages[slug].title || slug}
            <small>/p/{slug}</small>
          </button>
        ))}
      </div>

      {page ? (
        <div className="adm-editor">
          <div className="adm-editor__head">
            <h3>{page.title || 'صفحه بدون عنوان'}</h3>
            <div className="adm-editor__actions">
              <a className="adm-btn adm-btn--ghost" href={`/p/${active}`} target="_blank" rel="noreferrer">
                مشاهده صفحه
              </a>
              <button type="button" className="adm-btn adm-btn--danger" onClick={removePage}>
                <Icon name="trash" size={16} />
                حذف صفحه
              </button>
            </div>
          </div>

          <div className="adm-grid">
            <TextInput label="بالانویس" value={page.kicker} onChange={(value) => patch({ kicker: value })} />
            <TextInput label="عنوان صفحه" value={page.title} onChange={(value) => patch({ title: value })} />
            <TextArea
              label="مقدمه"
              value={page.intro}
              onChange={(value) => patch({ intro: value })}
              rows={4}
              wide
            />
          </div>

          <h4 className="adm-subtitle">بخش‌های صفحه</h4>
          <div className="adm-cards">
            {(page.sections || []).map((section, index) => (
              <div className="adm-editor adm-editor--inner" key={`${active}-${index}`}>
                <div className="adm-editor__head">
                  <h3>بخش {(index + 1).toLocaleString('fa-IR')}</h3>
                  <button
                    type="button"
                    className="adm-icon-btn"
                    onClick={() =>
                      patch({ sections: page.sections.filter((_, sectionIndex) => sectionIndex !== index) })
                    }
                    aria-label="حذف بخش"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
                <div className="adm-grid">
                  <TextInput
                    label="تیتر بخش"
                    value={section[0]}
                    onChange={(value) => patchSection(index, 0, value)}
                    wide
                  />
                  <TextArea
                    label="متن بخش"
                    value={section[1]}
                    onChange={(value) => patchSection(index, 1, value)}
                    rows={4}
                    wide
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="adm-btn adm-btn--ghost"
            onClick={() => patch({ sections: [...(page.sections || []), ['عنوان بخش', 'متن بخش']] })}
          >
            <Icon name="plus" size={16} />
            افزودن بخش
          </button>
        </div>
      ) : (
        <EmptyNote>صفحه‌ای انتخاب نشده است.</EmptyNote>
      )}
    </AdminPanel>
  );
}
