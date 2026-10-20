import Icon from './Icons.jsx';

export default function Toast({ message }) {
  return (
    <div className={`toast ${message ? 'is-visible' : ''}`} role="status" aria-live="polite">
      <span className="toast__icon">
        <Icon name="check" size={17} />
      </span>
      <span>{message}</span>
    </div>
  );
}
