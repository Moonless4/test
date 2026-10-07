import { Link } from 'react-router-dom';
import { categories } from '../../lib/data';
import { toFa } from '../../lib/format';
import Img from '../ui/Img';
import Reveal from '../ui/Reveal';

/** Category rail: a photo medallion resting on a soft pedestal, name underneath. */
export default function CategoryCards() {
  return (
    <section className="container mt-10 sm:mt-14" aria-label="دسته‌بندی‌ها">
      <div className="grid grid-cols-3 gap-x-3 gap-y-8 sm:gap-x-6 lg:grid-cols-6 lg:gap-x-5">
        {categories.map((category, i) => (
          <Reveal key={category.id} delay={i * 70}>
            <Link
              to={`/shop/${category.id}`}
              className="group flex flex-col items-center text-center"
            >
              <span className="flex flex-col items-center transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-cream ring-1 ring-line transition-colors duration-500 group-hover:bg-teal-50 group-hover:ring-teal-200 sm:h-28 sm:w-28 lg:h-[162px] lg:w-[162px]">
                  <Img
                    src={category.image}
                    alt={category.title}
                    loading="lazy"
                    decoding="async"
                    className="h-[86%] w-[86%] rounded-full object-cover shadow-soft transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                </span>
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-8 rounded-[50%] bg-ink/[0.09] blur-[4px] transition-all duration-500 group-hover:w-12 group-hover:bg-ink/[0.14] sm:h-2 sm:w-12 lg:w-16"
                />
              </span>

              <h3 className="mt-3.5 text-[12px] font-bold text-ink transition-colors duration-300 group-hover:text-teal-800 sm:text-sm lg:text-[15px]">
                {category.title}
              </h3>
              <p className="mt-1 text-[10px] text-muted sm:text-[11px]">
                {toFa(category.itemCount)} کالا
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
