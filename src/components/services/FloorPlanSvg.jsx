// A drawn floor plan rather than a photograph: three of the four plan-viewer
// modes render this SVG, so the hotspots can sit exactly on the rooms and the
// drawing stays crisp at any zoom level.
const ROOMS = [
  { id: 'living', label: 'پذیرایی', area: '۴۲ متر', x: 46, y: 46, w: 448, h: 288, cx: 270, cy: 190, no: '۰۱' },
  { id: 'kitchen', label: 'آشپزخانه', area: '۲۸ متر', x: 46, y: 346, w: 448, h: 228, cx: 270, cy: 460, no: '۰۲' },
  { id: 'bedroom', label: 'اتاق خواب', area: '۲۶ متر', x: 506, y: 46, w: 168, h: 288, cx: 590, cy: 190, no: '۰۳' },
  { id: 'terrace', label: 'تراس', area: '۱۸ متر', x: 686, y: 46, w: 108, h: 288, cx: 740, cy: 290, no: '۰۴' },
];

function Furniture() {
  return (
    <g className="sp-plan-furniture" aria-hidden="true">
      {/* living */}
      <rect x="110" y="110" width="320" height="200" rx="4" className="sp-plan-rug" />
      <rect x="120" y="140" width="160" height="54" rx="6" />
      <rect x="120" y="200" width="58" height="78" rx="6" />
      <rect x="300" y="186" width="92" height="52" rx="6" />
      <rect x="448" y="110" width="38" height="140" rx="3" />
      <circle cx="458" cy="288" r="13" />
      {/* kitchen */}
      <rect x="62" y="520" width="416" height="42" rx="3" />
      <rect x="62" y="366" width="42" height="154" rx="3" />
      <rect x="214" y="418" width="164" height="58" rx="4" />
      <circle cx="290" cy="541" r="11" />
      <rect x="392" y="526" width="56" height="30" rx="2" />
      {/* bedroom */}
      <rect x="524" y="108" width="132" height="152" rx="4" />
      <rect x="536" y="118" width="108" height="28" rx="4" />
      <rect x="524" y="82" width="34" height="22" rx="2" />
      <rect x="622" y="82" width="34" height="22" rx="2" />
      <rect x="510" y="288" width="160" height="30" rx="2" />
      {/* terrace */}
      <circle cx="730" cy="190" r="24" />
      <circle cx="700" cy="146" r="14" />
      <circle cx="762" cy="146" r="14" />
      <rect x="692" y="300" width="94" height="22" rx="3" />
    </g>
  );
}

export default function FloorPlanSvg({ mode, activeRoom, onSelect }) {
  const isExecutive = mode === 'executive';
  const showFurniture = mode === 'furniture';

  return (
    <svg
      className={`sp-plan-svg sp-plan-svg-${mode}`}
      viewBox="0 0 840 620"
      role="img"
      aria-label="پلان معماری طبقهٔ همکف"
    >
      <defs>
        <pattern id="plan-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="rgba(26,59,65,0.07)" strokeWidth="1" />
        </pattern>
        <marker id="plan-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="rgba(26,59,65,0.45)" />
        </marker>
      </defs>

      <rect x="0" y="0" width="840" height="620" fill="url(#plan-grid)" />

      {isExecutive ? (
        <g className="sp-plan-dims" aria-hidden="true">
          <line x1="40" y1="18" x2="800" y2="18" markerStart="url(#plan-arrow)" markerEnd="url(#plan-arrow)" />
          <line x1="40" y1="12" x2="40" y2="26" />
          <line x1="800" y1="12" x2="800" y2="26" />
          <text x="420" y="12" textAnchor="middle" className="sp-plan-dim-text">۱۲٫۰۰ متر</text>

          <line x1="20" y1="40" x2="20" y2="580" markerStart="url(#plan-arrow)" markerEnd="url(#plan-arrow)" />
          <line x1="14" y1="40" x2="26" y2="40" />
          <line x1="14" y1="580" x2="26" y2="580" />
          <text x="12" y="310" textAnchor="middle" className="sp-plan-dim-text" transform="rotate(-90 12 310)">
            ۸٫۵۰ متر
          </text>

          <line x1="40" y1="326" x2="500" y2="326" markerStart="url(#plan-arrow)" markerEnd="url(#plan-arrow)" />
          <text x="270" y="320" textAnchor="middle" className="sp-plan-dim-text">۷٫۰۰</text>

          <line x1="612" y1="46" x2="612" y2="334" markerStart="url(#plan-arrow)" markerEnd="url(#plan-arrow)" />
          <text x="600" y="120" textAnchor="middle" className="sp-plan-dim-text" transform="rotate(-90 600 120)">
            ۳٫۲۰
          </text>

          <g className="sp-plan-notes">
            <text x="512" y="360">درب ۹۰ سانتی‌متر</text>
            <text x="62" y="70">پنجرهٔ دوجداره</text>
            <text x="522" y="566">تراز کف ±۰٫۰۰</text>
          </g>
        </g>
      ) : null}

      {/* walls */}
      <g className="sp-plan-walls" aria-hidden="true">
        <line x1="40" y1="40" x2="800" y2="40" strokeWidth="12" />
        <line x1="40" y1="580" x2="800" y2="580" strokeWidth="12" />
        <line x1="40" y1="40" x2="40" y2="580" strokeWidth="12" />
        <line x1="800" y1="40" x2="800" y2="580" strokeWidth="12" />

        <line x1="500" y1="40" x2="500" y2="250" strokeWidth="8" />
        <line x1="500" y1="310" x2="500" y2="580" strokeWidth="8" />
        <line x1="40" y1="340" x2="210" y2="340" strokeWidth="8" />
        <line x1="270" y1="340" x2="500" y2="340" strokeWidth="8" />
        <line x1="680" y1="40" x2="680" y2="160" strokeWidth="8" />
        <line x1="680" y1="230" x2="680" y2="340" strokeWidth="8" />
        <line x1="500" y1="340" x2="540" y2="340" strokeWidth="8" />
        <line x1="600" y1="340" x2="800" y2="340" strokeWidth="8" />
      </g>

      {/* windows */}
      <g className="sp-plan-windows" aria-hidden="true">
        <line x1="40" y1="120" x2="40" y2="220" />
        <line x1="34" y1="120" x2="34" y2="220" />
        <line x1="220" y1="40" x2="340" y2="40" />
        <line x1="220" y1="34" x2="340" y2="34" />
        <line x1="530" y1="40" x2="630" y2="40" />
        <line x1="530" y1="34" x2="630" y2="34" />
        <line x1="800" y1="120" x2="800" y2="260" />
        <line x1="806" y1="120" x2="806" y2="260" />
      </g>

      {/* door swings */}
      <g className="sp-plan-doors" aria-hidden="true">
        <path d="M500 250 A60 60 0 0 0 440 310" />
        <path d="M210 340 A60 60 0 0 1 270 280" />
        <path d="M540 340 A60 60 0 0 0 600 280" />
        <path d="M680 160 A70 70 0 0 1 610 230" />
      </g>

      {ROOMS.map((room) => {
        const active = room.id === activeRoom;
        return (
          <g
            key={room.id}
            className={`sp-plan-room${active ? ' is-active' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={`${room.label} — ${room.area}`}
            aria-pressed={active}
            onClick={() => onSelect(room.id)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              onSelect(room.id);
            }}
          >
            <rect className="sp-plan-room-fill" x={room.x} y={room.y} width={room.w} height={room.h} />
            {showFurniture ? <Furniture /> : null}
            <text
              x={room.cx}
              y={room.id === 'terrace' ? room.cy - 34 : room.cy + 4}
              textAnchor="middle"
              className="sp-plan-label"
            >
              {room.label}
            </text>
            <text
              x={room.cx}
              y={room.id === 'terrace' ? room.cy - 16 : room.cy + 22}
              textAnchor="middle"
              className="sp-plan-area"
            >
              {room.area}
            </text>
            <circle className="sp-plan-pulse" cx={room.cx} cy={room.id === 'terrace' ? room.cy + 14 : room.cy - 34} r="15" />
            <circle className="sp-plan-hotspot" cx={room.cx} cy={room.id === 'terrace' ? room.cy + 14 : room.cy - 34} r="15" />
            <text
              className="sp-plan-hotspot-no"
              x={room.cx}
              y={room.id === 'terrace' ? room.cy + 19 : room.cy - 29}
              textAnchor="middle"
            >
              {room.no}
            </text>
          </g>
        );
      })}

      <g className="sp-plan-entry" aria-hidden="true">
        <text x="640" y="596" textAnchor="middle">ورودی</text>
        <line x1="660" y1="580" x2="660" y2="560" />
      </g>
    </svg>
  );
}
