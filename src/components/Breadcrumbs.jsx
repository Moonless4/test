// Breadcrumb trail shared by the detail pages.
export default function Breadcrumbs({ items }) {
  return (
    <nav className="rb-breadcrumb" aria-label="مسیر صفحه">
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span key={item.label} className="rb-breadcrumb-item">
            {item.href && !last ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span aria-current={last ? 'page' : undefined}>{item.label}</span>
            )}
            {last ? null : <i className="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true" />}
          </span>
        );
      })}
    </nav>
  );
}
