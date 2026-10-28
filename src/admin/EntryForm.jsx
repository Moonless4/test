import { useState } from 'react';
import { Fields, ItemsEditor, OrderField, getIn, setIn } from './fields.jsx';
import { HOME_LAYOUT_OPTIONS } from './schema.js';

// Shared tab strip + body for page, section and collection editors. Each tab
// declares its own data path, so a page can combine several parts of the
// document (copy, sections, SEO) without one form.
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="adm-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          key={tab.id}
          className={`adm-tab${active === tab.id ? ' is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function TabBody({ tab, doc, setDoc }) {
  const value = getIn(doc, tab.path);
  const update = (next) => setDoc(setIn(doc, tab.path, next));

  if (tab.order) {
    return <OrderField value={value} onChange={update} options={HOME_LAYOUT_OPTIONS} />;
  }

  if (tab.list) {
    return (
      <ItemsEditor
        fields={tab.itemFields}
        items={value}
        itemLabel={tab.itemLabel}
        onChange={update}
        addLabel="افزودن مورد"
      />
    );
  }

  return <Fields fields={tab.fields} value={value || {}} onChange={update} />;
}

export function useActiveTab(tabs) {
  const [active, setActive] = useState(tabs?.[0]?.id || '');
  return [tabs.some((tab) => tab.id === active) ? active : tabs?.[0]?.id, setActive];
}

export function EntryHeader({ eyebrow, title, description, actions, route, previewLabel = 'پیش‌نمایش صفحه' }) {
  return (
    <header className="adm-head">
      <div className="adm-head-copy">
        {eyebrow ? <span className="adm-eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p className="adm-muted">{description}</p> : null}
      </div>
      <div className="adm-head-actions">
        {route ? (
          <a className="adm-btn adm-btn-quiet" href={route} target="_blank" rel="noreferrer">
            {previewLabel} ↗
          </a>
        ) : null}
        {actions}
      </div>
    </header>
  );
}

export function SaveBar({ dirty, saving, onSave, onCancel, message }) {
  return (
    <div className="adm-savebar">
      <div className="adm-savebar-note">
        {message ? <span className="adm-ok">{message}</span> : null}
        {!message && dirty ? <span className="adm-dirty">تغییرات ذخیره‌نشده</span> : null}
      </div>
      <div className="adm-head-actions">
        <button type="button" className="adm-btn adm-btn-quiet" onClick={onCancel} disabled={saving}>
          انصراف
        </button>
        <button type="button" className="adm-btn adm-btn-quiet" onClick={() => onSave('continue')} disabled={saving || !dirty}>
          ذخیره و ادامه
        </button>
        <button type="button" className="adm-btn" onClick={() => onSave()} disabled={saving || !dirty}>
          {saving ? 'در حال ذخیره…' : 'ذخیره'}
        </button>
      </div>
    </div>
  );
}
