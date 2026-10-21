import { Link } from '../router.jsx';
import Icon from './Icons.jsx';

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="breadcrumb" aria-label="مسیر صفحه">
      <Link to="/">خانه</Link>
      {items.map((item) => (
        <span className="breadcrumb__item" key={item.label}>
          <Icon name="chevronLeft" size={12} />
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
