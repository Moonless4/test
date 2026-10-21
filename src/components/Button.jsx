// The theme's button markup, with the same classes the reference page uses.
export default function Button({
  href,
  variant = 'primary',
  icon,
  className = '',
  children,
  ...rest
}) {
  const classes = ['button', 'rounded', `button-${variant}`, className].filter(Boolean).join(' ');
  const content = (
    <>
      <span className="button-text">{children}</span>
      {icon ? <i className={`${icon} button-icon`} aria-hidden="true" /> : null}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}
