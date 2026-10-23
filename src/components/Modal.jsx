import { useEffect } from 'react';
import Icon from './Icons.jsx';
import { lockScroll, unlockScroll } from '../lib/smoothScroll.js';

export function useOverlay(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.classList.add('no-scroll');
    lockScroll();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('no-scroll');
      unlockScroll();
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
}

export default function Modal({ open, onClose, children, className = '', label }) {
  useOverlay(open, onClose);
  if (!open) return null;

  return (
    <div className="modal-root">
      <button type="button" className="modal-backdrop" onClick={onClose} aria-label="بستن پنجره" />
      <div
        className={`modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label="بستن">
          <Icon name="close" size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
