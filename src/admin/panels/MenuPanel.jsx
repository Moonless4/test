import { useState } from 'react';
import { useSite } from '../../site/SiteContent.jsx';
import Icon from '../../components/Icons.jsx';
import { AdminPanel, EmptyNote, EditorCard, TextInput, makeId } from '../ui.jsx';

export default function MenuPanel() {
  const { content, update } = useSite();
  const [name, setName] = useState('');

  const setFilters = (menuFilters) => update((prev) => ({ ...prev, menuFilters }));

  const add = () => {
    const title = name.trim();
    if (!title) return;
    setFilters([...content.menuFilters, { id: makeId('filter'), title }]);
    setName('');
  };

  const patch = (id, title) =>
    setFilters(content.menuFilters.map((item) => (item.id === id ? { ...item, title } : item)));

  const move = (index, dir) => {
    const next = [...content.menuFilters];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setFilters(next);
  };

  const remove = (id) => {
    if (id === 'all') return;
    if (!window.confirm('این فیلتر از منو حذف شود؟')) return;
    setFilters(content.menuFilters.filter((item) => item.id !== id));
  };

  return (
    <AdminPanel
      title="منو"
      description="فیلترهای بالای صفحه منو و ترتیب نمایش آن‌ها. دسته‌بندی هر غذا در بخش «غذاها» انتخاب می‌شود."
    >
      <div className="adm-inline-add">
        <TextInput label="فیلتر جدید" value={name} onChange={setName} />
        <button type="button" className="adm-btn adm-btn--gold" onClick={add}>
          <Icon name="plus" size={16} />
          افزودن
        </button>
      </div>

      <div className="adm-rows">
        {content.menuFilters.map((filter, index) => {
          const count =
            filter.id === 'all'
              ? content.products.length
              : content.products.filter((product) => product.category === filter.id).length;
          return (
            <div className="adm-row" key={filter.id}>
              <span className="adm-row__index">{(index + 1).toLocaleString('fa-IR')}</span>
              <div className="adm-row__copy adm-row__copy--input">
                <input
                  className="adm-input"
                  aria-label="عنوان فیلتر"
                  value={filter.title}
                  onChange={(event) => patch(filter.id, event.target.value)}
                />
                <small>
                  {count.toLocaleString('fa-IR')} غذا
                  {filter.id === 'all' ? ' (همه)' : ''}
                </small>
              </div>
              <div className="adm-row__tools">
                <button type="button" className="adm-icon-btn" onClick={() => move(index, -1)} aria-label="بالا">
                  <Icon name="chevronRight" size={16} />
                </button>
                <button type="button" className="adm-icon-btn" onClick={() => move(index, 1)} aria-label="پایین">
                  <Icon name="chevronLeft" size={16} />
                </button>
                {filter.id !== 'all' ? (
                  <button type="button" className="adm-icon-btn" onClick={() => remove(filter.id)} aria-label="حذف">
                    <Icon name="trash" size={16} />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
        {content.menuFilters.length === 0 ? <EmptyNote>فیلتری ثبت نشده است.</EmptyNote> : null}
      </div>
    </AdminPanel>
  );
}
