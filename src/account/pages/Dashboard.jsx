import Icon from '../../components/Icons.jsx';
import { Link } from '../../router.jsx';
import { useAccount } from '../AccountContext.jsx';
import { EmptyState, Panel, StatusPill } from '../ui.jsx';
import {
  activeOrder,
  fa,
  findProduct,
  formatDate,
  formatDayNumber,
  formatMonth,
  formatWeekday,
  money,
  ORDER_STATUS,
  ORDER_TYPE,
  orderItemCount,
  orderNumber,
  orderTotal,
  relativeTime,
  resolveItems,
  RESERVATION_STATUS,
  upcomingReservation,
} from '../../data/account.js';

function StatTile({ icon, label, value, hint, to }) {
  const content = (
    <>
      <span className="acct-stat__icon">
        <Icon name={icon} size={18} />
      </span>
      <span className="acct-stat__copy">
        <small>{label}</small>
        <b>{value}</b>
        {hint && <em>{hint}</em>}
      </span>
    </>
  );

  return to ? (
    <Link className="acct-stat" to={to}>
      {content}
    </Link>
  ) : (
    <div className="acct-stat">{content}</div>
  );
}

export default function Dashboard({ onMenu, onReserve, onReorder }) {
  const { user, orders, reservations, favorites, loyalty, notifications, loading } = useAccount();

  const currentOrder = activeOrder(orders);
  const nextReservation = upcomingReservation(reservations);
  const lastOrder = orders[0];
  const recentNotifications = notifications.slice(0, 3);
  const favoriteProducts = favorites.map(findProduct).filter(Boolean);
  const progress = Math.min(100, Math.round((loyalty.points / loyalty.nextRewardAt) * 100));

  const message = currentOrder
    ? `سفارش شماره ${orderNumber(currentOrder)} شما در حال آماده‌سازی است؛ امروز چه چیزی میل دارید؟`
    : nextReservation
      ? `میز شما برای ${formatDate(nextReservation.date)} ساعت ${nextReservation.time} رزرو شده است.`
      : 'منوی تازه امروز آماده است؛ اولین سفارش این هفته با ارسال رایگان ثبت می‌شود.';

  if (loading) {
    return (
      <div className="acct-skeleton" aria-hidden="true">
        <div className="acct-skeleton__hero" />
        <div className="acct-skeleton__row">
          <div className="acct-skeleton__tile" />
          <div className="acct-skeleton__tile" />
          <div className="acct-skeleton__tile" />
          <div className="acct-skeleton__tile" />
        </div>
        <div className="acct-skeleton__block" />
      </div>
    );
  }

  return (
    <div className="acct-page acct-page--dashboard">
      <section className="acct-hero">
        <div className="acct-hero__copy">
          <span className="acct-hero__eyebrow">
            <Icon name="star" size={13} filled />
            باشگاه مشتریان {loyalty.tier}
          </span>
          <h1>خوش آمدید، {user.firstName}</h1>
          <p>{message}</p>
          <div className="acct-hero__actions">
            <button type="button" className="btn btn--primary" onClick={() => onMenu('all')}>
              <Icon name="cart" size={17} />
              سفارش جدید
            </button>
            <button type="button" className="btn btn--outline" onClick={onReserve}>
              <Icon name="calendar" size={17} />
              رزرو میز
            </button>
            <Link className="btn btn--ghost" to="/account/orders">
              مشاهده سفارش‌ها
            </Link>
          </div>
        </div>

        <div className="acct-hero__art" aria-hidden="true">
          <span className="acct-hero__halo" />
          <img src="/assets/products/chef-pizza.webp" alt="" />
          <span className="acct-hero__chip">
            <b>{fa(loyalty.points)}</b>
            امتیاز باشگاه
          </span>
        </div>
      </section>

      <div className="acct-stats">
        <StatTile
          icon="box"
          label="سفارش جاری"
          value={currentOrder ? `#${orderNumber(currentOrder)}` : 'ندارد'}
          hint={currentOrder ? ORDER_STATUS[currentOrder.status].label : 'همه سفارش‌ها تحویل شده'}
          to="/account/orders"
        />
        <StatTile
          icon="calendar"
          label="رزرو بعدی"
          value={nextReservation ? formatDate(nextReservation.date) : 'ندارد'}
          hint={nextReservation ? `${nextReservation.time} · ${fa(nextReservation.guests)} نفر` : 'میز خود را رزرو کنید'}
          to="/account/reservations"
        />
        <StatTile
          icon="heart"
          label="علاقه‌مندی‌ها"
          value={`${fa(favoriteProducts.length)} آیتم`}
          hint="غذاهای مورد علاقه شما"
          to="/account/favorites"
        />
        <StatTile
          icon="gift"
          label="امتیاز باشگاه"
          value={fa(loyalty.points)}
          hint={`${fa(Math.max(0, loyalty.nextRewardAt - loyalty.points))} امتیاز تا پاداش`}
          to="/account/rewards"
        />
      </div>

      <div className="acct-columns">
        <Panel
          title="آخرین سفارش"
          subtitle={lastOrder ? `ثبت‌شده در ${formatDate(lastOrder.createdAt)}` : undefined}
          action={
            lastOrder && (
              <Link className="acct-link" to="/account/orders">
                همه سفارش‌ها
                <Icon name="chevronLeft" size={14} />
              </Link>
            )
          }
        >
          {lastOrder ? (
            <article className="order-preview">
              <div className="order-preview__top">
                <div>
                  <b>سفارش #{orderNumber(lastOrder)}</b>
                  <small>
                    {ORDER_TYPE[lastOrder.type]} · {fa(orderItemCount(lastOrder))} آیتم
                  </small>
                </div>
                <StatusPill tone={ORDER_STATUS[lastOrder.status].tone}>
                  {ORDER_STATUS[lastOrder.status].label}
                </StatusPill>
              </div>

              <ul className="order-preview__items">
                {resolveItems(lastOrder)
                  .slice(0, 3)
                  .map((item) => (
                    <li key={item.productId}>
                      <span className="order-preview__thumb">
                        <img src={item.product?.image} alt={item.product?.name || ''} loading="lazy" />
                      </span>
                      <span className="order-preview__name">
                        {item.product?.name || 'آیتم حذف‌شده'}
                        <small>{fa(item.qty)} × {money(item.price)}</small>
                      </span>
                    </li>
                  ))}
              </ul>

              <div className="order-preview__total">
                <span>مبلغ کل</span>
                <b>{money(orderTotal(lastOrder))}</b>
              </div>

              <div className="order-preview__actions">
                <Link className="btn btn--outline btn--sm" to={`/account/orders/${lastOrder.id}`}>
                  مشاهده جزئیات
                </Link>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => onReorder(lastOrder)}
                >
                  <Icon name="repeat" size={15} />
                  سفارش مجدد
                </button>
              </div>
            </article>
          ) : (
            <EmptyState
              icon="box"
              title="هنوز سفارشی ثبت نکرده‌اید."
              text="منوی آترین هر روز تازه آماده می‌شود؛ از یک غذای محبوب شروع کنید."
              actionLabel="مشاهده منو"
              onAction={() => onMenu('all')}
            />
          )}
        </Panel>

        <Panel
          title="رزرو بعدی"
          subtitle={nextReservation ? nextReservation.restaurant : undefined}
          action={
            <Link className="acct-link" to="/account/reservations">
              همه رزروها
              <Icon name="chevronLeft" size={14} />
            </Link>
          }
        >
          {nextReservation ? (
            <article className="reserve-preview">
              <div className="reserve-preview__date">
                <b>{formatDayNumber(nextReservation.date)}</b>
                <small>{formatMonth(nextReservation.date)}</small>
                <em>{formatWeekday(nextReservation.date)}</em>
              </div>
              <div className="reserve-preview__body">
                <div className="reserve-preview__row">
                  <span>
                    <Icon name="clock" size={16} />
                    ساعت {nextReservation.time}
                  </span>
                  <span>
                    <Icon name="users" size={16} />
                    {fa(nextReservation.guests)} نفر
                  </span>
                </div>
                <p>{nextReservation.area}</p>
                <StatusPill tone={RESERVATION_STATUS[nextReservation.status].tone}>
                  {RESERVATION_STATUS[nextReservation.status].label}
                </StatusPill>
                <div className="reserve-preview__actions">
                  <Link
                    className="btn btn--outline btn--sm"
                    to={`/account/reservations/${nextReservation.id}`}
                  >
                    جزئیات رزرو
                  </Link>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={onReserve}>
                    رزرو جدید
                  </button>
                </div>
              </div>
            </article>
          ) : (
            <EmptyState
              icon="calendar"
              title="رزرو فعالی ندارید."
              text="میز خود را برای یک شب دل‌نشین در آترین رزرو کنید."
              actionLabel="رزرو میز"
              onAction={onReserve}
            />
          )}
        </Panel>
      </div>

      <div className="acct-columns">
        <Panel
          title="علاقه‌مندی‌های شما"
          subtitle="غذاهایی که برای بعد کنار گذاشته‌اید"
          action={
            <Link className="acct-link" to="/account/favorites">
              مشاهده همه
              <Icon name="chevronLeft" size={14} />
            </Link>
          }
        >
          {favoriteProducts.length ? (
            <ul className="fav-strip">
              {favoriteProducts.slice(0, 3).map((product) => (
                <li key={product.id}>
                  <Link to={`/food/${product.id}`} className="fav-strip__item">
                    <span className="fav-strip__thumb">
                      <img src={product.image} alt={product.name} loading="lazy" />
                    </span>
                    <span className="fav-strip__copy">
                      <b>{product.name}</b>
                      <small>{money(product.price)}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon="heart"
              title="هنوز غذایی به علاقه‌مندی‌ها اضافه نکرده‌اید."
              text="با زدن علامت قلب روی هر غذا، آن را برای بعد ذخیره کنید."
              actionLabel="مشاهده منو"
              onAction={() => onMenu('all')}
            />
          )}
        </Panel>

        <Panel
          title="اعلان‌های تازه"
          subtitle={`${fa(notifications.filter((item) => !item.read).length)} اعلان خوانده‌نشده`}
          action={
            <Link className="acct-link" to="/account/notifications">
              همه اعلان‌ها
              <Icon name="chevronLeft" size={14} />
            </Link>
          }
        >
          {recentNotifications.length ? (
            <ul className="mini-feed">
              {recentNotifications.map((item) => (
                <li key={item.id} className={item.read ? '' : 'is-unread'}>
                  <span className="mini-feed__dot" aria-hidden="true" />
                  <div>
                    <b>{item.title}</b>
                    <small>{relativeTime(item.createdAt)}</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="bell" title="اعلانی ندارید." />
          )}
        </Panel>
      </div>

      <section className="acct-banner">
        <div>
          <span className="acct-banner__eyebrow">
            <Icon name="star" size={13} filled />
            پیشرفت باشگاه مشتریان
          </span>
          <h2>{fa(loyalty.nextRewardAt - loyalty.points)} امتیاز تا پاداش بعدی</h2>
          <p>با هر سفارش امتیاز بگیرید و آن را به تخفیف، دسر یا نوشیدنی رایگان تبدیل کنید.</p>
        </div>
        <div className="acct-banner__progress">
          <span className="acct-banner__bar" aria-hidden="true">
            <i style={{ width: `${progress}%` }} />
          </span>
          <small>
            {fa(loyalty.points)} از {fa(loyalty.nextRewardAt)} امتیاز
          </small>
          <Link className="btn btn--gold btn--sm" to="/account/rewards">
            مشاهده جوایز
          </Link>
        </div>
      </section>
    </div>
  );
}
