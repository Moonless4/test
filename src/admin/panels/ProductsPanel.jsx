import { useMemo, useState } from 'react';
import { useSite } from '../../site/SiteContent.jsx';
import Icon from '../../components/Icons.jsx';
import {
  AdminPanel,
  EmptyNote,
  Field,
  ImageField,
  NumberInput,
  Select,
  TextArea,
  TextInput,
  Toggle,
  makeId,
} from '../ui.jsx';

const emptyDraft = (filters) => {
  const first = filters.find((item) => item.id !== 'all') || filters[0] || { id: 'pizza', title: 'پیتزا' };
  return {
    id: '',
    name: '',
    category: first.id,
    categoryLabel: first.title,
    description: '',
    longDescription: '',
    price: 0,
    oldPrice: null,
    discount: 0,
    image: '',
    weight: '',
    featured: false,
    badge: '',
  };
};

export default function ProductsPanel() {
  const { content, update } = useSite();
  const [draft, setDraft] = useState(null);
  const [query, setQuery] = useState('');

  const categoryOptions = content.menuFilters.map((item) => ({ value: item.id, label: item.title }));

  const visible = useMemo(() => {
    const term = query.trim();
    if (!term) return content.products;
    return content.products.filter((product) => `${product.name} ${product.categoryLabel}`.includes(term));
  }, [content.products, query]);

  const patch = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const saveDraft = () => {
    if (!draft || !draft.name.trim()) return;
    const label = content.menuFilters.find((item) => item.id === draft.category)?.title || draft.categoryLabel;
    const product = {
      ...draft,
      id: draft.id || makeId('dish'),
      categoryLabel: label,
      price: Number(draft.price) || 0,
      oldPrice: draft.oldPrice ? Number(draft.oldPrice) : null,
      discount: Number(draft.discount) || 0,
    };
    update((prev) => {
      const exists = prev.products.some((item) => item.id === product.id);
      return {
        ...prev,
        products: exists
          ? prev.products.map((item) => (item.id === product.id ? product : item))
          : [product, ...prev.products],
      };
    });
    setDraft(null);
  };

  const remove = (id) => {
    if (!window.confirm('این غذا از منو حذف شود؟')) return;
    update((prev) => ({ ...prev, products: prev.products.filter((item) => item.id !== id) }));
  };

  return (
    <AdminPanel
      title="غذاها"
      description="افزودن، ویرایش و حذف آیتم‌های منو."
      actions={
        <button type="button" className="adm-btn adm-btn--gold" onClick={() => setDraft(emptyDraft(content.menuFilters))}>
          <Icon name="plus" size={17} />
          افزودن غذا
        </button>
      }
    >
      {draft ? (
        <div className="adm-editor">
          <div className="adm-editor__head">
            <h3>{draft.id ? 'ویرایش غذا' : 'غذای جدید'}</h3>
            <div className="adm-editor__actions">
              <button type="button" className="adm-btn adm-btn--gold" onClick={saveDraft}>
                <Icon name="check" size={16} />
                ذخیره
              </button>
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setDraft(null)}>
                انصراف
              </button>
            </div>
          </div>

          <div className="adm-grid">
            <TextInput label="نام غذا" value={draft.name} onChange={(value) => patch('name', value)} />
            <Select
              label="دسته‌بندی"
              value={draft.category}
              onChange={(value) => patch('category', value)}
              options={categoryOptions}
            />
            <NumberInput label="قیمت (تومان)" value={draft.price} onChange={(value) => patch('price', value)} />
            <NumberInput
              label="قیمت قبل از تخفیف"
              value={draft.oldPrice ?? ''}
              onChange={(value) => patch('oldPrice', value)}
              hint="خالی بگذارید اگر تخفیف ندارد."
            />
            <NumberInput label="درصد تخفیف" value={draft.discount} onChange={(value) => patch('discount', value)} />
            <TextInput label="وزن / اندازه" value={draft.weight} onChange={(value) => patch('weight', value)} />
            <TextInput label="نشان (اختیاری)" value={draft.badge} onChange={(value) => patch('badge', value)} />
            <div className="adm-field">
              <span className="adm-field__label">ویژگی‌ها</span>
              <Toggle
                label="نمایش در پیشنهادهای ویژه"
                checked={draft.featured}
                onChange={(value) => patch('featured', value)}
              />
            </div>
            <TextArea
              label="توضیح کوتاه"
              value={draft.description}
              onChange={(value) => patch('description', value)}
              wide
            />
            <TextArea
              label="توضیح کامل"
              value={draft.longDescription}
              onChange={(value) => patch('longDescription', value)}
              rows={4}
              wide
            />
            <div className="adm-field adm-field--wide">
              <ImageField label="تصویر غذا" value={draft.image} onChange={(value) => patch('image', value)} />
            </div>
          </div>
        </div>
      ) : null}

      <Field label="جستجو در غذاها">
        <input
          className="adm-input"
          aria-label="جستجو در غذاها"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="نام غذا…"
        />
      </Field>

      <div className="adm-rows">
        {visible.map((product) => (
          <div className="adm-row" key={product.id}>
            <span className="adm-row__thumb">
              {product.image ? <img src={product.image} alt="" /> : <Icon name="fork" size={18} />}
            </span>
            <div className="adm-row__copy">
              <b>{product.name}</b>
              <small>
                {product.categoryLabel} · {Number(product.price).toLocaleString('fa-IR')} تومان
                {product.featured ? ' · ویژه' : ''}
              </small>
            </div>
            <div className="adm-row__tools">
              <button type="button" className="adm-icon-btn" onClick={() => setDraft({ ...product })} aria-label="ویرایش">
                <Icon name="edit" size={16} />
              </button>
              <button type="button" className="adm-icon-btn" onClick={() => remove(product.id)} aria-label="حذف">
                <Icon name="trash" size={16} />
              </button>
            </div>
          </div>
        ))}
        {visible.length === 0 ? <EmptyNote>غذایی با این نام پیدا نشد.</EmptyNote> : null}
      </div>
    </AdminPanel>
  );
}
