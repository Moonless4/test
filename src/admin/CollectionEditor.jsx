import { useMemo, useState } from 'react';
import { blankItem, getIn, setIn } from './fields.jsx';
import { EntryHeader, SaveBar, TabBody, Tabs, useActiveTab } from './EntryForm.jsx';

const titleOf = (item, key) => item?.[key] || 'بدون عنوان';
const itemVisible = (item) => item?.visible !== false && item?.published !== false;

// Master–detail editor for the repeatable content: the list on one side, the
// tabbed editor for the selected item on the other.
export function CollectionEditor({ entry, doc, setDoc, onSave, onCancel, saving, dirty, message, initialSlug }) {
  const items = Array.isArray(getIn(doc, entry.path)) ? getIn(doc, entry.path) : [];
  const [selected, setSelected] = useState(() => {
    const index = items.findIndex((item) => item.slug === initialSlug);
    return index >= 0 ? index : 0;
  });
  const [query, setQuery] = useState('');
  const [active, setActive] = useActiveTab(entry.tabs);

  const fields = useMemo(() => entry.tabs.flatMap((tab) => tab.fields || []), [entry]);
  const visibleItems = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => titleOf(item, entry.itemLabel).toLowerCase().includes(query.trim().toLowerCase()));

  const index = Math.min(Math.max(selected, 0), Math.max(items.length - 1, 0));
  const current = items[index];

  const write = (next) => setDoc(setIn(doc, entry.path, next));

  const updateItem = (next) => write(items.map((item, i) => (i === index ? next : item)));

  const addItem = () => {
    const created = { ...blankItem(fields), title: 'بدون عنوان', slug: `item-${Date.now()}` };
    write([...items, created]);
    setSelected(items.length);
  };

  const removeItem = () => {
    if (!current) return;
    if (!window.confirm(`${titleOf(current, entry.itemLabel)} حذف شود؟`)) return;
    write(items.filter((_, i) => i !== index));
    setSelected(Math.max(0, index - 1));
  };

  const moveItem = (delta) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    [next[index], next[target]] = [next[target], next[index]];
    write(next);
    setSelected(target);
  };

  const preview = current ? entry.preview?.(current) : null;

  return (
    <div className="adm-view">
      <EntryHeader
        eyebrow="محتوا"
        title={entry.label}
        description={entry.description}
        actions={
          <button type="button" className="adm-btn" onClick={addItem}>
            + {entry.addLabel}
          </button>
        }
      />

      <div className="adm-split">
        <aside className="adm-list-pane">
          <div className="adm-list-head">
            <input
              className="adm-input adm-search"
              placeholder="جستجو…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span className="adm-count">{items.length}</span>
          </div>
          <div className="adm-list">
            {visibleItems.map(({ item, index: itemIndex }) => (
              <button
                type="button"
                key={itemIndex}
                className={`adm-list-item${itemIndex === index ? ' is-active' : ''}`}
                onClick={() => setSelected(itemIndex)}
              >
                <span className="adm-list-thumb">{item.image ? <img src={item.image} alt="" loading="lazy" /> : null}</span>
                <span className="adm-list-copy">
                  <strong>{titleOf(item, entry.itemLabel)}</strong>
                  <em>{item.category || item.status || item.slug || `مورد ${itemIndex + 1}`}</em>
                </span>
                <span className={`adm-dot${itemVisible(item) ? ' is-on' : ''}`} title={itemVisible(item) ? 'نمایش' : 'پنهان'} />
              </button>
            ))}
            {!visibleItems.length ? <p className="adm-muted adm-empty">موردی پیدا نشد.</p> : null}
          </div>
        </aside>

        <section className="adm-editor-pane">
          {current ? (
            <>
              <div className="adm-editor-head">
                <div>
                  <span className="adm-eyebrow">در حال ویرایش</span>
                  <h2>{titleOf(current, entry.itemLabel)}</h2>
                </div>
                <div className="adm-head-actions">
                  {preview ? (
                    <a className="adm-btn adm-btn-quiet" href={preview} target="_blank" rel="noreferrer">
                      پیش‌نمایش ↗
                    </a>
                  ) : null}
                  <button type="button" className="adm-icon-btn" disabled={index === 0} onClick={() => moveItem(-1)} aria-label="بالا">
                    ↑
                  </button>
                  <button
                    type="button"
                    className="adm-icon-btn"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(1)}
                    aria-label="پایین"
                  >
                    ↓
                  </button>
                  <button type="button" className="adm-btn adm-btn-danger" onClick={removeItem}>
                    حذف
                  </button>
                </div>
              </div>

              <Tabs tabs={entry.tabs} active={active} onChange={setActive} />
              <div className="adm-card adm-card-pad">
                {entry.tabs
                  .filter((tab) => tab.id === active)
                  .map((tab) => (
                    <TabBody key={tab.id} tab={tab} doc={current} setDoc={updateItem} />
                  ))}
              </div>
            </>
          ) : (
            <div className="adm-empty-state">
              <p>هنوز موردی وجود ندارد.</p>
              <button type="button" className="adm-btn" onClick={addItem}>
                + {entry.addLabel}
              </button>
            </div>
          )}
        </section>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onCancel={onCancel} message={message} />
    </div>
  );
}
