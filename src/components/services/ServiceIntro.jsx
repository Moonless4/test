// Editorial introduction band: copy on one side, a tall image with an inline
// quote on the other. Reversing it gives each service page its own rhythm.
export default function ServiceIntro({ intro, reverse = false, extraImage }) {
  return (
    <div className={reverse ? 'sp-intro sp-intro-reverse' : 'sp-intro'}>
      <div className="sp-intro-body">
        <span className="sp-kicker">
          <span className="sp-kicker-rule" aria-hidden="true" />
          {intro.kicker}
        </span>
        <h2 className="sp-intro-title">{intro.title}</h2>
        {intro.paragraphs.map((paragraph) => (
          <p className="sp-intro-text" key={paragraph.slice(0, 24)}>
            {paragraph}
          </p>
        ))}
        <blockquote className="sp-intro-quote">
          <i className="luxinaicon luxina-icon-question-answer-fill" aria-hidden="true" />
          <span>{intro.quote}</span>
        </blockquote>
      </div>

      <div className="sp-intro-media">
        <figure className="sp-intro-figure">
          <img src={intro.image} alt={intro.title} loading="lazy" width="900" height="1120" />
        </figure>
        {extraImage ? (
          <figure className="sp-intro-figure sp-intro-figure-small">
            <img src={extraImage} alt="" loading="lazy" width="640" height="640" />
          </figure>
        ) : null}
      </div>
    </div>
  );
}
