import { useEffect, useRef, useState } from 'react';
import { posts, products, searchAliases } from '../data/content.js';
import Icon from './Icons.jsx';
import { formatPrice } from './ProductCard.jsx';
import { useOverlay } from './Modal.jsx';

const suggestions = ['پیتزا', 'استیک', 'برگر', 'سالاد', 'جوجه کباب'];

export default function SearchOverlay({ open, onClose, onOpenProduct, onOpenPost }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  useOverlay(open, onClose);

  useEffect(() => {
    if (open) {
      setQuery('');
      const timer = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  if (!open) return null;

  const term = query.trim();
  const normalized = term.replace(/ي/g, 'ی').replace(/ك/g, 'ک');

  const productResults = term
    ? products.filter((product) => {
        const haystack = [
          product.name,
          product.description,
          product.categoryLabel,
          ...(searchAliases[product.id] || []),
        ]
          .join(' ')
          .replace(/ي/g, 'ی')
          .replace(/ك/g, 'ک');
        return haystack.includes(normalized);
      })
    : [];

  const postResults = term
    ? posts.filter((post) =>
        `${post.title} ${post.excerpt} ${post.category}`
          .replace(/ي/g, 'ی')
          .replace(/ك/g, 'ک')
          .includes(normalized)
      )
    : [];

  const total = productResults.length + postResults.length;

  return (
    <div className="search-overlay is-open" role="dialog" aria-modal="true" aria-label="جستجو در سایت">
      <button type="button" className="search-overlay__backdrop" onClick={onClose} aria-label="بستن جستجو" />
      <div className="search-panel">
        <div className="search-panel__head">
          <div className="search-panel__field">
            <Icon name="search" size={22} />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="دنبال چه غذایی می‌گردید؟"
              aria-label="عبارت جستجو"
            />
            {query && (
              <button type="button" className="search-clear" onClick={() => setQuery('')} aria-label="پاک کردن">
                <Icon name="close" size={16} />
              </button>
            )}
          </div>
          <button type="button" className="search-panel__close" onClick={onClose}>
            بستن
            <Icon name="close" size={17} />
          </button>
        </div>

        {!term && (
          <div className="search-panel__body">
            <span className="search-panel__eyebrow">جستجوهای محبوب</span>
            <div className="search-chips">
              {suggestions.map((item) => (
                <button type="button" key={item} className="search-chip" onClick={() => setQuery(item)}>
                  <Icon name="search" size={15} />
                  {item}
                </button>
              ))}
            </div>
            <div className="search-featured">
              <span className="search-panel__eyebrow">پیشنهاد امروز</span>
              <div className="search-featured__list">
                {products.slice(0, 3).map((product) => (
                  <button
                    type="button"
                    key={product.id}
                    className="search-mini"
                    onClick={() => {
                      onClose();
                      onOpenProduct(product);
                    }}
                  >
                    <img src={product.image} alt="" loading="lazy" />
                    <span>
                      <b>{product.name}</b>
                      <small>{formatPrice(product.price)} تومان</small>
                    </span>
                    <Icon name="chevronLeft" size={17} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {term && (
          <div className="search-panel__body">
            <span className="search-panel__result-count">
              {total > 0 ? `${total.toLocaleString('fa-IR')} نتیجه برای «${term}»` : `نتیجه‌ای برای «${term}» پیدا نشد`}
            </span>

            {productResults.length > 0 && (
              <div className="search-group">
                <span className="search-panel__eyebrow">غذاها</span>
                <div className="search-featured__list">
                  {productResults.map((product) => (
                    <button
                      type="button"
                      key={product.id}
                      className="search-mini"
                      onClick={() => {
                        onClose();
                        onOpenProduct(product);
                      }}
                    >
                      <img src={product.image} alt="" loading="lazy" />
                      <span>
                        <b>{product.name}</b>
                        <small>{product.categoryLabel} · {formatPrice(product.price)} تومان</small>
                      </span>
                      <Icon name="chevronLeft" size={17} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {postResults.length > 0 && (
              <div className="search-group">
                <span className="search-panel__eyebrow">مقالات</span>
                <div className="search-featured__list">
                  {postResults.map((post) => (
                    <button
                      type="button"
                      key={post.id}
                      className="search-mini"
                      onClick={() => {
                        onClose();
                        onOpenPost(post);
                      }}
                    >
                      <img src={post.image} alt="" loading="lazy" />
                      <span>
                        <b>{post.title}</b>
                        <small>{post.category} · {post.readTime}</small>
                      </span>
                      <Icon name="chevronLeft" size={17} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {total === 0 && (
              <div className="search-empty">
                <Icon name="search" size={34} />
                <p>عبارت دیگری را امتحان کنید یا از منوی ما دیدن کنید.</p>
                <button type="button" className="btn btn--primary" onClick={onClose}>
                  بستن جستجو
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
