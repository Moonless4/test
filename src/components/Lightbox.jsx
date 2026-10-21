import { useEffect } from 'react';

// Gallery lightbox: React state replaces the imperative open/close handlers.
export default function Lightbox({ src, onClose }) {
  useEffect(() => {
    if (!src) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('disable-scrolling');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (!document.querySelector('#mobile-menu-container.open')) {
        document.body.classList.remove('disable-scrolling');
      }
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="rb-lightbox"
      onClick={(event) => {
        if (event.target === event.currentTarget || event.target.closest('.rb-lightbox-close')) onClose();
      }}
    >
      <button type="button" className="rb-lightbox-close" aria-label="بستن تصویر" onClick={onClose}>
        <i className="luxinaicon luxina-icon-close" aria-hidden="true" />
      </button>
      <img src={src} alt="" />
    </div>
  );
}
