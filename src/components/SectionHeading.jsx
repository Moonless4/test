import Icon from './Icons.jsx';

export default function SectionHeading({
  eyebrow,
  icon,
  title,
  highlight,
  script,
  text,
  linkHref,
  linkLabel,
  children,
  align = 'start',
}) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <div className="section-heading__copy">
        {icon && (
          <span className="section-heading__symbol" aria-hidden="true">
            <Icon name={icon} size={26} />
          </span>
        )}
        {eyebrow && (
          <span className="section-heading__eyebrow">
            <img src="/assets/title-symbol.webp" alt="" aria-hidden="true" />
            {eyebrow}
          </span>
        )}
        <div className="section-heading__title-row">
          <h2>
            {title}
            {highlight && (
              <>
                {' '}
                <span className="title-highlight">{highlight}</span>
              </>
            )}
          </h2>
          {script && <span className="script-note">{script}</span>}
        </div>
        {text && <p>{text}</p>}
      </div>
      <div className="section-heading__actions">
        {children}
        {linkHref && (
          <a className="text-link" href={linkHref}>
            {linkLabel}
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
