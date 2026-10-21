// The theme's heading widget markup (`luxina_heading_wrap`), written as JSX so
// pages no longer need the Elementor widget wrappers to look right.
export default function PageHeading({ title, subtitle, icon = 'luxina-icon-home-5-line', className = '' }) {
  return (
    <div className={className ? `luxina_heading_wrap ${className}` : 'luxina_heading_wrap'}>
      <i className={`luxinaicon ${icon} luxina_heading_icon`} aria-hidden="true" />
      <div className="luxina_heading_title_inner">
        <div className="luxina_heading_title">{title}</div>
        {subtitle ? <span className="luxina_heading_subtitle">{subtitle}</span> : null}
      </div>
    </div>
  );
}
