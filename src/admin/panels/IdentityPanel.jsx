import { useSite } from '../../site/SiteContent.jsx';
import { AdminPanel, TextArea, TextInput } from '../ui.jsx';

export default function IdentityPanel() {
  const { content, update } = useSite();
  const identity = content.identity;

  const patch = (data) => update((prev) => ({ ...prev, identity: { ...prev.identity, ...data } }));

  return (
    <AdminPanel
      title="هویت و اطلاعات سایت"
      description="نام برند، شعار و اطلاعات تماسی که در هدر، فوتر و صفحه تماس نمایش داده می‌شود."
    >
      <div className="adm-grid">
        <TextInput label="پیشوند برند" value={identity.prefix} onChange={(value) => patch({ prefix: value })} />
        <TextInput label="نام سایت" value={identity.siteName} onChange={(value) => patch({ siteName: value })} />
        <TextArea
          label="شعار کوتاه"
          value={identity.tagline}
          onChange={(value) => patch({ tagline: value })}
          wide
        />
        <TextArea
          label="معرفی در فوتر"
          value={identity.footerAbout}
          onChange={(value) => patch({ footerAbout: value })}
          wide
        />
        <TextInput label="تلفن" value={identity.phone} onChange={(value) => patch({ phone: value })} dir="ltr" />
        <TextInput
          label="لینک تماس تلفنی"
          value={identity.phoneHref}
          onChange={(value) => patch({ phoneHref: value })}
          dir="ltr"
          hint="مثلاً +982188776655"
        />
        <TextInput label="ایمیل" value={identity.email} onChange={(value) => patch({ email: value })} dir="ltr" />
        <TextInput label="ساعت کاری" value={identity.hours} onChange={(value) => patch({ hours: value })} />
        <TextInput label="آدرس" value={identity.address} onChange={(value) => patch({ address: value })} wide />
        <TextInput
          label="متن کپی‌رایت"
          value={identity.copyright}
          onChange={(value) => patch({ copyright: value })}
          wide
        />
      </div>
    </AdminPanel>
  );
}
