import { useState } from 'react';
import { useSite } from '../../site/SiteContent.jsx';
import Icon from '../../components/Icons.jsx';
import { AdminPanel, EmptyNote, EditorCard, ImageField, TextInput, makeId } from '../ui.jsx';

export default function CategoriesPanel() {
  const { content, update } = useSite();
  const [name, setName] = useState('');

  const setCategories = (categories) => update((prev) => ({ ...prev, categories }));

  const add = () => {
    const title = name.trim();
    if (!title) return;
    setCategories([
      ...content.categories,
      { id: makeId('cat'), title, icon: '/assets/cat2.webp' },
    ]);
    setName('');
  };

  const patch = (id, data) =>
    setCategories(content.categories.map((item) => (item.id === id ? { ...item, ...data } : item)));

  const move = (index, dir) => {
    const next = [...content.categories];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
  };

  const remove = (id) => {
    if (!window.confirm('این دسته‌بندی حذف شود؟')) return;
    setCategories(content.categories.filter((item) => item.id !== id));
  };

  return (
    <AdminPanel
      title="دسته‌بندی‌ها"
      description="کارت‌های دسته‌بندی صفحه اصلی و مگامنوی هدر از این فهرست ساخته می‌شوند."
    >
      <div className="adm-inline-add">
        <TextInput label="نام دسته‌بندی جدید" value={name} onChange={setName} />
        <button type="button" className="adm-btn adm-btn--gold" onClick={add}>
          <Icon name="plus" size={16} />
          افزودن
        </button>
      </div>

      <div className="adm-cards">
        {content.categories.map((category, index) => (
          <EditorCard
            key={category.id}
            title={category.title}
            badge={`${content.products.filter((product) => product.category === category.id).length} غذا`}
            onRemove={() => remove(category.id)}
            tools={
              <>
                <button type="button" className="adm-icon-btn" onClick={() => move(index, -1)} aria-label="بالا">
                  <Icon name="chevronRight" size={16} />
                </button>
                <button type="button" className="adm-icon-btn" onClick={() => move(index, 1)} aria-label="پایین">
                  <Icon name="chevronLeft" size={16} />
                </button>
              </>
            }
          >
            <div className="adm-grid">
              <TextInput
                label="عنوان"
                value={category.title}
                onChange={(value) => patch(category.id, { title: value })}
              />
              <div className="adm-field adm-field--wide">
                <ImageField
                  label="آیکون دسته"
                  value={category.icon}
                  onChange={(value) => patch(category.id, { icon: value })}
                />
              </div>
            </div>
          </EditorCard>
        ))}
        {content.categories.length === 0 ? <EmptyNote>هنوز دسته‌بندی‌ای ثبت نشده است.</EmptyNote> : null}
      </div>
    </AdminPanel>
  );
}
