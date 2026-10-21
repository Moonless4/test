// One horizontal band of an editorial page. It reuses the service pages'
// geometry (`sp-band` + `sp-container`) so every route shares the same column
// width, gutters and vertical rhythm as the benchmark pages.
export default function Band({ children, tone = 'default', className = '', id }) {
  const tones = {
    default: '',
    soft: 'sp-band-soft',
    deep: 'sp-band-deep',
  };
  const classes = ['sp-band', tones[tone], className].filter(Boolean).join(' ');

  return (
    <section id={id} className={classes}>
      <div className="sp-container">{children}</div>
    </section>
  );
}
