import { useState } from 'react';

// Draft helpers: the dashboard edits a copy of the saved document and only the
// section being saved is written back, so an unfinished edit in one tab cannot
// overwrite another section.
export function getIn(root, path) {
  return path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), root);
}

export function setIn(root, path, value) {
  const keys = path.split('.');
  const walk = (node, index) => {
    const key = keys[index];
    const copy = Array.isArray(node) ? node.slice() : { ...(node || {}) };
    if (index === keys.length - 1) copy[key] = value;
    else copy[key] = walk(node?.[key], index + 1);
    return copy;
  };
  return walk(root, 0);
}

const EMPTY = { text: '', textarea: '', url: '', image: '', number: '', switch: false, lines: [''], pairs: [['', '']], json: null };

export function blankItem(fields) {
  return fields.reduce((item, field) => {
    const empty = EMPTY[field.type];
    return setIn(item, field.path, Array.isArray(empty) || empty === null ? structuredClone(empty) : empty);
  }, {});
}

export function JsonField({ value, onChange }) {
  const [text, setText] = useState(() => JSON.stringify(value ?? null, null, 2));
  const [error, setError] = useState('');

  return (
    <div className="adm-json">
      <textarea
        className="adm-input adm-json-area"
        dir="ltr"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          try {
            onChange(JSON.parse(event.target.value));
            setError('');
          } catch (parseError) {
            setError(parseError.message);
          }
        }}
      />
      {error ? <span className="adm-error">JSON نامعتبر: {error}</span> : null}
    </div>
  );
}

function LinesField({ value, onChange }) {
  const lines = Array.isArray(value) ? value : [];
  return (
    <div className="adm-rows">
      {lines.map((line, index) => (
        <div className="adm-row" key={index}>
          <input
            className="adm-input"
            value={line}
            onChange={(event) => onChange(lines.map((item, i) => (i === index ? event.target.value : item)))}
          />
          <button type="button" className="adm-remove" onClick={() => onChange(lines.filter((_, i) => i !== index))}>
            حذف
          </button>
        </div>
      ))}
      <button type="button" className="adm-add" onClick={() => onChange([...lines, ''])}>
        + افزودن
      </button>
    </div>
  );
}

function PairsField({ value, onChange }) {
  const pairs = Array.isArray(value) ? value : [];
  return (
    <div className="adm-rows">
      {pairs.map((pair, index) => (
        <div className="adm-row" key={index}>
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
          <button type="button" className="adm-remove" onClick={() => onChange(pairs.filter((_, i) => i !== index))}>
            حذف
          </button>
        </div>
      ))}
      <button type="button" className="adm-add" onClick={() => onChange([...pairs, ['', '']])}>
        + افزودن ردیف
      </button>
    </div>
  );
}

export function ItemsEditor({ fields, items, itemLabel, onChange, addLabel = 'افزودن مورد' }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div className="adm-items">
      {list.map((item, index) => (
        <div className="adm-item" key={index}>
          <div className="adm-item-head">
            <strong>{item?.[itemLabel] || `مورد ${index + 1}`}</strong>
            <div className="adm-item-actions">
              <button
                type="button"
                className="adm-ghost"
                disabled={index === 0}
                onClick={() => {
                  const next = list.slice();
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  onChange(next);
                }}
              >
                ↑
              </button>
              <button
                type="button"
                className="adm-ghost"
                disabled={index === list.length - 1}
                onClick={() => {
                  const next = list.slice();
                  [next[index + 1], next[index]] = [next[index], next[index + 1]];
                  onChange(next);
                }}
              >
                ↓
              </button>
              <button type="button" className="adm-remove" onClick={() => onChange(list.filter((_, i) => i !== index))}>
                حذف
              </button>
            </div>
          </div>
          <Fields fields={fields} value={item} onChange={(next) => onChange(list.map((it, i) => (i === index ? next : it)))} />
        </div>
      ))}
      <button type="button" className="adm-add" onClick={() => onChange([...list, blankItem(fields)])}>
        + {addLabel}
      </button>
    </div>
  );
}

function Field({ field, value, onChange }) {
  const { type, label, hint, path } = field;

  if (type === 'switch') {
    return (
      <label className="adm-field adm-field-switch">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
        <span>{label}</span>
      </label>
    );
  }

  if (type === 'json') return <JsonField key={`${path}-json`} value={value} onChange={onChange} />;
  if (type === 'lines') return <LinesField value={value} onChange={onChange} />;
  if (type === 'pairs') return <PairsField value={value} onChange={onChange} />;
  if (type === 'list') return <ItemsEditor fields={field.itemFields} items={value} itemLabel={field.itemLabel} onChange={onChange} />;

  if (type === 'textarea') {
    return <textarea className="adm-input adm-textarea" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }

  return (
    <input
      className="adm-input"
      dir={type === 'url' || type === 'image' ? 'ltr' : undefined}
      type={type === 'number' ? 'number' : 'text'}
      value={value ?? ''}
      onChange={(event) => onChange(type === 'number' ? Number(event.target.value) : event.target.value)}
    />
  );
}

export function Fields({ fields, value, onChange }) {
  return (
    <div className="adm-grid">
      {fields.map((field) => (
        <label className={`adm-field${field.type === 'textarea' || field.type === 'json' || field.type === 'list' || field.type === 'lines' || field.type === 'pairs' ? ' adm-field-wide' : ''}`} key={field.path}>
          <span className="adm-label">
            {field.label}
            {field.hint ? <em className="adm-hint">{field.hint}</em> : null}
          </span>
          <Field
            field={field}
            value={value === undefined ? undefined : getIn(value, field.path)}
            onChange={(next) => onChange(setIn(value || {}, field.path, next))}
          />
        </label>
      ))}
    </div>
  );
}

export function ObjectEditor({ fields, value, onChange }) {
  return <Fields fields={fields} value={value || {}} onChange={onChange} />;
}
