import { useState } from 'react';
import { useSite } from '../../site/SiteContent.jsx';
import Icon from '../../components/Icons.jsx';
import { AdminPanel, EditorCard, ImageField, TextArea, TextInput, makeId } from '../ui.jsx';

const emptyPost = () => ({
  id: '',
  title: '',
  category: 'آشپزی',
  date: '',
  readTime: '۴ دقیقه مطالعه',
  image: '',
  excerpt: '',
  body: [],
});

export default function BlogPanel() {
  const { content, update } = useSite();
  const [draft, setDraft] = useState(null);

  const setPosts = (posts) => update((prev) => ({ ...prev, posts }));

  const patch = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    if (!draft || !draft.title.trim()) return;
    const post = { ...draft, id: draft.id || makeId('post') };
    setPosts(
      draft.id ? content.posts.map((item) => (item.id === post.id ? post : item)) : [post, ...content.posts]
    );
    setDraft(null);
  };

  const remove = (id) => {
    if (!window.confirm('این مقاله حذف شود؟')) return;
    setPosts(content.posts.filter((item) => item.id !== id));
  };

  return (
    <AdminPanel
      title="وبلاگ"
      description="مقالات صفحه وبلاگ و بخش وبلاگ در صفحه اصلی."
      actions={
        <button type="button" className="adm-btn adm-btn--gold" onClick={() => setDraft(emptyPost())}>
          <Icon name="plus" size={17} />
          پست جدید
        </button>
      }
    >
      {draft ? (
        <div className="adm-editor">
          <div className="adm-editor__head">
            <h3>{draft.id ? 'ویرایش پست' : 'پست جدید'}</h3>
            <div className="adm-editor__actions">
              <button type="button" className="adm-btn adm-btn--gold" onClick={save}>
                <Icon name="check" size={16} />
                ذخیره
              </button>
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setDraft(null)}>
                انصراف
              </button>
            </div>
          </div>

          <div className="adm-grid">
            <TextInput label="عنوان" value={draft.title} onChange={(value) => patch('title', value)} wide />
            <TextInput label="دسته" value={draft.category} onChange={(value) => patch('category', value)} />
            <TextInput label="تاریخ" value={draft.date} onChange={(value) => patch('date', value)} />
            <TextInput label="زمان مطالعه" value={draft.readTime} onChange={(value) => patch('readTime', value)} />
            <TextArea
              label="خلاصه"
              value={draft.excerpt}
              onChange={(value) => patch('excerpt', value)}
              wide
            />
            <TextArea
              label="متن مقاله"
              value={(draft.body || []).join('\n\n')}
              onChange={(value) => patch('body', value.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean))}
              rows={8}
              wide
              hint="هر پاراگراف را با یک خط خالی از پاراگراف بعدی جدا کنید."
            />
            <div className="adm-field adm-field--wide">
              <ImageField label="تصویر شاخص" value={draft.image} onChange={(value) => patch('image', value)} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="adm-cards">
        {content.posts.map((post) => (
          <EditorCard
            key={post.id}
            title={post.title}
            badge={post.category}
            onRemove={() => remove(post.id)}
            tools={
              <button type="button" className="adm-icon-btn" onClick={() => setDraft({ ...post })} aria-label="ویرایش">
                <Icon name="edit" size={16} />
              </button>
            }
          >
            <p className="adm-card__text">{post.excerpt}</p>
          </EditorCard>
        ))}
      </div>
    </AdminPanel>
  );
}
