import { Link } from 'react-router-dom';
import { categories } from '../../lib/data';
import Img from '../ui/Img';
import Reveal from '../ui/Reveal';

/** Category rail: round photo medallions — plain rings on phones, on a light pedestal from sm up. */
export default function CategoryCards() {
  return (
    <section className="container mt-10 sm:mt-14" aria-label="دسته‌بندی‌ها">
      <div className="grid grid-cols-3 gap-x-3 gap-y-7 sm:gap-x-6 lg:grid-cols-6 lg:gap-x-5">
        {categories.map((category, i) => (
          <Reveal key={category.id} delay={i * 70}>
            <Link
              to={`/shop/${category.id}`}
              className="group flex flex-col items-center text-center"
            >
              <span className="relative flex flex-col items-center transition-transform duration-500 ease-out group-hover:-translate-y-1">
                <Img
                  src={category.image}
                  alt={category.title}
                  loading="lazy"
                  decoding="async"
                  className="relative z-10 h-[88px] w-[88px] rounded-full object-cover shadow-soft ring-2 ring-line transition-transform duration-700 ease-out group-hover:scale-[1.03] sm:h-28 sm:w-28 sm:ring-0 lg:h-[152px] lg:w-[152px]"
                />

                {/* pedestal: desktop and tablet only */}
                <span
                  aria-hidden="true"
                  className="relative mt-0 hidden w-32 sm:-mt-2.5 sm:block lg:-mt-3 lg:w-44"
                >
                  {/* far half of the pedestal top, sits behind the product */}
                  <span className="absolute inset-x-0 -top-2 block h-2 rounded-t-[50%] bg-gradient-to-t from-cream to-white sm:-top-2.5 sm:h-2.5 lg:-top-3 lg:h-3" />
                  {/* pedestal body */}
                  <span className="block h-4 rounded-b-[999px] bg-gradient-to-b from-white via-cream to-line lg:h-5" />
                  {/* near half of the pedestal top, hides the product's base */}
                  <span className="absolute inset-x-0 top-0 z-20 block h-2 rounded-b-[50%] bg-gradient-to-b from-white to-cream sm:h-2.5 lg:h-3" />
                  {/* contact shadow on the ground */}
                  <span className="absolute inset-x-[12%] -bottom-1.5 block h-2 rounded-[50%] bg-ink/10 blur-[5px] lg:h-2.5" />
                </span>
              </span>

              <h3 className="mt-3 text-[12px] font-bold text-ink transition-colors duration-300 group-hover:text-teal-800 sm:text-sm lg:text-[15px]">
                {category.title}
              </h3>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
