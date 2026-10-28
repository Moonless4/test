import { useState } from 'react';
import { MediaPicker } from './fields.jsx';

// A structured editor for the four detailed service pages, whose content is
// deeply nested. It walks the saved JSON and renders labelled fields, groups and
// repeatable cards — the administrator never sees brackets, keys or code.

const LABELS = {
  title: 'عنوان',
  subtitle: 'زیرعنوان',
  eyebrow: 'برچسب بالای عنوان',
  kicker: 'برچسب',
  label: 'برچسب',
  text: 'متن',
  body: 'متن',
  lead: 'خلاصه',
  intro: 'معرفی',
  description: 'توضیح',
  caption: 'زیرنویس',
  quote: 'نقل قول',
  name: 'نام',
  role: 'سمت',
  href: 'لینک',
  link: 'لینک',
  cta: 'دعوت به اقدام',
  ctaLabel: 'متن دکمه',
  ctaHref: 'لینک دکمه',
  image: 'تصویر',
  images: 'تصاویر',
  src: 'تصویر',
  bg: 'تصویر پس‌زمینه',
  poster: 'تصویر پوستر',
  icon: 'آیکن',
  value: 'مقدار',
  number: 'عدد',
  unit: 'واحد',
  items: 'موارد',
  points: 'موارد',
  features: 'ویژگی‌ها',
  steps: 'مراحل',
  stats: 'آمار',
  facts: 'مشخصات',
  gallery: 'گالری',
  videos: 'ویدیوها',
  faqs: 'پرسش‌ها',
  question: 'پرسش',
  answer: 'پاسخ',
  stage: 'مرحله',
  title2: 'عنوان دوم',
  note: 'یادداشت',
  year: 'سال',
  area: 'متراژ',
  location: 'موقعیت',
  duration: 'مدت',
};

const TEXTAREA = /(text|body|lead|intro|description|caption|quote|answer|note|excerpt)/i;
const IMAGE_KEY = /(image|images|src|poster|bg|photo|cover|logo)/i;

const isImage = (key, value) => typeof value === 'string' && IMAGE_KEY.test(key) && /^(https?:|\/|data:)/.test(value);

function label(key) {
  return LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ');
}

function updateAt(root, path, next) {
  if (!path.length) return next;
  const [key, ...rest] = path;
  if (Array.isArray(root)) {
    const copy = root.slice();
    copy[key] = updateAt(root[key], rest, next);
    return copy;
  }
  return { ...root, [key]: updateAt(root?.[key], rest, next) };
}

function ImageValue({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="adm-image">
      <div className="adm-image-row">
        <div className="adm-image-thumb">{value ? <img src={value} alt="" /> : <span>—</span>}</div>
        <input className="adm-input" dir="ltr" value={value ?? ''} onChange={(event) => onChange(event.target.value)} />
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

function Primitive({ keyName, value, onChange }) {
  if (typeof value === 'boolean') {
    return (
      <label className="adm-switch">
        <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
        <span className="adm-switch-track" aria-hidden="true" />
        <span className="adm-switch-label">{label(keyName)}</span>
      </label>
    );
  }
  if (typeof value === 'number') {
    return (
      <input
        className="adm-input"
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    );
  }
  if (isImage(keyName, value)) return <ImageValue value={value} onChange={onChange} />;
  if (TEXTAREA.test(keyName) || String(value).length > 110) {
    return (
      <textarea
        className="adm-input adm-textarea"
        rows={4}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
  return (
    <input
      className="adm-input"
      dir={/href|src|slug|url/i.test(keyName) ? 'ltr' : undefined}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function StringList({ value, onChange }) {
  return (
    <div className="adm-stack">
      {value.map((item, index) => (
        <div className="adm-line-row" key={index}>
          <input
            className="adm-input"
            value={item ?? ''}
            onChange={(event) => onChange(value.map((row, i) => (i === index ? event.target.value : row)))}
          />
          <button type="button" className="adm-icon-btn adm-icon-danger" onClick={() => onChange(value.filter((_, i) => i !== index))}>
            ×
          </button>
        </div>
      ))}
      <button type="button" className="adm-btn adm-btn-quiet adm-add" onClick={() => onChange([...value, ''])}>
        + افزودن مورد
      </button>
    </div>
  );
}

function Card({ title, children, open, onToggle, onUp, onDown, onRemove }) {
  return (
    <div className={`adm-item${open ? ' is-open' : ''}`}>
      <div className="adm-item-head">
        <button type="button" className="adm-item-toggle" onClick={onToggle}>
          <span className="adm-item-title">{title}</span>
        </button>
        <div className="adm-row-tools">
          <button type="button" className="adm-icon-btn" onClick={onUp} aria-label="بالا">
            ↑
          </button>
          <button type="button" className="adm-icon-btn" onClick={onDown} aria-label="پایین">
            ↓
          </button>
          <button type="button" className="adm-icon-btn adm-icon-danger" onClick={onRemove} aria-label="حذف">
            ×
          </button>
        </div>
      </div>
      {open ? <div className="adm-item-body">{children}</div> : null}
    </div>
  );
}

function Node({ keyName, value, onChange, depth = 0 }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (value === null || value === undefined || ['string', 'number', 'boolean'].includes(typeof value)) {
    return <Primitive keyName={keyName} value={value} onChange={onChange} />;
  }

  if (Array.isArray(value)) {
    const primitive = value.every((item) => item === null || ['string', 'number'].includes(typeof item));
    if (primitive) return <StringList value={value} onChange={onChange} />;
    const move = (index, delta) => {
      const next = value.slice();
      const target = index + delta;
      if (target < 0 || target >= next.length) return;
      [next[index], next[target]] = [next[target], next[index]];
      onChange(next);
    };
    return (
      <div className="adm-stack">
        {value.map((item, index) => (
          <Card
            key={index}
            title={item?.['title'] || item?.['label'] || item?.['name'] || item?.['question'] || `مورد ${index + 1}`}
            open={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            onUp={() => move(index, -1)}
            onDown={() => move(index, 1)}
            onRemove={() => onChange(value.filter((_, i) => i !== index))}
          >
            <Node
              keyName={keyName}
              value={item}
              depth={depth + 1}
              onChange={(next) => onChange(value.map((row, i) => (i === index ? next : row)))}
            />
          </Card>
        ))}
        <button
          type="button"
          className="adm-btn adm-btn-quiet adm-add"
          onClick={() => onChange([...value, typeof value[0] === 'object' ? structuredClone(value[0] ?? {}) : ''])}
        >
          + افزودن
        </button>
      </div>
    );
  }

  return (
    <div className={`adm-group${depth ? ' adm-group-nested' : ''}`}>
      {Object.entries(value).map(([childKey, childValue]) => (
        <div className="adm-group-row" key={childKey}>
          <span className="adm-label">{label(childKey)}</span>
          <Node
            keyName={childKey}
            value={childValue}
            depth={depth + 1}
            onChange={(next) => onChange({ ...value, [childKey]: next })}
          />
        </div>
      ))}
    </div>
  );
}

export default function DeepEditor({ value, onChange }) {
  if (!value || typeof value !== 'object') return <p className="adm-muted">محتوایی برای ویرایش وجود ندارد.</p>;
  return (
    <div className="adm-deep">
      {Object.entries(value).map(([key, section]) => (
        <details className="adm-deep-section" key={key} open={key === Object.keys(value)[0]}>
          <summary>{label(key)}</summary>
          <div className="adm-deep-body">
            <Node keyName={key} value={section} onChange={(next) => onChange({ ...value, [key]: next })} />
          </div>
        </details>
      ))}
    </div>
  );
}
