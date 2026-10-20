// The reference theme's own JS reads each widget's `data-settings` and turns it
// into the CSS custom properties that drive the responsive grids
// (`.desktop-columns` etc. use repeat(var(--desktop-cols), 1fr)). Without it
// those grids collapse to a single column.
const BREAKPOINTS = [
  { key: 'desktop', colsVar: '--desktop-cols', gapVar: '--desktop-gap', gap: '16px' },
  { key: 'tablet', colsVar: '--tablet-cols', gapVar: '--tablet-gap', gap: '12px' },
  { key: 'mobile', colsVar: '--mobile-cols', gapVar: '--mobile-gap', gap: '8px' },
];

export function applyLayoutVars(root = document) {
  root.querySelectorAll('[data-settings]').forEach((el) => {
    let settings;
    try {
      settings = JSON.parse(el.dataset.settings);
    } catch {
      return;
    }

    const grid = el.querySelector('.desktop-columns, .tablet-columns, .mobile-columns');
    if (!grid) return;

    BREAKPOINTS.forEach(({ key, colsVar, gapVar, gap }) => {
      const columns = settings[key]?.columns;
      if (!columns) return;
      grid.style.setProperty(colsVar, String(columns));
      grid.style.setProperty(gapVar, gap);
    });
  });
}
