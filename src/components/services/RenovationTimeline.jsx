import { useState } from 'react';

// "Before → During → After" switch plus the five-stage renovation rail. The
// stage that is reached is derived from the progress each state reports, so the
// rail always matches the picture above it.
const STAGE_THRESHOLDS = [0, 20, 45, 70, 100];
const TAB_INDEX = ['۰۱', '۰۲', '۰۳'];

export default function RenovationTimeline({ states, stages }) {
  const [active, setActive] = useState(0);
  const state = states[active];

  const currentStage = STAGE_THRESHOLDS.reduce(
    (last, threshold, index) => (state.progress >= threshold ? index : last),
    0,
  );

  const onTabKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    setActive((index) => (index + direction + states.length) % states.length);
  };

  return (
    <div className="sp-reno">
      <div className="sp-reno-tabs" role="tablist" aria-label="مراحل بازسازی">
        {states.map((item, index) => (
          <button
            type="button"
            key={item.key}
            role="tab"
            id={`reno-tab-${item.key}`}
            aria-selected={index === active}
            aria-controls={`reno-panel-${item.key}`}
            className={index === active ? 'sp-reno-tab is-active' : 'sp-reno-tab'}
            onClick={() => setActive(index)}
            onKeyDown={onTabKeyDown}
          >
            <span className="sp-reno-tab-index">{TAB_INDEX[index]}</span>
            <span className="sp-reno-tab-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="sp-reno-body">
        <figure className="sp-reno-media">
          {states.map((item, index) => (
            <img
              key={item.key}
              className={index === active ? 'sp-reno-img is-active' : 'sp-reno-img'}
              src={item.image}
              alt={item.label}
              loading="lazy"
            />
          ))}
          <span className="sp-reno-stage-badge">{state.stage}</span>
          <span className="sp-reno-meter" aria-hidden="true">
            <span style={{ width: `${state.progress}%` }} />
          </span>
        </figure>

        <div
          className="sp-reno-info"
          key={state.key}
          id={`reno-panel-${state.key}`}
          role="tabpanel"
          aria-labelledby={`reno-tab-${state.key}`}
        >
          <span className="sp-reno-progress-value">
            <b>{state.progress}٪</b>
            <span>پیشرفت پروژه در این مرحله</span>
          </span>
          <h3 className="sp-reno-title">{state.title}</h3>
          <p className="sp-reno-text">{state.text}</p>
          <span className="sp-reno-sub">کارهای انجام‌شده</span>
          <ul className="sp-reno-works">
            {state.works.map((work) => (
              <li key={work}>
                <i className="luxinaicon luxina-icon-check-line" aria-hidden="true" />
                {work}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="sp-reno-rail">
        <span className="sp-reno-rail-line" aria-hidden="true">
          <span style={{ width: `${state.progress}%` }} />
        </span>
        <ol className="sp-reno-rail-steps">
          {stages.map((stage, index) => (
            <li
              key={stage.title}
              className={
                index < currentStage
                  ? 'sp-reno-step is-done'
                  : index === currentStage
                    ? 'sp-reno-step is-current'
                    : 'sp-reno-step'
              }
            >
              <span className="sp-reno-step-dot" aria-hidden="true" />
              <span className="sp-reno-step-title">{stage.title}</span>
              <span className="sp-reno-step-hint">{stage.hint}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
