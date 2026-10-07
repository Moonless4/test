import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { megaMenu } from '../../lib/data';
import type { CategoryId } from '../../lib/types';
import Img from '../ui/Img';

type Props = {
  category: CategoryId;
  onNavigate: () => void;
};

/**
 * Header mega menu: the sub-sections of the category on the start side, the links
 * of the selected sub-section in the panel on the end side.
 */
export default function MegaMenu({ category, onNavigate }: Props) {
  const sections = megaMenu[category];
  const [activeId, setActiveId] = useState(sections[0].id);

  useEffect(() => setActiveId(megaMenu[category][0].id), [category]);

  const active = sections.find((section) => section.id === activeId) ?? sections[0];

  return (
    <div className="absolute inset-x-4 top-full z-40 pt-2 sm:inset-x-5 lg:inset-x-6">
      <div className="flex overflow-hidden rounded-panel border border-line bg-white shadow-lift motion-safe:animate-fade-in">
        <div className="flex w-[236px] shrink-0 flex-col gap-0.5 bg-[#F7F8FA] p-2.5">
          {sections.map((section) => {
            const isActive = section.id === active.id;
            return (
              <Link
                key={section.id}
                to={`/search?q=${encodeURIComponent(section.q)}`}
                onMouseEnter={() => setActiveId(section.id)}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-xl border px-2.5 py-2 transition-colors ${
                  isActive
                    ? 'border-line bg-white text-teal-800 shadow-soft'
                    : 'border-transparent text-ink hover:bg-white/70'
                }`}
              >
                <Img
                  src={section.image}
                  alt=""
                  loading="lazy"
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
                <span className="flex-1 text-[13px] font-medium">{section.title}</span>
                <ChevronLeft
                  className={`h-4 w-4 shrink-0 ${isActive ? 'text-teal-800' : 'opacity-45'}`}
                />
              </Link>
            );
          })}
        </div>

        <div className="min-w-0 flex-1 px-6 py-5">
          <div className="flex items-center justify-between gap-4 border-b border-line pb-3.5">
            <h3 className="text-base font-bold text-ink">{active.title}</h3>
            <Link
              to={`/search?q=${encodeURIComponent(active.q)}`}
              onClick={onNavigate}
              className="flex items-center gap-1 text-[13px] font-medium text-teal-800 transition-colors hover:text-teal-700"
            >
              مشاهده همه
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>

          <ul className="mt-4 columns-2 gap-x-8 xl:columns-4">
            {active.links.map((link) => (
              <li key={link.label} className="mb-2.5 break-inside-avoid">
                <Link
                  to={`/search?q=${encodeURIComponent(link.q)}`}
                  onClick={onNavigate}
                  className="text-[13px] text-muted transition-colors hover:text-teal-800"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
