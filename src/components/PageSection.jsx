// One horizontal band of a rebuilt page. Replaces the Elementor container
// (`e-con-boxed` + `e-con-inner`) with a plain section that carries the same
// 1440px content width and gutters from `styles/site.css`.
export default function PageSection({ children, className = '', id }) {
  return (
    <section id={id} className={className ? `rb-section ${className}` : 'rb-section'}>
      <div className="rb-section-inner">{children}</div>
    </section>
  );
}
