// The design/renovation process as a horizontal rail. It scrolls with snap on
// narrow screens instead of collapsing into a hidden list.
export default function ProcessRail({ steps, label = 'مراحل کار' }) {
  return (
    <div className="sp-rail" role="list" aria-label={label}>
      <span className="sp-rail-line" aria-hidden="true" />
      {steps.map((step) => (
        <article className="sp-rail-step" role="listitem" key={step.no}>
          <span className="sp-rail-dot" aria-hidden="true" />
          <span className="sp-rail-no">{step.no}</span>
          <h3 className="sp-rail-title">{step.title}</h3>
          <p className="sp-rail-text">{step.text}</p>
        </article>
      ))}
    </div>
  );
}
