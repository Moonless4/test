import { useEffect, useState } from 'react';
import { getMedia } from './api.js';

// Draft helpers: the dashboard edits a copy of the saved document and only the
// root keys of the current entry are written back, so an unfinished edit in one
// area cannot overwrite another.
export function getIn(root, path) {
  if (!path) return root;
  return path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), root);
}

export function setIn(root, path, value) {
  if (!path) return value;
  const keys = String(path).split('.');
  const walk = (node, index) => {
    const key = keys[index];
    const copy = Array.isArray(node) ? node.slice() : { ...(node || {}) };
    if (index === keys.length - 1) copy[key] = value;
    else copy[key] = walk(node?.[key], index + 1);
    return copy;
  };
  return walk(root, 0);
}

const EMPTY = {
  text: '',
  textarea: '',
  richtext: '',
  url: '',
  image: '',
  number: '',
  switch: true,
  select: '',
  lines: [''],
  images: [''],
  pairs: [['', '']],
  list: [],
  blocks: [{ type: 'p', text: '' }],
  menu: [],
  order: [],
};

export function blankItem(fields = []) {
  return fields.reduce((item, field) => {
    const empty = field.type === 'switch' ? field.default ?? false : EMPTY[field.type] ?? '';
    return setIn(item, field.path, Array.isArray(empty) || empty === null ? structuredClone(empty) : empty);
  }, {});
}

/* ------------------------------------------------------------------ media */

let mediaCache = null;

export function useMediaLibrary() {
  const [media, setMedia] = useState(mediaCache || []);
  const [loading, setLoading] = useState(!mediaCache);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMedia();
      mediaCache = data.media || [];
      setMedia(mediaCache);
    } catch {
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mediaCache) load();
  }, []);

  return { media, loading, reload: load, setMedia };
}

export function invalidateMediaCache() {
  mediaCache = null;
}

export function MediaPicker({ onPick, onClose }) {
  const { media, loading } = useMediaLibrary();
  const [query, setQuery] = useState('');
  const filtered = media.filter((item) => item.name?.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="adm-modal" role="dialog" aria-modal="true" aria-label="انتخاب تصویر">
      <div className="adm-modal-card">
        <header className="adm-modal-head">
          <div>
            <span className="adm-eyebrow">کتابخانهٔ رسانه</span>
            <h3>انتخاب تصویر</h3>
          </div>
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="بستن">
            ×
          </button>
        </header>
        <input
          className="adm-input adm-search"
          placeholder="جستجوی نام فایل…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="adm-picker-grid">
          {loading ? <p className="adm-muted">در حال بارگذاری…</p> : null}
          {!loading && !filtered.length ? (
            <p className="adm-muted">تصویری پیدا نشد. از بخش «کتابخانهٔ رسانه» تصویر جدید اضافه کنید.</p>
          ) : null}
          {filtered.map((item) => (
            <button type="button" className="adm-picker-item" key={item.id} onClick={() => onPick(item.url)}>
              <img src={item.url} alt={item.name} loading="lazy" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageInput({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="adm-image">
      <div className="adm-image-row">
        <div className="adm-image-thumb">{value ? <img src={value} alt="" /> : <span>—</span>}</div>
        <input
          className="adm-input"
          dir="ltr"
          value={value ?? ''}
          placeholder="/img/…"
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" className="adm-btn adm-btn-quiet" onClick={() => setOpen(true)}>
          کتابخانه
        </button>
      </div>
      {open ? (
        <MediaPicker
          onClose={() => setOpen(false)}
          onPick={(url) => {
            onChange(url);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- arrays */

function ListRows({ children, onAdd, addLabel }) {
  return (
    <div className="adm-stack">
      {children}
      <button type="button" className="adm-btn adm-btn-quiet adm-add" onClick={onAdd}>
        + {addLabel}
      </button>
    </div>
  );
}

function move(list, index, delta) {
  const next = list.slice();
  const target = index + delta;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function RowTools({ index, length, onChange, onRemove }) {
  return (
    <div className="adm-row-tools">
      <button type="button" className="adm-icon-btn" disabled={index === 0} onClick={() => onChange(-1)} aria-label="بالا">
        ↑
      </button>
      <button type="button" className="adm-icon-btn" disabled={index === length - 1} onClick={() => onChange(1)} aria-label="پایین">
        ↓
      </button>
      <button type="button" className="adm-icon-btn adm-icon-danger" onClick={onRemove} aria-label="حذف">
        ×
      </button>
    </div>
  );
}

function LinesField({ value, onChange, images = false }) {
  const list = Array.isArray(value) ? value : [];
  return (
    <ListRows onAdd={() => onChange([...list, ''])} addLabel={images ? 'افزودن تصویر' : 'افزودن خط'}>
      {list.map((line, index) => (
        <div className="adm-line-row" key={index}>
          {images ? <div className="adm-mini-thumb">{line ? <img src={line} alt="" /> : null}</div> : null}
          <input
            className="adm-input"
            dir={images ? 'ltr' : undefined}
            value={line ?? ''}
            onChange={(event) => onChange(list.map((item, i) => (i === index ? event.target.value : item)))}
          />
          <RowTools
            index={index}
            length={list.length}
            onChange={(delta) => onChange(move(list, index, delta))}
            onRemove={() => onChange(list.filter((_, i) => i !== index))}
          />
        </div>
      ))}
    </ListRows>
  );
}

function PairsField({ value, onChange }) {
  const pairs = Array.isArray(value) ? value : [];
  return (
    <ListRows onAdd={() => onChange([...pairs, ['', '']])} addLabel="افزودن ردیف">
      {pairs.map((pair, index) => (
        <div className="adm-pair-row" key={index}>
          <input
            className="adm-input"
            value={pair?.[0] ?? ''}
            placeholder="عنوان"
            onChange={(event) =>
              onChange(pairs.map((item, i) => (i === index ? [event.target.value, item?.[1] ?? ''] : item)))
            }
          />
          <input
            className="adm-input"
            value={pair?.[1] ?? ''}
            placeholder="مقدار"
            onChange={(event) =>
              onChange(pairs.map((item, i) => (i === index ? [item?.[0] ?? '', event.target.value] : item)))
            }
          />
          <RowTools
            index={index}
            length={pairs.length}
            onChange={(delta) => onChange(move(pairs, index, delta))}
            onRemove={() => onChange(pairs.filter((_, i) => i !== index))}
          />
        </div>
      ))}
    </ListRows>
  );
}

export function ItemsEditor({ fields, items, itemLabel = 'title', onChange, addLabel = 'افزودن مورد' }) {
  const list = Array.isArray(items) ? items : [];
  const [openIndex, setOpenIndex] = useState(0);

  const update = (index, next) => onChange(list.map((item, i) => (i === index ? next : item)));

  return (
    <ListRows onAdd={() => onChange([...list, blankItem(fields)])} addLabel={addLabel}>
      {list.map((item, index) => {
        const open = openIndex === index;
        return (
          <div className={`adm-item${open ? ' is-open' : ''}`} key={index}>
            <div className="adm-item-head">
              <button type="button" className="adm-item-toggle" onClick={() => setOpenIndex(open ? -1 : index)}>
                <span className="adm-item-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="adm-item-title">{item?.[itemLabel] || 'بدون عنوان'}</span>
              </button>
              <RowTools
                index={index}
                length={list.length}
                onChange={(delta) => onChange(move(list, index, delta))}
                onRemove={() => onChange(list.filter((_, i) => i !== index))}
              />
            </div>
            {open ? (
              <div className="adm-item-body">
                <Fields fields={fields} value={item} onChange={(next) => update(index, next)} />
              </div>
            ) : null}
          </div>
        );
      })}
    </ListRows>
  );
}

/* --------------------------------------------------------------- blocks */

const BLOCK_TYPES = [
  ['p', 'پاراگراف'],
  ['h2', 'سرتیتر'],
  ['h3', 'زیرتیتر'],
  ['quote', 'نقل قول'],
  ['list', 'فهرست'],
  ['checklist', 'چک‌لیست'],
  ['img', 'تصویر'],
  ['cta', 'دعوت به اقدام'],
];

function Block({ block, index, onChange }) {
  const set = (patch) => onChange({ ...block, ...patch });
  return (
    <div className="adm-block">
      <div className="adm-block-head">
        <span className="adm-item-index">{String(index + 1).padStart(2, '0')}</span>
        <select className="adm-select" value={block.type || 'p'} onChange={(event) => set({ type: event.target.value })}>
          {BLOCK_TYPES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {['p', 'h2', 'h3', 'quote'].includes(block.type) ? (
        <textarea
          className="adm-input adm-textarea"
          rows={block.type === 'p' || block.type === 'quote' ? 4 : 2}
          value={block.text ?? ''}
          onChange={(event) => set({ text: event.target.value })}
        />
      ) : null}
      {block.type === 'list' ? (
        <LinesField value={block.items || []} onChange={(items) => set({ items })} />
      ) : null}
      {block.type === 'checklist' ? (
        <div className="adm-stack">
          <input className="adm-input" placeholder="عنوان چک‌لیست" value={block.title ?? ''} onChange={(event) => set({ title: event.target.value })} />
          <LinesField value={block.items || []} onChange={(items) => set({ items })} />
        </div>
      ) : null}
      {block.type === 'img' ? (
        <div className="adm-stack">
          <ImageInput value={block.src} onChange={(src) => set({ src })} />
          <input className="adm-input" placeholder="توضیح تصویر" value={block.alt ?? ''} onChange={(event) => set({ alt: event.target.value })} />
          <input className="adm-input" placeholder="زیرنویس" value={block.caption ?? ''} onChange={(event) => set({ caption: event.target.value })} />
        </div>
      ) : null}
      {block.type === 'cta' ? (
        <div className="adm-stack">
          <textarea className="adm-input adm-textarea" rows={2} placeholder="متن" value={block.text ?? ''} onChange={(event) => set({ text: event.target.value })} />
          <input className="adm-input" placeholder="متن دکمه" value={block.label ?? ''} onChange={(event) => set({ label: event.target.value })} />
          <input className="adm-input" dir="ltr" placeholder="/consultation" value={block.href ?? ''} onChange={(event) => set({ href: event.target.value })} />
        </div>
      ) : null}
      <div className="adm-block-actions">
        <button type="button" className="adm-btn adm-btn-quiet" onClick={() => onChange({ ...block })} hidden />
      </div>
    </div>
  );
}

function BlocksField({ value, onChange }) {
  const blocks = Array.isArray(value) ? value : [];
  return (
    <ListRows onAdd={() => onChange([...blocks, { type: 'p', text: '' }])} addLabel="افزودن بلوک">
      {blocks.map((block, index) => (
        <div className="adm-block-wrap" key={index}>
          <Block
            block={block}
            index={index}
            onChange={(next) => onChange(blocks.map((item, i) => (i === index ? next : item)))}
          />
          <RowTools
            index={index}
            length={blocks.length}
            onChange={(delta) => onChange(move(blocks, index, delta))}
            onRemove={() => onChange(blocks.filter((_, i) => i !== index))}
          />
        </div>
      ))}
    </ListRows>
  );
}

/* ------------------------------------------------------------------ menu */

function MenuField({ value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const update = (index, next) => onChange(items.map((item, i) => (i === index ? next : item)));

  return (
    <ListRows onAdd={() => onChange([...items, { label: '', href: '/', enabled: true, icon: '', children: [] }])} addLabel="افزودن آیتم منو">
      {items.map((item, index) => {
        const children = Array.isArray(item.children) ? item.children : [];
        return (
          <div className="adm-menu-item" key={index}>
            <div className="adm-menu-head">
              <span className="adm-item-index">{String(index + 1).padStart(2, '0')}</span>
              <strong>{item.label || 'آیتم بدون نام'}</strong>
              <label className="adm-inline-switch">
                <input
                  type="checkbox"
                  checked={item.enabled !== false}
                  onChange={(event) => update(index, { ...item, enabled: event.target.checked })}
                />
                <span>نمایش</span>
              </label>
              <RowTools
                index={index}
                length={items.length}
                onChange={(delta) => onChange(move(items, index, delta))}
                onRemove={() => onChange(items.filter((_, i) => i !== index))}
              />
            </div>
            <div className="adm-grid adm-grid-tight">
              <label className="adm-field">
                <span className="adm-label">عنوان</span>
                <input className="adm-input" value={item.label ?? ''} onChange={(event) => update(index, { ...item, label: event.target.value })} />
              </label>
              <label className="adm-field">
                <span className="adm-label">لینک</span>
                <input className="adm-input" dir="ltr" value={item.href ?? ''} onChange={(event) => update(index, { ...item, href: event.target.value })} />
              </label>
              <label className="adm-field">
                <span className="adm-label">آیکن (اختیاری)</span>
                <input className="adm-input" dir="ltr" placeholder="luxina-icon-home-5" value={item.icon ?? ''} onChange={(event) => update(index, { ...item, icon: event.target.value })} />
              </label>
            </div>
            <div className="adm-submenu">
              <span className="adm-label">زیرمنو {children.length ? `(${children.length})` : ''}</span>
              {children.map((child, childIndex) => (
                <div className="adm-submenu-row" key={childIndex}>
                  <input
                    className="adm-input"
                    placeholder="عنوان"
                    value={child.label ?? ''}
                    onChange={(event) =>
                      update(index, {
                        ...item,
                        children: children.map((c, i) => (i === childIndex ? { ...c, label: event.target.value } : c)),
                      })
                    }
                  />
                  <input
                    className="adm-input"
                    dir="ltr"
                    placeholder="/link"
                    value={child.href ?? ''}
                    onChange={(event) =>
                      update(index, {
                        ...item,
                        children: children.map((c, i) => (i === childIndex ? { ...c, href: event.target.value } : c)),
                      })
                    }
                  />
                  <label className="adm-inline-switch">
                    <input
                      type="checkbox"
                      checked={child.enabled !== false}
                      onChange={(event) =>
                        update(index, {
                          ...item,
                          children: children.map((c, i) => (i === childIndex ? { ...c, enabled: event.target.checked } : c)),
                        })
                      }
                    />
                    <span>نمایش</span>
                  </label>
                  <button
                    type="button"
                    className="adm-icon-btn adm-icon-danger"
                    onClick={() => update(index, { ...item, children: children.filter((_, i) => i !== childIndex) })}
                    aria-label="حذف"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="adm-btn adm-btn-quiet adm-add"
                onClick={() => update(index, { ...item, children: [...children, { label: '', href: '/', enabled: true }] })}
              >
                + افزودن زیرمنو
              </button>
            </div>
          </div>
        );
      })}
    </ListRows>
  );
}

/* ----------------------------------------------------------------- order */

export function OrderField({ value, onChange, options }) {
  const list = Array.isArray(value) && value.length ? value : (options || []).map(([id]) => ({ id, enabled: true }));
  const known = new Set(list.map((item) => item.id));
  const full = [...list, ...(options || []).filter(([id]) => !known.has(id)).map(([id]) => ({ id, enabled: true }))];
  const labels = Object.fromEntries(options || []);
  const update = (next) => onChange(next);

  return (
    <div className="adm-order">
      <p className="adm-muted">با فلش‌ها ترتیب نمایش را تغییر دهید. بخش خاموش در سایت دیده نمی‌شود.</p>
      {full.map((item, index) => (
        <div className="adm-order-row" key={item.id}>
          <span className="adm-item-index">{String(index + 1).padStart(2, '0')}</span>
          <span className="adm-order-label">{labels[item.id] || item.id}</span>
          <label className="adm-inline-switch">
            <input
              type="checkbox"
              checked={item.enabled !== false}
              onChange={(event) => update(full.map((row, i) => (i === index ? { ...row, enabled: event.target.checked } : row)))}
            />
            <span>نمایش</span>
          </label>
          <RowTools
            index={index}
            length={full.length}
            onChange={(delta) => update(move(full, index, delta))}
            onRemove={() => update(full.filter((_, i) => i !== index))}
          />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ field */

function Field({ field, value, onChange }) {
  const { type, label, hint, options } = field;

  if (type === 'switch') {
    const checked = value === undefined ? Boolean(field.default) : Boolean(value);
    return (
      <label className="adm-switch">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <span className="adm-switch-track" aria-hidden="true" />
        <span className="adm-switch-label">{label}</span>
      </label>
    );
  }

  if (type === 'image') return <ImageInput value={value} onChange={onChange} />;
  if (type === 'lines') return <LinesField value={value} onChange={onChange} />;
  if (type === 'images') return <LinesField value={value} onChange={onChange} images />;
  if (type === 'pairs') return <PairsField value={value} onChange={onChange} />;
  if (type === 'list') {
    return (
      <ItemsEditor
        fields={field.itemFields}
        items={value}
        itemLabel={field.itemLabel}
        onChange={onChange}
        addLabel={`افزودن ${field.itemLabel === 'name' ? 'عضو' : 'مورد'}`}
      />
    );
  }
  if (type === 'blocks') return <BlocksField value={value} onChange={onChange} />;
  if (type === 'menu') return <MenuField value={value} onChange={onChange} />;
  if (type === 'order') return <OrderField value={value} onChange={onChange} options={field.options} />;

  if (type === 'select') {
    return (
      <select className="adm-select" value={value ?? ''} onChange={(event) => onChange(event.target.value)}>
        {(options || []).map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    );
  }

  if (type === 'textarea' || type === 'richtext') {
    return (
      <textarea
        className={`adm-input ${type === 'richtext' ? 'adm-richtext' : 'adm-textarea'}`}
        rows={type === 'richtext' ? 12 : 4}
        value={value ?? ''}
        placeholder={hint}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <input
      className="adm-input"
      dir={type === 'url' ? 'ltr' : undefined}
      type={type === 'number' ? 'number' : 'text'}
      value={value ?? ''}
      placeholder={hint}
      onChange={(event) => onChange(type === 'number' ? Number(event.target.value) : event.target.value)}
    />
  );
}

const WIDE = new Set(['textarea', 'richtext', 'list', 'lines', 'images', 'pairs', 'blocks', 'menu', 'order']);

export function Fields({ fields = [], value, onChange }) {
  return (
    <div className="adm-grid">
      {fields.map((field) => (
        <div className={`adm-field${WIDE.has(field.type) ? ' adm-field-wide' : ''}`} key={field.path}>
          {field.type !== 'switch' ? (
            <span className="adm-label">
              {field.label}
              {field.hint ? <em className="adm-hint">{field.hint}</em> : null}
            </span>
          ) : null}
          <Field
            field={field}
            value={value === undefined ? undefined : getIn(value, field.path)}
            onChange={(next) => onChange(setIn(value || {}, field.path, next))}
          />
        </div>
      ))}
    </div>
  );
}
