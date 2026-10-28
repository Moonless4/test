import { useSite } from '../../site/SiteContent.jsx';
import Icon from '../../components/Icons.jsx';
import { AdminPanel } from '../ui.jsx';

export default function DashboardPanel({ onGo }) {
  const { content } = useSite();

  const stats = [
    { id: 'products', label: 'غذا در منو', value: content.products.length, icon: 'fork' },
    { id: 'categories', label: 'دسته‌بندی', value: content.categories.length, icon: 'box' },
    { id: 'filters', label: 'فیلتر منو', value: content.menuFilters.length, icon: 'chef' },
    { id: 'slides', label: 'اسلاید هیرو', value: content.heroSlides.length, icon: 'play' },
    { id: 'banners', label: 'بنر تبلیغاتی', value: content.promoBanners.length, icon: 'sparkle' },
    { id: 'posts', label: 'پست وبلاگ', value: content.posts.length, icon: 'edit' },
    { id: 'pages', label: 'صفحه محتوایی', value: Object.keys(content.pages || {}).length, icon: 'quote' },
    { id: 'badges', label: 'نماد و نشان', value: content.footer.badges.length, icon: 'shield' },
  ];

  const shortcuts = [
    { id: 'products', label: 'افزودن غذا', icon: 'plus', text: 'غذای جدید با عکس، قیمت و توضیحات' },
    { id: 'hero', label: 'اسلاید هیرو', icon: 'play', text: 'تصویر و ترتیب اسلایدهای صفحه اصلی' },
    { id: 'banners', label: 'بنرها', icon: 'sparkle', text: 'عکس و متن بنرهای تبلیغاتی' },
    { id: 'blog', label: 'پست وبلاگ', icon: 'edit', text: 'نوشتن و ویرایش مقالات' },
    { id: 'footer', label: 'فوتر و نمادها', icon: 'quote', text: 'ستون‌ها، شبکه‌های اجتماعی و نشان‌ها' },
    { id: 'pages', label: 'صفحات سایت', icon: 'box', text: 'حریم خصوصی، شرایط و ضوابط و …' },
  ];

  return (
    <AdminPanel
      title={`سلام، مدیر ${content.identity.siteName}`}
      description="از این پنل محتوای سایت را مدیریت کنید. تغییرات بلافاصله روی سایت اعمال می‌شود."
    >
      <div className="adm-stats">
        {stats.map((stat) => (
          <div className="adm-stat" key={stat.id}>
            <span className="adm-stat__icon">
              <Icon name={stat.icon} size={20} />
            </span>
            <strong>{stat.value.toLocaleString('fa-IR')}</strong>
            <small>{stat.label}</small>
          </div>
        ))}
      </div>

      <h3 className="adm-subtitle">دسترسی سریع</h3>
      <div className="adm-shortcuts">
        {shortcuts.map((item) => (
          <button type="button" className="adm-shortcut" key={item.id} onClick={() => onGo(item.id)}>
            <span className="adm-shortcut__icon">
              <Icon name={item.icon} size={18} />
            </span>
            <span>
              <b>{item.label}</b>
              <small>{item.text}</small>
            </span>
            <Icon name="chevronLeft" size={17} />
          </button>
        ))}
      </div>

      <div className="adm-note">
        <Icon name="shield" size={18} />
        <p>
          اطلاعات این پنل در همین مرورگر ذخیره می‌شود؛ برای انتقال آن به دستگاه دیگر از بخش
          «تنظیمات» فایل پشتیبان بگیرید.
        </p>
      </div>
    </AdminPanel>
  );
}
