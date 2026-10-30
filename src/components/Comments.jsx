import { useMemo, useState } from 'react';
import Icon from './Icons.jsx';
import { useAccount } from '../account/AccountContext.jsx';
import { addComment, listComments } from '../data/comments.js';
import { fa, formatDate } from '../data/account.js';

const fullName = (user) => [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();

const initial = (name) => (name || '').trim().charAt(0) || '؟';

export default function Comments({ targetType, targetId, withRating = false, onAdded }) {
  const { user, isAuthenticated } = useAccount();
  const [version, setVersion] = useState(0);
  const comments = useMemo(
    () => listComments(targetType, targetId),
    [targetType, targetId, version]
  );
  const [name, setName] = useState(() => (isAuthenticated ? fullName(user) : ''));
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanText = text.trim();
    if (cleanName.length < 2) {
      setSent(false);
      setError('نام خود را وارد کنید.');
      return;
    }
    if (cleanText.length < 3) {
      setSent(false);
      setError('متن نظر را بنویسید.');
      return;
    }
    addComment({
      targetType,
      targetId,
      name: cleanName,
      text: cleanText,
      rating: withRating ? rating : 0,
    });
    setVersion((prev) => prev + 1);
    setText('');
    setError('');
    setSent(true);
    onAdded?.();
  };

  return (
    <section className="comments">
      <div className="comments__head">
        <h2>{withRating ? 'نظرات کاربران' : 'دیدگاه‌ها'}</h2>
        <span className="comments__count">{fa(comments.length)} نظر</span>
      </div>

      <form className="comment-form" onSubmit={submit} noValidate>
        <div className="comment-form__row">
          <label className="comment-form__field">
            <span>نام شما</span>
            <input
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSent(false);
              }}
              placeholder="مثلاً سارا محمدی"
            />
          </label>

          {withRating && (
            <div className="comment-form__field">
              <span>امتیاز شما</span>
              <div className="comment-stars comment-stars--input" role="group" aria-label="امتیاز شما">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={value <= rating ? 'is-on' : ''}
                    aria-label={`${fa(value)} ستاره`}
                    aria-pressed={value <= rating}
                    onClick={() => setRating(value)}
                  >
                    <Icon name="star" size={19} filled={value <= rating} className={value <= rating ? 'is-on' : ''} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <label className="comment-form__field">
          <span>متن نظر</span>
          <textarea
            rows={4}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setSent(false);
            }}
            placeholder={withRating ? 'تجربه‌تان از این غذا چطور بود؟' : 'نظرتان درباره این مقاله…'}
          />
        </label>

        {error && <p className="comment-form__error">{error}</p>}

        <div className="comment-form__actions">
          <button type="submit" className="btn btn--primary">
            <Icon name="edit" size={17} />
            ثبت نظر
          </button>
          {sent && (
            <span className="comment-form__sent">
              <Icon name="check" size={15} />
              نظر شما ثبت شد.
            </span>
          )}
        </div>
      </form>

      {comments.length > 0 ? (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment">
              <span className="comment__avatar" aria-hidden="true">
                {initial(comment.name)}
              </span>
              <div className="comment__body">
                <div className="comment__top">
                  <strong>{comment.name}</strong>
                  <span className="comment__date">{formatDate(comment.createdAt)}</span>
                </div>
                {comment.rating > 0 && (
                  <div className="comment-stars" aria-label={`امتیاز ${fa(comment.rating)} از ۵`}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Icon
                        key={value}
                        name="star"
                        size={14}
                        filled={value <= comment.rating}
                        className={value <= comment.rating ? 'is-on' : ''}
                      />
                    ))}
                  </div>
                )}
                <p>{comment.text}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="comments__empty">هنوز نظری ثبت نشده است؛ اولین نفر باشید.</p>
      )}
    </section>
  );
}
