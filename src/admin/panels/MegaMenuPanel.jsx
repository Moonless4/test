import { useSite } from '../../site/SiteContent.jsx';
import { AdminPanel, ImageField, TextInput } from '../ui.jsx';

export default function MegaMenuPanel() {
  const { content, update } = useSite();
  const mega = content.megaMenu;

  const setMega = (patch) =>
    update((prev) => ({ ...prev, megaMenu: { ...prev.megaMenu, ...patch } }));

  const setPromo = (patch) => setMega({ promo: { ...mega.promo, ...patch } });

  return (
    <AdminPanel
      title="مگامنوی هدر"
      description="منوی بازشوی «منو» در هدر سایت؛ دسته‌بندی‌ها به‌صورت خودکار از بخش دسته‌بندی‌ها می‌آیند."
    >
      <div className="adm-grid">
        <TextInput
          label="عنوان بالای فهرست دسته‌ها"
          value={mega.eyebrow}
          onChange={(value) => setMega({ eyebrow: value })}
          wide
        />
      </div>

      <h3 className="adm-subtitle">کارت تبلیغاتی داخل مگامنو</h3>
      <div className="adm-grid">
        <TextInput label="تیتر کوچک" value={mega.promo.kicker} onChange={(value) => setPromo({ kicker: value })} />
        <TextInput label="عنوان" value={mega.promo.title} onChange={(value) => setPromo({ title: value })} />
        <TextInput label="متن دکمه" value={mega.promo.cta} onChange={(value) => setPromo({ cta: value })} />
        <TextInput
          label="لینک (مثلاً /menu)"
          value={mega.promo.href}
          onChange={(value) => setPromo({ href: value })}
          dir="ltr"
        />
        <div className="adm-field adm-field--wide">
          <ImageField label="تصویر کارت" value={mega.promo.image} onChange={(value) => setPromo({ image: value })} />
        </div>
      </div>
    </AdminPanel>
  );
}
