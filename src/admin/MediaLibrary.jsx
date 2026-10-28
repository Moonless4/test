import { useRef, useState } from 'react';
import { deleteMedia, uploadMedia } from './api.js';
import { invalidateMediaCache, useMediaLibrary } from './fields.jsx';

const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} کیلوبایت`;
  return `${(bytes / 1024 / 1024).toFixed(1)} مگابایت`;
};

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () =>
        resolve({ dataUrl: reader.result, width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MediaLibrary({ onToast }) {
  const { media, loading, reload } = useMediaLibrary();
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const inputRef = useRef(null);

  const filtered = media.filter((item) => item.name?.toLowerCase().includes(query.trim().toLowerCase()));

  const upload = async (files) => {
    if (!files?.length) return;
    setBusy(true);
    setError('');
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const { dataUrl, width, height } = await readImage(file);
        await uploadMedia({ name: file.name, dataUrl, width, height });
      }
      invalidateMediaCache();
      await reload();
      onToast?.('تصویر بارگذاری شد.');
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`«${item.name}» حذف شود؟`)) return;
    try {
      await deleteMedia(item.id);
      invalidateMediaCache();
      await reload();
      onToast?.('تصویر حذف شد.');
    } catch (removeError) {
      setError(removeError.message);
    }
  };

  const copy = async (item) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(item.id);
      setTimeout(() => setCopied(''), 1600);
    } catch {
      setError('کپی لینک ممکن نشد.');
    }
  };

  return (
    <div className="adm-view">
      <header className="adm-head">
        <div className="adm-head-copy">
          <span className="adm-eyebrow">سایت</span>
          <h1>کتابخانهٔ رسانه</h1>
          <p className="adm-muted">تصاویر سایت؛ برای انتخاب در هر بخش، از دکمهٔ «کتابخانه» کنار فیلد تصویر استفاده کنید.</p>
        </div>
        <div className="adm-head-actions">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            multiple
            hidden
            onChange={(event) => upload(event.target.files)}
          />
          <button type="button" className="adm-btn" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? 'در حال بارگذاری…' : '+ بارگذاری تصویر'}
          </button>
        </div>
      </header>

      <div className="adm-media-tools">
        <input
          className="adm-input adm-search"
          placeholder="جستجوی نام فایل…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className="adm-count">{media.length} فایل</span>
      </div>

      {error ? <p className="adm-error">{error}</p> : null}

      <div className="adm-media-grid">
        {loading ? <p className="adm-muted">در حال بارگذاری…</p> : null}
        {!loading && !filtered.length ? (
          <div className="adm-empty-state">
            <p>هنوز تصویری بارگذاری نشده است.</p>
            <button type="button" className="adm-btn" onClick={() => inputRef.current?.click()}>
              + بارگذاری تصویر
            </button>
          </div>
        ) : null}
        {filtered.map((item) => (
          <figure className="adm-media-card" key={item.id}>
            <div className="adm-media-thumb">
              <img src={item.url} alt={item.name} loading="lazy" />
            </div>
            <figcaption>
              <strong>{item.name}</strong>
              <span>
                {item.width && item.height ? `${item.width}×${item.height}` : '—'} · {formatSize(item.size)}
              </span>
              <div className="adm-media-actions">
                <button type="button" className="adm-text-btn" onClick={() => copy(item)}>
                  {copied === item.id ? 'کپی شد' : 'کپی لینک'}
                </button>
                <button type="button" className="adm-text-btn adm-danger-text" onClick={() => remove(item)}>
                  حذف
                </button>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
