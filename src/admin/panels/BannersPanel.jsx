import { useSite } from '../../site/SiteContent.jsx';
import Icon from '../../components/Icons.jsx';
import { AdminPanel, EditorCard, ImageField, Select, TextArea, TextInput, makeId } from '../ui.jsx';

const sizeOptions = [
  { value: 'large', label: 'بزرگ' },
  { value: 'small', label: 'کوچک' },
];

export default function BannersPanel() {
  const { content, update } = useSite();

  const setBanners = (promoBanners) => update((prev) => ({ ...prev, promoBanners }));

  const patch = (id, data) =>
    setBanners(content.promoBanners.map((banner) => (banner.id === id ? { ...banner, ...data } : banner)));

  const remove = (id) => {
    if (!window.confirm('این بنر حذف شود؟')) return;
    setBanners(content.promoBanners.filter((banner) => banner.id !== id));
  };

  const add = () => {
    setBanners([
      ...content.promoBanners,
      {
        id: makeId('banner'),
        kicker: 'پیشنهاد ویژه',
        title: 'بنر جدید',
        text: 'متن بنر را از پنل ادمین ویرایش کنید.',
        cta: 'مشاهده منو',
        image: '',
        action: 'menu',
        size: 'small',
      },
    ]);
  };

  return (
    <AdminPanel
      title="بنرهای تبلیغاتی"
      description="کارت‌های تبلیغاتی میان صفحه اصلی؛ عکس، نوشته و عملکرد دکمه."
      actions={
        <button type="button" className="adm-btn adm-btn--gold" onClick={add}>
          <Icon name="plus" size={17} />
          افزودن بنر
        </button>
      }
    >
      <div className="adm-cards">
        {content.promoBanners.map((banner) => {
          const actionKind = banner.action?.startsWith('product:') ? 'product' : banner.action;
          const productId = banner.action?.startsWith('product:') ? banner.action.split(':')[1] : '';

          const setAction = (kind, id) => {
            if (kind === 'product') patch(banner.id, { action: `product:${id || content.products[0]?.id || ''}` });
            else patch(banner.id, { action: kind });
          };

          return (
            <EditorCard
              key={banner.id}
              title={banner.title}
              badge={banner.size === 'large' ? 'بنر بزرگ' : 'بنر کوچک'}
              onRemove={() => remove(banner.id)}
            >
              <div className="adm-grid">
                <TextInput
                  label="تیتر کوچک"
                  value={banner.kicker}
                  onChange={(value) => patch(banner.id, { kicker: value })}
                />
                <TextInput
                  label="عنوان"
                  value={banner.title}
                  onChange={(value) => patch(banner.id, { title: value })}
                />
                <TextArea
                  label="متن"
                  value={banner.text}
                  onChange={(value) => patch(banner.id, { text: value })}
                  wide
                />
                <TextInput
                  label="متن دکمه"
                  value={banner.cta}
                  onChange={(value) => patch(banner.id, { cta: value })}
                />
                <Select
                  label="اندازه"
                  value={banner.size}
                  onChange={(value) => patch(banner.id, { size: value })}
                  options={sizeOptions}
                />
                <Select
                  label="عملکرد دکمه"
                  value={actionKind}
                  onChange={(value) => setAction(value, productId)}
                  options={[
                    { value: 'menu', label: 'رفتن به منو' },
                    { value: 'reserve', label: 'باز کردن رزرو میز' },
                    { value: 'product', label: 'رفتن به یک غذا' },
                  ]}
                />
                {actionKind === 'product' ? (
                  <Select
                    label="غذا"
                    value={productId}
                    onChange={(value) => setAction('product', value)}
                    options={content.products.map((product) => ({ value: product.id, label: product.name }))}
                  />
                ) : null}
                <div className="adm-field adm-field--wide">
                  <ImageField
                    label="تصویر بنر"
                    value={banner.image}
                    onChange={(value) => patch(banner.id, { image: value })}
                  />
                </div>
              </div>
            </EditorCard>
          );
        })}
      </div>
    </AdminPanel>
  );
}
