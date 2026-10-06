import { Link } from 'react-router-dom';
import { ArrowUpRight, Footprints, Gem, Shirt, User } from 'lucide-react';
import { categories } from '../../lib/data';
import { toFa } from '../../lib/format';
import type { CategoryId } from '../../lib/types';
import Img from '../ui/Img';
import Reveal from '../ui/Reveal';

const ICONS: Record<CategoryId, typeof User> = {
  men: User,
  women: Shirt,
  shoes: Footprints,
  accessories: Gem,
};

export default function CategoryCards() {
  return (
    <section className="container mt-10 sm:mt-14" aria-label="دسته‌بندی‌ها">
      <div className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
        {categories.map((category, i) => {
          const Icon = ICONS[category.id];
          return (
            <Reveal key={category.id} delay={i * 80}>
              <Link
                to={`/shop/${category.id}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-panel bg-teal-800 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift sm:aspect-[3/4]"
              >
                <Img
                  src={category.image}
                  alt={category.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-teal-900/40 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur transition-colors duration-300 group-hover:bg-white group-hover:text-teal-900">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </span>
                  <h3 className="text-base font-bold text-white sm:text-lg">{category.title}</h3>
                  <p className="mt-1 text-[11px] text-white/70 sm:text-xs">
                    {toFa(category.itemCount)} کالا · {category.subtitle}
                  </p>
                  <span className="mt-3 flex items-center gap-1 text-[12px] font-medium text-teal-200 transition-colors group-hover:text-white sm:text-[13px]">
                    مشاهده +
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-[-2px]" />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
