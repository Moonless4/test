import { useSite } from '../../site/SiteContent.jsx';
import Icon from '../../components/Icons.jsx';
import { AdminPanel, EditorCard, EmptyNote, Select, TextArea, TextInput, makeId } from '../ui.jsx';

const socialIcons = ['instagram', 'telegram', 'whatsapp', 'youtube'].map((icon) => ({ value: icon, label: icon }));
const badgeIcons = [
  'shield',
  'fork',
  'truck',
  'check',
  'star',
  'leaf',
  'chef',
  'scooter',
  'sparkle',
  'gift',
  'heart',
].map((icon) => ({ value: icon, label: icon }));

export default function FooterPanel() {
  const { content, update } = useSite();
  const footer = content.footer;

  const setFooter = (patch) => update((prev) => ({ ...prev, footer: { ...prev.footer, ...patch } }));

  const patchColumn = (index, data) =>
    setFooter({
      columns: footer.columns.map((column, columnIndex) =>
        columnIndex === index ? { ...column, ...data } : column
      ),
    });

  const patchSocial = (id, data) =>
    setFooter({
      socials: footer.socials.map((social) => (social.id === id ? { ...social, ...data } : social)),
    });

  const patchBadge = (id, data) =>
    setFooter({ badges: footer.badges.map((badge) => (badge.id === id ? { ...badge, ...data } : badge)) });

  const patchLegal = (index, data) =>
    setFooter({
      legalLinks: footer.legalLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, ...data } : link
      ),
    });

  return (
    <AdminPanel
      title="فوتر سایت"
      description="ستون‌های لینک، شبکه‌های اجتماعی، نشان‌های اعتماد و لینک‌های پایین صفحه."
    >
      <h3 className="adm-subtitle">ستون‌های فوتر</h3>
      <div className="adm-cards">
        {footer.columns.map((column, index) => (
          <EditorCard
            key={`${column.title}-${index}`}
            title={column.title}
            badge={`${column.links.length} لینک`}
            onRemove={() => {
              if (!window.confirm('این ستون حذف شود؟')) return;
              setFooter({ columns: footer.columns.filter((_, columnIndex) => columnIndex !== index) });
            }}
          >
            <div className="adm-grid">
              <TextInput
                label="عنوان ستون"
                value={column.title}
                onChange={(value) => patchColumn(index, { title: value })}
              />
              <TextArea
                label="لینک‌ها"
                value={column.links.join('\n')}
                onChange={(value) =>
                  patchColumn(index, {
                    links: value.split('\n').map((line) => line.trim()).filter(Boolean),
                  })
                }
                rows={6}
                wide
                hint="هر لینک در یک خط. برای آدرس دلخواه از قالب «برچسب|/menu» استفاده کنید."
              />
            </div>
          </EditorCard>
        ))}
      </div>
      <button
        type="button"
        className="adm-btn adm-btn--ghost"
        onClick={() => setFooter({ columns: [...footer.columns, { title: 'ستون جدید', links: [] }] })}
      >
        <Icon name="plus" size={16} />
        افزودن ستون
      </button>

      <h3 className="adm-subtitle">شبکه‌های اجتماعی</h3>
      <div className="adm-cards">
        {footer.socials.map((social) => (
          <EditorCard
            key={social.id}
            title={social.label}
            onRemove={() => {
              if (!window.confirm('این شبکه حذف شود؟')) return;
              setFooter({ socials: footer.socials.filter((item) => item.id !== social.id) });
            }}
          >
            <div className="adm-grid">
              <TextInput
                label="نام"
                value={social.label}
                onChange={(value) => patchSocial(social.id, { label: value })}
              />
              <Select
                label="آیکون"
                value={social.icon}
                onChange={(value) => patchSocial(social.id, { icon: value })}
                options={socialIcons}
              />
              <TextInput
                label="لینک"
                value={social.href}
                onChange={(value) => patchSocial(social.id, { href: value })}
                dir="ltr"
                wide
              />
            </div>
          </EditorCard>
        ))}
        {footer.socials.length === 0 ? <EmptyNote>شبکه‌ای ثبت نشده است.</EmptyNote> : null}
      </div>
      <button
        type="button"
        className="adm-btn adm-btn--ghost"
        onClick={() =>
          setFooter({
            socials: [
              ...footer.socials,
              { id: makeId('social'), label: 'شبکه جدید', icon: 'instagram', href: '#' },
            ],
          })
        }
      >
        <Icon name="plus" size={16} />
        افزودن شبکه اجتماعی
      </button>

      <h3 className="adm-subtitle">نمادها و نشان‌های اعتماد</h3>
      <div className="adm-cards">
        {footer.badges.map((badge) => (
          <EditorCard
            key={badge.id}
            title={badge.title}
            onRemove={() => {
              if (!window.confirm('این نشان حذف شود؟')) return;
              setFooter({ badges: footer.badges.filter((item) => item.id !== badge.id) });
            }}
          >
            <div className="adm-grid">
              <TextInput
                label="عنوان"
                value={badge.title}
                onChange={(value) => patchBadge(badge.id, { title: value })}
              />
              <TextInput
                label="زیرنویس"
                value={badge.subtitle}
                onChange={(value) => patchBadge(badge.id, { subtitle: value })}
              />
              <Select
                label="آیکون"
                value={badge.icon}
                onChange={(value) => patchBadge(badge.id, { icon: value })}
                options={badgeIcons}
              />
            </div>
          </EditorCard>
        ))}
      </div>
      <button
        type="button"
        className="adm-btn adm-btn--ghost"
        onClick={() =>
          setFooter({
            badges: [
              ...footer.badges,
              { id: makeId('badge'), icon: 'shield', title: 'نشان جدید', subtitle: 'توضیح کوتاه' },
            ],
          })
        }
      >
        <Icon name="plus" size={16} />
        افزودن نشان
      </button>

      <h3 className="adm-subtitle">لینک‌های پایین فوتر</h3>
      <div className="adm-grid">
        {footer.legalLinks.map((link, index) => (
          <div className="adm-field" key={`${link.label}-${index}`}>
            <span className="adm-field__label">لینک {(index + 1).toLocaleString('fa-IR')}</span>
            <div className="adm-inline">
              <input
                className="adm-input"
                aria-label="عنوان لینک"
                value={link.label}
                onChange={(event) => patchLegal(index, { label: event.target.value })}
              />
              <input
                className="adm-input adm-input--ltr"
                aria-label="آدرس لینک"
                value={link.href}
                onChange={(event) => patchLegal(index, { href: event.target.value })}
                dir="ltr"
              />
            </div>
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}
