import { useRef, useState } from 'react';

// Draggable before/after comparison. The whole frame is a pointer target, so it
// works the same with a mouse, a finger or the keyboard (the handle is a slider).
// `touch-action: pan-y` keeps vertical page scrolling alive on phones.
export default function BeforeAfterSlider({
  before,
  after,
  beforeLabel = 'قبل',
  afterLabel = 'بعد',
  caption,
  meta,
  variant = 'large',
  initial = 55,
}) {
  const [position, setPosition] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef(null);
  const draggingRef = useRef(false);

  const moveTo = (clientX) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    if (!rect.width) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(97, Math.max(3, next)));
  };

  const onPointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    draggingRef.current = true;
    setDragging(true);
    moveTo(event.clientX);
    // Capture keeps the drag alive outside the frame; a synthetic pointer (or a
    // browser without capture support) may reject it, and the drag still works.
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      /* no active pointer to capture */
    }
  };

  const onPointerMove = (event) => {
    if (!draggingRef.current) return;
    moveTo(event.clientX);
  };

  const endDrag = (event) => {
    draggingRef.current = false;
    setDragging(false);
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {
      /* pointer already released */
    }
  };

  const onKeyDown = (event) => {
    const step = event.shiftKey ? 10 : 4;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setPosition((value) => Math.max(3, value - step));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setPosition((value) => Math.min(97, value + step));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setPosition(3);
    } else if (event.key === 'End') {
      event.preventDefault();
      setPosition(97);
    }
  };

  return (
    <figure className={`sp-ba sp-ba-${variant}${dragging ? ' is-dragging' : ''}`}>
      <div
        className="sp-ba-frame"
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <img className="sp-ba-img" src={after} alt={afterLabel} draggable="false" loading="lazy" />
        <div className="sp-ba-reveal" style={{ clipPath: `inset(0 0 0 ${100 - position}%)` }}>
          <img className="sp-ba-img" src={before} alt={beforeLabel} draggable="false" loading="lazy" />
        </div>

        <span className="sp-ba-tag sp-ba-tag-before">{beforeLabel}</span>
        <span className="sp-ba-tag sp-ba-tag-after">{afterLabel}</span>

        <div className="sp-ba-divider" style={{ left: `${position}%` }}>
          <span
            className="sp-ba-handle"
            role="slider"
            tabIndex={0}
            aria-label="مقایسهٔ تصویر قبل و بعد"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(position)}
            aria-valuetext={`${Math.round(position)} درصد`}
            onKeyDown={onKeyDown}
          >
            <i className="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true" />
            <span className="sp-ba-handle-dot" aria-hidden="true" />
            <i className="luxinaicon luxina-icon-arrow-right-line" aria-hidden="true" />
          </span>
        </div>
      </div>

      {caption || meta ? (
        <figcaption className="sp-ba-caption">
          {caption ? <span className="sp-ba-caption-title">{caption}</span> : null}
          {meta ? <span className="sp-ba-caption-meta">{meta}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
