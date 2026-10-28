import { useState } from 'react';
import { Fields, ItemsEditor, getIn, setIn } from './fields.jsx';
import DeepEditor from './DeepEditor.jsx';
import { EntryHeader, SaveBar, TabBody, Tabs, useActiveTab } from './EntryForm.jsx';

// A website page: its copy, its sections and its SEO, grouped in tabs.
export function PageEditor({ entry, doc, setDoc, onSave, onCancel, saving, dirty, message }) {
  const [active, setActive] = useActiveTab(entry.tabs);

  return (
    <div className="adm-view">
      <EntryHeader eyebrow="صفحه" title={entry.label} description={entry.description} route={entry.route} />
      <Tabs tabs={entry.tabs} active={active} onChange={setActive} />
      <div className="adm-card adm-card-pad">
        {entry.tabs
          .filter((tab) => tab.id === active)
          .map((tab) => (
            <TabBody key={tab.id} tab={tab} doc={doc} setDoc={setDoc} />
          ))}
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onCancel={onCancel} message={message} />
    </div>
  );
}

// A site-wide section: an object form, a repeatable list, the homepage order or
// the nested service-page content.
export function SectionEditor({ entry, doc, setDoc, onSave, onCancel, saving, dirty, message }) {
  const [active, setActive] = useActiveTab(entry.tabs || []);
  const value = getIn(doc, entry.path);
  const update = (next) => setDoc(setIn(doc, entry.path, next));

  return (
    <div className="adm-view">
      <EntryHeader eyebrow="بخش سایت" title={entry.label} description={entry.description} />
      {entry.tabs ? <Tabs tabs={entry.tabs} active={active} onChange={setActive} /> : null}
      <div className="adm-card adm-card-pad">
        {entry.kind === 'list' ? (
          <ItemsEditor
            fields={entry.itemFields}
            items={value}
            itemLabel={entry.itemLabel}
            onChange={update}
            addLabel="افزودن مورد"
          />
        ) : null}

        {entry.kind === 'object' && entry.tabs ? (
          entry.tabs
            .filter((tab) => tab.id === active)
            .map((tab) => <TabBody key={tab.id} tab={tab} doc={doc} setDoc={setDoc} />)
        ) : null}

        {entry.kind === 'object' && !entry.tabs ? (
          <Fields fields={entry.fields} value={value || {}} onChange={update} />
        ) : null}

        {entry.kind === 'order' ? (
          <TabBody tab={{ id: 'order', path: entry.path, order: true }} doc={doc} setDoc={setDoc} />
        ) : null}

        {entry.kind === 'deep' ? <DeepEditor value={value} onChange={update} /> : null}
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onCancel={onCancel} message={message} />
    </div>
  );
}
