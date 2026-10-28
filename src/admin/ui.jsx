import { useRef, useState } from 'react';
import Icon from '../components/Icons.jsx';
import { imageFileToDataUrl } from './imageUpload.js';

export function AdminPanel({ title, description, actions, children }) {
  return (
    <section className="adm-panel">
      <header className="adm-panel__head">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {actions ? <div className="adm-panel__actions">{actions}</div> : null}
      </header>
      <div className="adm-panel__body">{children}</div>
    </section>
  );
}

export function Field({ label, hint, wide, children }) {
  return (
    <div className={`adm-field${wide ? ' adm-field--wide' : ''}`}>
      <span className="adm-field__label">{label}</span>
      {children}
      {hint ? <small className="adm-field__hint">{hint}</small> : null}
    </div>
  );
}

export function TextInput({ label, value, onChange, hint, wide, ...rest }) {
  return (
    <Field label={label} hint={hint} wide={wide}>
      <input
        className="adm-input"
        aria-label={label}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        {...rest}
      />
    </Field>
  );
}

export function NumberInput({ label, value, onChange, hint, wide }) {
  return (
    <Field label={label} hint={hint} wide={wide}>
      <input
        className="adm-input adm-input--ltr"
        aria-label={label}
        type="number"
        min="0"
        value={value ?? 0}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function TextArea({ label, value, onChange, rows = 3, hint, wide }) {
  return (
    <Field label={label} hint={hint} wide={wide}>
      <textarea
        className="adm-input adm-textarea"
        aria-label={label}
        rows={rows}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function Select({ label, value, onChange, options, hint, wide }) {
  return (
    <Field label={label} hint={hint} wide={wide}>
      <select
        className="adm-input adm-select"
        aria-label={label}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="adm-toggle">
      <input type="checkbox" checked={!!checked} onChange={(event) => onChange(event.target.checked)} />
      <span aria-hidden="true" />
      <b>{label}</b>
    </label>
  );
}

export function ImageField({ label = 'تصویر', value, onChange, hint }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const dataUrl = await imageFileToDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-image">
      <span className="adm-field__label">{label}</span>
      <div className="adm-image__row">
        <span className="adm-image__preview">
          {value ? <img src={value} alt="" /> : <Icon name="camera" size={22} />}
        </span>
        <div className="adm-image__controls">
          <input
            className="adm-input adm-input--ltr"
            aria-label={`${label} (آدرس تصویر)`}
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/assets/... یا https://..."
            dir="ltr"
          />
          <div className="adm-image__buttons">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => fileRef.current?.click()}>
              <Icon name="camera" size={15} />
              {busy ? 'در حال آماده‌سازی…' : 'انتخاب از سیستم'}
            </button>
            {value ? (
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => onChange('')}>
                حذف تصویر
              </button>
            ) : null}
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />
          {error ? <small className="adm-hint adm-hint--error">{error}</small> : null}
          {hint ? <small className="adm-field__hint">{hint}</small> : null}
        </div>
      </div>
    </div>
  );
}

export function EditorCard({ title, badge, onRemove, children, tools }) {
  return (
    <article className="adm-card">
      <header className="adm-card__head">
        <div>
          <b>{title || 'آیتم جدید'}</b>
          {badge ? <small>{badge}</small> : null}
        </div>
        <div className="adm-card__tools">
          {tools}
          {onRemove ? (
            <button type="button" className="adm-icon-btn" onClick={onRemove} aria-label="حذف">
              <Icon name="trash" size={16} />
            </button>
          ) : null}
        </div>
      </header>
      <div className="adm-card__body">{children}</div>
    </article>
  );
}

export function EmptyNote({ children }) {
  return <p className="adm-empty">{children}</p>;
}

export const makeId = (prefix) => `${prefix}-${Date.now().toString(36)}`;

export const splitLines = (value) =>
  (value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
