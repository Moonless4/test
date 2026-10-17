import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { HotelCard } from '@/components/cards/HotelCard';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { StateBlock } from '@/components/ui/StateBlocks';
import { useApp } from '@/context/AppContext';
import { HOTELS } from '@/data/hotels';
import { faDigits, formatJalaliLong } from '@/lib/jalali';
import { cn, formatToman } from '@/lib/utils';

export default function Account() {
  const { user, orders, favorites } = useApp();

  if (!user) {
    return (
      <div className="container-page py-6">
        <Breadcrumbs items={[{ label: 'حساب کاربری' }]} />
        <div className="mt-4">
          <StateBlock
            icon="user"
            title="برای مشاهده‌ی سفرها وارد حساب خود شوید"
            description="با ورود به حساب کاربری، رزروهای خود را مدیریت کنید، وضعیت استرداد را پیگیری کنید و تخفیف‌های اختصاصی اعضا را ببینید."
            action={
              <Link to="/login">
                <Button size="lg">ورود / ثبت‌نام</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const favoriteHotels = HOTELS.filter((hotel) => favorites.includes(hotel.id));

  return (
    <div className="container-page space-y-4 py-5 sm:py-6">
      <Breadcrumbs items={[{ label: 'حساب کاربری' }]} />

      <section className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
            {user.name.slice(0, 1)}
          </span>
          <div>
            <h1 className="text-sm font-bold text-ink-900">{user.name}</h1>
            <p className="num mt-1 text-2xs text-ink-500">{user.phone}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="سفرهای ثبت‌شده" value={faDigits(orders.length)} />
          <Stat label="علاقه‌مندی‌ها" value={faDigits(favorites.length)} />
          <Stat label="امتیاز باشگاه" value={faDigits(orders.length * 35)} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-ink-900">سفرهای من</h2>
        {orders.length === 0 ? (
          <StateBlock
            icon="briefcase"
            title="هنوز سفارشی ثبت نکرده‌اید"
            description="با رزرو بلیط، هتل یا تور، اطلاعات سفر شما در این بخش نمایش داده می‌شود و می‌توانید بلیط را مشاهده، چاپ یا درخواست استرداد ثبت کنید."
            action={
              <Link to="/flights">
                <Button>جستجوی پرواز</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <article key={order.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon
                      name={
                        order.kind === 'flight'
                          ? 'plane'
                          : order.kind === 'hotel'
                            ? 'hotel'
                            : order.kind === 'train'
                              ? 'train'
                              : order.kind === 'bus'
                                ? 'bus'
                                : 'compass'
                      }
                      className="h-5 w-5"
                    />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-ink-900">{order.title}</p>
                    <p className="mt-1 text-2xs text-ink-500">{order.subtitle}</p>
                    <p className="num mt-1.5 text-2xs text-ink-400">
                      شماره سفارش: {order.id} · {formatJalaliLong(new Date(order.createdAt))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <span
                    className={cn(
                      'chip',
                      order.status === 'issued'
                        ? 'border-success-500/30 bg-success-50 text-success-700'
                        : 'border-warning-500/30 bg-warning-50 text-warning-600',
                    )}
                  >
                    {order.status === 'issued' ? 'صادر شده' : 'در حال بررسی'}
                  </span>
                  <p className="num text-sm font-bold text-ink-900">{formatToman(order.price)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-ink-900">اقامتگاه‌های مورد علاقه</h2>
        {favoriteHotels.length === 0 ? (
          <StateBlock
            icon="heart"
            title="لیست علاقه‌مندی‌های شما خالی است"
            description="در صفحه‌های هتل، آیکون قلب را بزنید تا اقامتگاه‌های مورد علاقه‌تان در این بخش ذخیره شود."
            action={
              <Link to="/hotels">
                <Button variant="secondary">جستجوی هتل</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {favoriteHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} nights={1} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-200 px-4 py-2.5">
      <p className="num text-sm font-bold text-ink-900">{value}</p>
      <p className="mt-0.5 text-2xs text-ink-500">{label}</p>
    </div>
  );
}
