import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { categories, megaMenu } from '../../lib/data';
import type { CategoryId } from '../../lib/types';
import Img from '../ui/Img';

type Props = {
  category: CategoryId;
  onNavigate: () => void;
};

/**
 * Header mega menu: category rail on the start side, the sub-links of the
 * hovered category on the end side.
 */
export default function MegaMenu({ category, onNavigate }: Props) {
  const [active, setActive] = useState<CategoryId>(category);

  useEffect(() => setActive(category), [category]);

  const links = megaMenu[active];
  const current = categories.find((item) => item.id === active);

  return (
    <div className="absolute inset-x-4 top-full z-40 pt-2 sm:inset-x-5 lg:inset-x-6">
      <div className="flex overflow-hidden rounded-panel border border-line bg-white shadow-lift motion-safe:animate-fade-in">
        <div className="flex w-[228px] shrink-0 flex-col gap-0.5 bg-[#F8F9FB] p-2.5">
          {categories.map((item) => {
            const isActive = item.id === active;
            return (
              <Link
                key={item.id}
                to={`/shop/${item.id}`}
                onMouseEnter={() => setActive(item.id)}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 rounded-xl p-2 transition-colors ${
                  isActive ? 'bg-white text-wine shadow-soft' : 'text-ink hover:bg-white/70'
                }`}
              >
                <Img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="h-9 w-9 shrink-0 rounded-lg object-cover"
                />
                <span className="flex-1 text-[13px] font-medium">{item.title}</span>
                <ChevronLeft className="h-4 w-4 shrink-0 opacity-60" />
              </Link>
            );
          })}
        </div>

        <div className="min-w-0 flex-1 p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-bold text-ink">{current?.title}</h3>
            <Link
              to={`/shop/${active}`}
              onClick={onNavigate}
              className="flex items-center gap-1 text-[13px] font-medium text-wine transition-colors hover:text-wine-dark"
            >
              مشاهده همه
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-x-6 gap-y-2.5">
            {links.map((link) => (
              <Link
                key={link.label}
                to={`/search?q=${encodeURIComponent(link.q)}`}
                onClick={onNavigate}
                className="text-[13px] text-ink transition-colors hover:text-wine"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
