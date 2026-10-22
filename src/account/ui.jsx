import Icon from '../components/Icons.jsx';
import Modal from '../components/Modal.jsx';
import { Link } from '../router.jsx';

export function StatusPill({ tone = 'muted', children }) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}

export function Panel({ title, subtitle, action, children, className = '', id }) {
  return (
    <section className={`acct-panel ${className}`} id={id}>
      {(title || action) && (
        <header className="acct-panel__head">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHead({ title, text, action }) {
  return (
    <header className="acct-page-head">
      <div>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
      {action}
    </header>
  );
}

export function EmptyState({ icon = 'fork', title, text, actionLabel, onAction, to }) {
  return (
    <div className="acct-empty">
      <span className="acct-empty__icon">
        <Icon name={icon} size={26} />
      </span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {actionLabel && to && (
        <Link className="btn btn--primary" to={to}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && !to && (
        <button type="button" className="btn btn--primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function Field({ label, hint, error, children }) {
  return (
    <label className={`acct-field ${error ? 'has-error' : ''}`}>
      <span className="acct-field__label">{label}</span>
      {children}
      {error ? (
        <span className="acct-field__hint acct-field__hint--error">{error}</span>
      ) : (
        hint && <span className="acct-field__hint">{hint}</span>
      )}
    </label>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="acct-toggle">
      <span className="acct-toggle__copy">
        <b>{label}</b>
        {description && <small>{description}</small>}
      </span>
      <span className="acct-toggle__control">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <i aria-hidden="true" />
      </span>
    </label>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  text,
  confirmLabel = 'تایید',
  cancelLabel = 'انصراف',
  tone = 'primary',
}) {
  return (
    <Modal open={open} onClose={onClose} className="modal--confirm" label={title}>
      <div className="acct-confirm">
        <span className={`acct-confirm__icon acct-confirm__icon--${tone}`}>
          <Icon name="bell" size={22} />
        </span>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
        <div className="acct-confirm__actions">
          <button type="button" className="btn btn--outline" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${tone === 'danger' ? 'btn--primary' : 'btn--primary'}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function SkeletonPage() {
  return (
    <div className="acct-skeleton" aria-hidden="true">
      <div className="acct-skeleton__hero" />
      <div className="acct-skeleton__row">
        <div className="acct-skeleton__tile" />
        <div className="acct-skeleton__tile" />
        <div className="acct-skeleton__tile" />
        <div className="acct-skeleton__tile" />
      </div>
      <div className="acct-skeleton__block" />
      <div className="acct-skeleton__block acct-skeleton__block--short" />
    </div>
  );
}
