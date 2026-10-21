import { Link } from '../router.jsx';
import Icon from '../components/Icons.jsx';

export default function NotFoundPage() {
  return (
    <section className="page-section">
      <div className="container">
        <div className="page-empty">
          <span className="page-empty__icon">
            <Icon name="fork" size={30} />
          </span>
          <h1>این صفحه پیدا نشد</h1>
          <p>ممکن است آدرس تغییر کرده باشد. از منوی اصلی یا دکمه زیر ادامه دهید.</p>
          <Link className="btn btn--primary" to="/menu">
            مشاهده منو
            <Icon name="chevronLeft" size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
