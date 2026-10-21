import { useState } from 'react';

// Construction progress: eight stages on a horizontal rail, one large image and
// its technical summary. Images stay mounted and cross-fade, so switching feels
// like a presentation rather than a page reload.
export default function ConstructionStages({ stages }) {
  const [active, setActive] = useState(0);
  const stage = stages[active];

  const onKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    setActive((index) => (index + direction + stages.length) % stages.length);
  };

  return (
    <div className="sp-stages">
      <div className="sp-stages-nav-wrap">
        <div className="sp-stages-nav" role="tablist" aria-label="مراحل ساخت">
          <span className="sp-stages-track" aria-hidden="true">
            <span style={{ width: `${stage.progress}%` }} />
          </span>
          {stages.map((item, index) => (
            <button
              type="button"
              key={item.no}
              role="tab"
              aria-selected={index === active}
              aria-controls="construction-stage-panel"
              className={
                index === active
                  ? 'sp-stage-tab is-active'
                  : index < active
                    ? 'sp-stage-tab is-done'
                    : 'sp-stage-tab'
              }
              onClick={() => setActive(index)}
              onKeyDown={onKeyDown}
            >
              <span className="sp-stage-tab-no">{item.no}</span>
              <span className="sp-stage-tab-label">{item.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sp-stage-body" id="construction-stage-panel" role="tabpanel">
        <figure className="sp-stage-media">
          {stages.map((item, index) => (
            <img
              key={item.no}
              className={index === active ? 'sp-stage-img is-active' : 'sp-stage-img'}
              src={item.image}
              alt={item.title}
              loading="lazy"
            />
          ))}
          <span className="sp-stage-count">
            <b>{stage.no}</b>
            <span>/ ۰۸</span>
          </span>
        </figure>

        <div className="sp-stage-info" key={stage.no}>
          <span className="sp-kicker">
            <span className="sp-kicker-rule" aria-hidden="true" />
            {`مرحلهٔ ${stage.no} — ${stage.title}`}
          </span>
          <h3 className="sp-stage-title">{stage.title}</h3>
          <p className="sp-stage-text">{stage.text}</p>

          <span className="sp-stage-sub">خروجی این مرحله</span>
          <ul className="sp-stage-list">
            {stage.deliverables.map((item) => (
              <li key={item}>
                <i className="luxinaicon luxina-icon-check-line" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <div className="sp-stage-meter">
            <div className="sp-stage-meter-head">
              <span>پیشرفت تجمعی پروژه</span>
              <b>{stage.progress}٪</b>
            </div>
            <div
              className="sp-stage-meter-bar"
              role="progressbar"
              aria-valuenow={stage.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${stage.progress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
