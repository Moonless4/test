import Icon from '../../components/Icons.jsx';
import { useRouter } from '../../router.jsx';
import { useAccount } from '../AccountContext.jsx';
import { PageHead, Panel } from '../ui.jsx';
import { fa, formatDate } from '../../data/account.js';
import { couponLabel, setPendingCoupon } from '../../data/rewardCoupons.js';

export default function RewardsPage({ onToast }) {
  const { navigate } = useRouter();
  const { loyalty, redeemReward } = useAccount();
  const remaining = Math.max(0, loyalty.nextRewardAt - loyalty.points);
  const progress = Math.min(100, Math.round((loyalty.points / loyalty.nextRewardAt) * 100));
  const readyCoupons = (loyalty.coupons || []).filter((coupon) => !coupon.usedAt);

  /* A claimed reward becomes a code the customer can spend in the cart */
  const claim = (reward) => {
    const coupon = redeemReward(reward);
    if (!coupon) {
      onToast('امتیاز کافی برای این جایزه ندارید.');
      return;
    }
    onToast(`«${reward.title}» فعال شد؛ کد ${coupon.code} در جوایز آماده استفاده است.`);
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      onToast('کد جایزه کپی شد.');
    } catch {
      onToast(`کد جایزه: ${code}`);
    }
  };

  return (
    <div className="acct-page">
      <PageHead
        title="باشگاه مشتریان"
        text="با هر سفارش و هر رزرو امتیاز بگیرید؛ امتیازها را به تخفیف و تجربه‌های ویژه تبدیل کنید."
      />

      <section className="loyalty-hero">
        <div className="loyalty-hero__main">
          <span className="loyalty-hero__eyebrow">
            <Icon name="star" size={13} filled />
            سطح {loyalty.tier}
          </span>
          <h2>
            {fa(loyalty.points)} <small>امتیاز</small>
          </h2>
          <p>
            {remaining > 0
              ? `${fa(remaining)} امتیاز تا پاداش بعدی`
              : 'به پاداش بعدی رسیده‌اید؛ یکی از جوایز را انتخاب کنید.'}
          </p>
          <div className="loyalty-hero__bar" aria-hidden="true">
            <i style={{ width: `${progress}%` }} />
            <span style={{ insetInlineStart: `${progress}%` }} />
          </div>
          <div className="loyalty-hero__labels">
            <span>{fa(loyalty.points)} امتیاز</span>
            <span>{fa(loyalty.nextRewardAt)} امتیاز</span>
          </div>
        </div>

        <div className="loyalty-hero__art" aria-hidden="true">
          <Icon name="gift" size={54} />
          <small>هر ۱۰٬۰۰۰ تومان سفارش = ۱۰ امتیاز</small>
        </div>
      </section>

      <Panel title="جوایز قابل دریافت" subtitle="با امتیازهای فعلی می‌توانید این جوایز را فعال کنید.">
        <div className="reward-grid">
          {loyalty.rewards.map((reward) => {
            const affordable = loyalty.points >= reward.cost;
            return (
              <article key={reward.id} className={`reward-card ${affordable ? '' : 'is-locked'}`}>
                <span className="reward-card__icon">
                  <Icon name={reward.icon} size={20} />
                </span>
                <b>{reward.title}</b>
                <p>{reward.description}</p>
                <div className="reward-card__foot">
                  <span className="reward-card__cost">
                    <Icon name="star" size={13} filled />
                    {fa(reward.cost)} امتیاز
                  </span>
                  <button
                    type="button"
                    className={`btn btn--sm ${affordable ? 'btn--primary' : 'btn--outline'}`}
                    disabled={!affordable}
                    onClick={() => claim(reward)}
                  >
                    {affordable ? 'دریافت جایزه' : `${fa(reward.cost - loyalty.points)} امتیاز دیگر`}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>

      <Panel
        title="جوایز آماده استفاده"
        subtitle="جایزه‌هایی که گرفته‌اید و هنوز استفاده نشده‌اند؛ یکی را انتخاب کنید."
      >
        {readyCoupons.length === 0 ? (
          <p className="reward-empty">
            جایزه فعالی ندارید. با امتیازهای خود یکی از جوایز بالا را بگیرید تا کد آن همین‌جا
            نمایش داده شود.
          </p>
        ) : (
          <ul className="reward-coupon-list">
            {readyCoupons.map((coupon) => (
              <li key={coupon.id} className="reward-coupon">
                <span className="reward-coupon__icon">
                  <Icon name="gift" size={18} />
                </span>
                <div className="reward-coupon__copy">
                  <b>{couponLabel(coupon)}</b>
                  <small>
                    {coupon.title} · دریافت {formatDate(coupon.claimedAt)}
                  </small>
                  <code dir="ltr">{coupon.code}</code>
                </div>
                <div className="reward-coupon__actions">
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    onClick={() => {
                      setPendingCoupon(coupon.code);
                      navigate('/cart');
                    }}
                  >
                    استفاده در سبد خرید
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => copyCode(coupon.code)}
                  >
                    کپی کد
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="تاریخچه امتیازها" subtitle="آخرین تغییرات امتیاز باشگاه شما">
        <ul className="loyalty-history">
          {loyalty.history.map((entry) => (
            <li key={entry.id}>
              <span className={`loyalty-history__icon ${entry.points < 0 ? 'is-minus' : ''}`}>
                <Icon name={entry.points < 0 ? 'minus' : 'plus'} size={14} />
              </span>
              <div>
                <b>{entry.label}</b>
                <small>{formatDate(entry.date)}</small>
              </div>
              <span className={`loyalty-history__points ${entry.points < 0 ? 'is-minus' : ''}`}>
                {entry.points > 0 ? '+' : '−'}
                {fa(Math.abs(entry.points))}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
