import { useState } from 'react';
import FloorPlanSvg from './FloorPlanSvg.jsx';

const PLAN_MODES = ['plan', 'furniture', 'executive'];

// The architectural presentation tool: four views of the same floor, room
// hotspots, a space sheet and zoom controls. The 3D view is a rendered model, so
// the hotspots only stay active on the drawn plan modes.
export default function PlanViewer({ viewer }) {
  const [viewKey, setViewKey] = useState(viewer.views[0].key);
  const [roomId, setRoomId] = useState(viewer.rooms[0].id);
  const [zoom, setZoom] = useState(1);

  const view = viewer.views.find((item) => item.key === viewKey) || viewer.views[0];
  const room = viewer.rooms.find((item) => item.id === roomId) || viewer.rooms[0];
  const isPlan = PLAN_MODES.includes(view.kind);

  const selectView = (key) => {
    setViewKey(key);
    setZoom(1);
  };

  const onTabKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = viewer.views.findIndex((item) => item.key === viewKey);
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const next = (index + direction + viewer.views.length) % viewer.views.length;
    selectView(viewer.views[next].key);
  };

  return (
    <div className="sp-plan-viewer">
      <div className="sp-plan-tabs" role="tablist" aria-label="نماهای پلان">
        {viewer.views.map((item) => (
          <button
            type="button"
            key={item.key}
            role="tab"
            aria-selected={item.key === viewKey}
            className={item.key === viewKey ? 'sp-plan-tab is-active' : 'sp-plan-tab'}
            onClick={() => selectView(item.key)}
            onKeyDown={onTabKeyDown}
          >
            <span>{item.label}</span>
            <i className="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="sp-plan-layout">
        <div className="sp-plan-stage">
          <div
            className={isPlan ? 'sp-plan-canvas is-plan' : 'sp-plan-canvas'}
            style={{ transform: `scale(${zoom})` }}
          >
            {isPlan ? (
              <FloorPlanSvg mode={view.kind} activeRoom={roomId} onSelect={setRoomId} />
            ) : (
              <img src={view.image} alt={view.title} loading="lazy" width="1400" height="1000" />
            )}
          </div>

          <div className="sp-plan-zoom">
            <button
              type="button"
              className="sp-plan-zoom-btn"
              aria-label="کوچک‌نمایی پلان"
              onClick={() => setZoom((value) => Math.max(1, Number((value - 0.15).toFixed(2))))}
              disabled={zoom <= 1}
            >
              <i className="luxinaicon luxina-icon-subtract-line" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="sp-plan-zoom-value"
              onClick={() => setZoom(1)}
              aria-label="بازنشانی بزرگ‌نمایی"
            >
              {Math.round(zoom * 100)}٪
            </button>
            <button
              type="button"
              className="sp-plan-zoom-btn"
              aria-label="بزرگ‌نمایی پلان"
              onClick={() => setZoom((value) => Math.min(2, Number((value + 0.15).toFixed(2))))}
              disabled={zoom >= 2}
            >
              <i className="luxinaicon luxina-icon-add-line" aria-hidden="true" />
            </button>
          </div>

          {!isPlan ? (
            <span className="sp-plan-note">
              برای انتخاب فضا، «پلان دوبعدی» یا «پلان مبلمان» را فعال کنید.
            </span>
          ) : null}
        </div>

        <aside className="sp-plan-aside">
          <div className="sp-plan-copy" key={view.key}>
            <span className="sp-plan-copy-kicker">{view.label}</span>
            <h3 className="sp-plan-copy-title">{view.title}</h3>
            <p className="sp-plan-copy-text">{view.text}</p>
            <ul className="sp-plan-meta">
              {view.meta.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="sp-plan-room-panel">
            <span className="sp-plan-room-kicker">فضای انتخاب‌شده</span>
            <div className="sp-plan-room-head">
              <h4>{room.title}</h4>
              <span className="sp-plan-room-area">{room.area}</span>
            </div>
            <p className="sp-plan-room-text">{room.text}</p>
            <ul className="sp-plan-tags">
              {room.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>

          <div className="sp-plan-room-nav" role="group" aria-label="انتخاب فضا">
            {viewer.rooms.map((item) => (
              <button
                type="button"
                key={item.id}
                className={item.id === roomId ? 'sp-plan-room-chip is-active' : 'sp-plan-room-chip'}
                aria-pressed={item.id === roomId}
                onClick={() => setRoomId(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>
      </div>

      <ul className="sp-plan-legend">
        <li>
          <span className="sp-plan-legend-swatch sp-plan-legend-wall" aria-hidden="true" />
          دیوار و بازشو
        </li>
        <li>
          <span className="sp-plan-legend-swatch sp-plan-legend-room" aria-hidden="true" />
          فضای انتخاب‌شده
        </li>
        <li>
          <span className="sp-plan-legend-swatch sp-plan-legend-hot" aria-hidden="true" />
          نقطهٔ انتخاب فضا
        </li>
        <li className="sp-plan-legend-hint">روی پلان کلیک کنید یا از فهرست فضاها انتخاب کنید.</li>
      </ul>
    </div>
  );
}
