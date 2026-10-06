import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';

export default function NotFoundPage() {
  return (
    <div className="container py-14 sm:py-20">
      <EmptyState
        icon={<Home className="h-7 w-7" />}
        title="صفحه مورد نظر پیدا نشد"
        text="آدرس وارد شده معتبر نیست یا این صفحه جابه‌جا شده است."
        action={
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-xl bg-teal-800 px-5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
          >
            بازگشت به صفحه اصلی
          </Link>
        }
      />
    </div>
  );
}
