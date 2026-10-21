import Breadcrumbs from '../Breadcrumbs.jsx';
import Button from '../Button.jsx';

// Full-bleed inner-page hero. It uses the service pages' hero shell (photo,
// deep teal veil, breadcrumb + kicker + title + lead + actions + facts row) so
// every route opens with the same visual language as the benchmark pages.
export default function PageHero({
  image,
  eyebrow,
  icon = 'luxina-icon-building-line',
  title,
  lead,
  breadcrumbs,
  actions,
  facts,
  tone = 'photo',
  size = 'default',
}) {
  const classes = ['sp-hero', 'ed-hero', `ed-hero--${tone}`, size === 'compact' ? 'ed-hero--compact' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes}>
      {image ? (
        <div className="sp-hero-media" aria-hidden="true">
          <img src={image} alt="" width="1920" height="1080" />
        </div>
      ) : null}
      <div className="sp-hero-overlay" aria-hidden="true" />

      <div className="sp-hero-inner">
        {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}

        <div className="sp-hero-copy">
          {eyebrow ? (
            <span className="sp-eyebrow">
              <i className={`luxinaicon ${icon}`} aria-hidden="true" />
              {eyebrow}
            </span>
          ) : null}
          <h1 className="sp-hero-title">{title}</h1>
          {lead ? <p className="sp-hero-lead">{lead}</p> : null}
          {actions?.length ? (
            <div className="sp-hero-actions">
              {actions.map((action) =>
                action.href ? (
                  <Button
                    key={action.label}
                    href={action.href}
                    variant={action.variant || 'primary'}
                    className={action.ghost ? 'ed-hero-ghost' : undefined}
                  >
                    {action.label}
                  </Button>
                ) : (
                  <a className="sp-hero-ghost" href={action.anchor} key={action.label}>
                    <span>{action.label}</span>
                    <i className="luxinaicon luxina-icon-arrow-down-line" aria-hidden="true" />
                  </a>
                )
              )}
            </div>
          ) : null}
        </div>

        {facts?.length ? (
          <div className="sp-hero-facts">
            {facts.map((fact) => (
              <div className="sp-hero-fact" key={fact.label}>
                <span className="sp-hero-fact-label">{fact.label}</span>
                <span className="sp-hero-fact-value">{fact.value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
