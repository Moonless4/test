import { useState } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { promoArt } from '../../lib/data';
import Img from '../ui/Img';
import Reveal from '../ui/Reveal';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail('');
  };

  return (
    <section className="container mt-12 sm:mt-16" aria-label="خبرنامه">
      <Reveal>
        <div className="grid overflow-hidden rounded-panel bg-teal-800 shadow-card lg:grid-cols-2">
          <div className="relative min-h-[180px] lg:min-h-[300px]">
            <Img
              src={promoArt.newsletter}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-teal-900/70 to-transparent lg:bg-gradient-to-l" />
          </div>

          <div className="p-7 sm:p-10 lg:p-12">
            <span className="text-[11px] font-medium tracking-wide text-teal-200 sm:text-xs">
              خبرنامه استایل آن
            </span>
            <h2 className="mt-3 text-[22px] font-black text-white sm:text-[28px]">
              عضویت در خبرنامه
            </h2>
            <p className="mt-3 text-[13px] leading-7 text-white/70 sm:text-sm">
              از جدیدترین تخفیف‌ها و محصولات جدید باخبر شوید.
            </p>

            {done ? (
              <p className="mt-6 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3.5 text-[13px] font-medium text-white ring-1 ring-white/20">
                <CheckCircle2 className="h-5 w-5 text-teal-300" />
                عضویت شما ثبت شد. اولین خبر زودتر از همه به شما می‌رسد.
              </p>
            ) : (
              <form onSubmit={submit} className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">
                  ایمیل شما
                </label>
                <div className="flex h-12 flex-1 items-center gap-2 rounded-xl bg-white/10 px-4 ring-1 ring-white/15 focus-within:bg-white/15">
                  <Mail className="h-4 w-4 shrink-0 text-teal-200" />
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ایمیل خود را وارد کنید"
                    className="h-full w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/50"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 shrink-0 rounded-xl bg-white px-7 text-[13px] font-bold text-black transition-colors hover:bg-cream"
                >
                  عضویت
                </button>
              </form>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
