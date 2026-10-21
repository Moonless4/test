// Section head used by the service pages: a kicker line, an editorial title and
// an optional lead paragraph, aligned like the rest of the site.
export default function SectionHead({ kicker, title, text, align = 'start', id }) {
  return (
    <header className={`sp-head sp-head-${align}`} id={id}>
      {kicker ? (
        <span className="sp-kicker">
          <span className="sp-kicker-rule" aria-hidden="true" />
          {kicker}
        </span>
      ) : null}
      <h2 className="sp-head-title">{title}</h2>
      {text ? <p className="sp-head-text">{text}</p> : null}
    </header>
  );
}
