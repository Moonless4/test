import { useMemo, useState } from 'react';
import Icon from '../../components/Icons.jsx';
import { Link } from '../../router.jsx';
import { useAccount } from '../AccountContext.jsx';
import { useSite } from '../../site/SiteContent.jsx';
import { EmptyState, PageHead } from '../ui.jsx';
import { fa, formatDate } from '../../data/account.js';
import { deleteComment, listCommentsByAuthor } from '../../data/comments.js';

const TYPE_META = {
  product: { label: 'غذا', path: '/food' },
  post: { label: 'مقاله', path: '/blog' },
};

export default function AccountComments({ onToast }) {
  const { accountKey, loading } = useAccount();
  const { content } = useSite();
  const [version, setVersion] = useState(0);

  const comments = useMemo(
    () => listCommentsByAuthor(accountKey),
    [accountKey, version]
  );

  const targetOf = (comment) =>
    comment.targetType === 'product'
      ? content.products.find((item) => item.id === comment.targetId)
      : content.posts.find((item) => item.id === comment.targetId);

  return (
    <div className="acct-page">
      <PageHead
        title="نظرات من"
        text="نظرهایی که برای غذاها و مقالات وبلاگ ثبت کرده‌اید."
      />

      {loading ? (
        <div className="acct-skeleton" aria-hidden="true">
          <div className="acct-skeleton__block" />
          <div className="acct-skeleton__block" />
        </div>
      ) : comments.length ? (
        <ul className="my-comments">
          {comments.map((comment) => {
            const target = targetOf(comment);
            const meta = TYPE_META[comment.targetType] || TYPE_META.product;
            const title = target?.name || target?.title;
            return (
              <li key={comment.id} className="my-comment">
                <div className="my-comment__head">
                  <span className={`my-comment__type my-comment__type--${comment.targetType}`}>
                    {meta.label}
                  </span>
                  {target ? (
                    <Link className="my-comment__title" to={`${meta.path}/${comment.targetId}`}>
                      {title}
                    </Link>
                  ) : (
                    <span className="my-comment__title">محتوای حذف‌شده</span>
                  )}
                  <span className="my-comment__date">{formatDate(comment.createdAt)}</span>
                </div>

                {comment.rating > 0 && (
                  <div className="my-comment__stars" aria-label={`امتیاز ${fa(comment.rating)} از ۵`}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Icon key={value} name="star" size={14} filled={value <= comment.rating} />
                    ))}
                  </div>
                )}

                <p className="my-comment__text">{comment.text}</p>

                <button
                  type="button"
                  className="my-comment__remove"
                  onClick={() => {
                    deleteComment(comment.id, accountKey);
                    setVersion((prev) => prev + 1);
                    onToast('نظر شما حذف شد.');
                  }}
                >
                  <Icon name="trash" size={15} />
                  حذف نظر
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon="quote"
          title="هنوز نظری ثبت نکرده‌اید"
          text="از صفحه هر غذا یا مقاله وبلاگ می‌توانید نظر خود را بنویسید؛ نظرهای شما اینجا نگه داشته می‌شوند."
          actionLabel="مشاهده منو"
          to="/menu"
        />
      )}
    </div>
  );
}
