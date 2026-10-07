import { useState, type FormEvent } from 'react';
import { Star } from 'lucide-react';
import { toFa } from '../../lib/format';
import type { ProductReview } from '../../lib/types';
import Button from '../ui/Button';

const RATING_LABELS = ['خیلی بد', 'بد', 'متوسط', 'خوب', 'عالی'];

const persianDate = (): string =>
  new Intl.DateTimeFormat('fa-IR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

type Props = {
  productName: string;
  onSubmit: (review: ProductReview) => void;
};

export default function ReviewForm({ productName, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const shown = hover || rating;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      setError('لطفاً نام خود را وارد کنید.');
      return;
    }
    if (rating === 0) {
      setError('لطفاً امتیاز خود را انتخاب کنید.');
      return;
    }
    if (text.trim().length < 10) {
      setError('متن نظر باید حداقل ۱۰ کاراکتر باشد.');
      return;
    }

    onSubmit({
      name: name.trim(),
      avatar: '',
      rating,
      date: persianDate(),
      text: text.trim(),
    });

    setName('');
    setRating(0);
    setText('');
    setError('');
    setDone(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-panel border border-line bg-white p-5 sm:p-6"
      aria-label={`ثبت نظر برای ${productName}`}
    >
      <h3 className="text-[15px] font-bold text-ink">ثبت نظر درباره {productName}</h3>
      <p className="mt-1.5 text-[12px] leading-6 text-muted">
        اگر این محصول را خریده‌اید، تجربه‌تان را برای دیگران بنویسید.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-ink">نام شما</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setDone(false);
            }}
            placeholder="مثلاً سارا محمدی"
            className="h-11 w-full rounded-xl border border-line bg-cream px-3.5 text-[13px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-teal-700 focus:bg-white"
          />
        </label>

        <div>
          <span className="mb-2 block text-[13px] font-medium text-ink">امتیاز شما</span>
          <div className="flex h-11 items-center gap-1">
            <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setRating(value);
                    setDone(false);
                  }}
                  onMouseEnter={() => setHover(value)}
                  aria-label={`امتیاز ${toFa(value)} از ۵`}
                  aria-pressed={rating === value}
                  className="rounded p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      value <= shown ? 'fill-gold text-gold' : 'fill-transparent text-line'
                    }`}
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
            <span className="ms-2 text-[12px] text-muted">
              {rating > 0 ? RATING_LABELS[rating - 1] : 'انتخاب کنید'}
            </span>
          </div>
        </div>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-[13px] font-medium text-ink">متن نظر</span>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setDone(false);
          }}
          rows={4}
          maxLength={500}
          placeholder="کیفیت دوخت، اندازه، رنگ و تجربه استفاده از این محصول چطور بود؟"
          className="w-full resize-none rounded-xl border border-line bg-cream p-3.5 text-[13px] leading-7 text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-teal-700 focus:bg-white"
        />
      </label>

      {error ? <p className="mt-3 text-[12px] font-medium text-sale">{error}</p> : null}
      {done ? (
        <p className="mt-3 text-[12px] font-medium text-teal-700">
          نظر شما ثبت شد. ممنون که تجربه‌تان را نوشتید!
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button type="submit">ثبت نظر</Button>
        <span className="text-[11px] text-muted">{toFa(text.trim().length)} / ۵۰۰</span>
      </div>
    </form>
  );
}
