import { useSite } from '../../site/SiteContent.jsx';
import Icon from '../../components/Icons.jsx';
import { AdminPanel, EmptyNote, EditorCard, ImageField, Select } from '../ui.jsx';

export default function HeroPanel() {
  const { content, update } = useSite();

  const setSlides = (heroSlides) => update((prev) => ({ ...prev, heroSlides }));

  const productOptions = content.products.map((product) => ({
    value: product.id,
    label: `${product.name} — ${Number(product.price).toLocaleString('fa-IR')} تومان`,
  }));

  const patch = (index, data) =>
    setSlides(content.heroSlides.map((slide, slideIndex) => (slideIndex === index ? { ...slide, ...data } : slide)));

  const move = (index, dir) => {
    const next = [...content.heroSlides];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSlides(next);
  };

  const remove = (index) => {
    if (!window.confirm('این اسلاید حذف شود؟')) return;
    setSlides(content.heroSlides.filter((_, slideIndex) => slideIndex !== index));
  };

  const add = () => {
    const used = new Set(content.heroSlides.map((slide) => slide.id));
    const candidate = content.products.find((product) => !used.has(product.id)) || content.products[0];
    if (!candidate) return;
    setSlides([...content.heroSlides, { id: candidate.id, image: candidate.image }]);
  };

  return (
    <AdminPanel
      title="اسلایدهای هیرو"
      description="اسلایدهای بالای صفحه اصلی؛ هر اسلاید یک غذا با تصویر مخصوص خود دارد."
      actions={
        <button type="button" className="adm-btn adm-btn--gold" onClick={add}>
          <Icon name="plus" size={17} />
          افزودن اسلاید
        </button>
      }
    >
      <div className="adm-cards">
        {content.heroSlides.map((slide, index) => {
          const product = content.products.find((item) => item.id === slide.id);
          return (
            <EditorCard
              key={`${slide.id}-${index}`}
              title={product?.name || slide.id}
              badge={`اسلاید ${(index + 1).toLocaleString('fa-IR')}`}
              onRemove={() => remove(index)}
              tools={
                <>
                  <button type="button" className="adm-icon-btn" onClick={() => move(index, -1)} aria-label="بالا">
                    <Icon name="chevronRight" size={16} />
                  </button>
                  <button type="button" className="adm-icon-btn" onClick={() => move(index, 1)} aria-label="پایین">
                    <Icon name="chevronLeft" size={16} />
                  </button>
                </>
              }
            >
              <div className="adm-grid">
                <Select
                  label="غذا"
                  value={slide.id}
                  onChange={(value) => {
                    const nextProduct = content.products.find((item) => item.id === value);
                    patch(index, { id: value, image: nextProduct?.image || slide.image });
                  }}
                  options={productOptions}
                />
                <div className="adm-field adm-field--wide">
                  <ImageField
                    label="تصویر اسلاید"
                    value={slide.image}
                    onChange={(value) => patch(index, { image: value })}
                    hint="تصویر مربعی با پس‌زمینهٔ شفاف بهترین نتیجه را می‌دهد."
                  />
                </div>
              </div>
            </EditorCard>
          );
        })}
        {content.heroSlides.length === 0 ? <EmptyNote>هنوز اسلایدی اضافه نشده است.</EmptyNote> : null}
      </div>
    </AdminPanel>
  );
}
