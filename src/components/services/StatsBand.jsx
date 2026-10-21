// A four-up numbers band. `tone="dark"` is used on the construction page so it
// reads as an engineering datasheet rather than a marketing strip.
export default function StatsBand({ stats, tone = 'light' }) {
  return (
    <div className={`sp-stats sp-stats-${tone}`}>
      {stats.map((stat) => (
        <div className="sp-stat" key={stat.label}>
          <span className="sp-stat-value">{stat.value}</span>
          <span className="sp-stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
