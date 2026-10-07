import { Link } from 'react-router-dom';
import { ArrowUpRight, Briefcase, Footprints, Gem, Shirt, Sparkles, User } from 'lucide-react';
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
  bags: Briefcase,
  beauty: Sparkles,
};

export default function CategoryCards() {
  return (
    <section className="container mt-10 sm:mt-14" aria-label="دسته‌بندی‌ها">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {categories.map((category, i) => {
          const Icon = ICONS[category.id];
          return (
            <Reveal key={category.id} delay={i * 60}>
              <Link
                to={`/shop/${category.id}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-card bg-teal-800 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
              >
                <Img
                  src={category.image}
                  alt={category.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-teal-900/40 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5">
                  <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white ring-1 ring-white/25 backdrop-blur transition-colors duration-300 group-hover:bg-white group-hover:text-teal-900">
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <h3 className="text-[13px] font-bold text-white sm:text-sm">{category.title}</h3>
                  <p className="mt-0.5 text-[10px] text-white/70 sm:text-[11px]">
                    {toFa(category.itemCount)} کالا · {category.subtitle}
                  </p>
                  <span className="mt-2 flex items-center gap-1 text-[11px] font-medium text-teal-200 transition-colors group-hover:text-white sm:text-[12px]">
                    مشاهده +
                    <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-[-2px]" />
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
