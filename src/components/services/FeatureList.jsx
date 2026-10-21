// Numbered feature list: used for the renovation survey stages and the plans
// workflow, where each item is a step rather than a marketing tile.
export default function FeatureList({ items, columns = 2 }) {
  return (
    <div className={columns === 1 ? 'sp-features sp-features-1' : 'sp-features'}>
      {items.map((item) => (
        <article className="sp-feature" key={item.title}>
          {item.no ? <span className="sp-feature-no">{item.no}</span> : null}
          {item.icon ? (
            <span className="sp-feature-icon">
              <i className={`luxinaicon ${item.icon}`} aria-hidden="true" />
            </span>
          ) : null}
          <div className="sp-feature-body">
            <h3 className="sp-feature-title">{item.title}</h3>
            <p className="sp-feature-text">{item.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
