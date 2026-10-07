import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Search, X } from 'lucide-react';
import { categories, megaMenu } from '../../lib/data';
import type { CategoryId } from '../../lib/types';
import { MIN_QUERY } from '../../lib/search';
import { NAV_LINKS } from '../../lib/nav';
import Img from '../ui/Img';
import SearchSuggestions from '../search/SearchSuggestions';

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * Phone category browser: the search field on top, the category rail on the start side
 * and the sub-sections of the selected category in the panel beside it. Sub-section rows
 * expand to the same catalog searches the header mega menu links to.
 */
export default function CategoryDrawer({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<CategoryId>(categories[0].id);
  const [expanded, setExpanded] = useState<string | null>(null);
  const navigate = useNavigate();

  // Every link in the drawer closes it, so the panel only has to reset on close.
  useEffect(() => {
    if (open) return;
    setQuery('');
    setExpanded(null);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!open) return null;

  const activeCategory = categories.find((category) => category.id === activeId) ?? categories[0];
  const sections = megaMenu[activeCategory.id];
  const quickLinks = NAV_LINKS.filter((link) => !link.category);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
    onClose();
  };

  /** Opening a live suggestion navigates, so the drawer closes with the query cleared. */
  const closeSearch = () => {
    setQuery('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button
        type="button"
        aria-label="بستن دسته‌بندی"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-teal-950/50 backdrop-blur-sm motion-safe:animate-fade-in"
      />

      {/* Full width on phones and tablets, like the phone sheet. */}
      <div className="absolute inset-y-0 start-0 flex w-full flex-col bg-white shadow-2xl motion-safe:animate-drawer-right">
        <form onSubmit={submit} role="search" className="flex items-center gap-2 p-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream text-ink ring-1 ring-line transition-colors hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-2xl bg-cream px-3.5 ring-1 ring-line focus-within:ring-teal-300">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="جستجوی محصولات"
              placeholder="جستجو در استایل‌آن"
              className="h-full w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-muted"
            />
            <Search className="h-4 w-4 shrink-0 text-ink/60" />
          </div>
        </form>

        {query.trim().length >= MIN_QUERY ? (
          <div className="max-h-[46vh] shrink-0 overflow-y-auto border-b border-line">
            <SearchSuggestions query={query} onSelect={closeSearch} />
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1">
          <div className="no-scrollbar flex w-[104px] shrink-0 flex-col gap-1.5 overflow-y-auto border-e border-line bg-cream/60 p-2">
            {categories.map((category) => {
              const isActive = category.id === activeCategory.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => {
                    setActiveId(category.id);
                    setExpanded(null);
                  }}
                  className={`relative flex w-full flex-col items-center gap-1.5 rounded-2xl border px-1.5 py-3 transition-colors ${
                    isActive
                      ? 'border-teal-800/25 bg-white text-teal-800 shadow-soft'
                      : 'border-transparent text-ink hover:bg-white/70'
                  }`}
                >
                  <Img
                    src={category.image}
                    alt=""
                    loading="lazy"
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <span className="text-[11px] font-medium">{category.title}</span>
                  {isActive ? (
                    <span className="absolute end-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-full bg-teal-800" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="min-w-0 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5">
              <h2 className="text-[15px] font-bold text-ink">{activeCategory.title}</h2>
              <Link
                to={`/shop/${activeCategory.id}`}
                onClick={onClose}
                className="text-[12.5px] font-medium text-teal-800 transition-colors hover:text-teal-700"
              >
                مشاهده همه
              </Link>
            </div>

            <ul>
              {sections.map((section) => {
                const isOpen = expanded === section.id;
                return (
                  <li key={section.id} className="border-b border-line last:border-0">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setExpanded(isOpen ? null : section.id)}
                      className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-cream"
                    >
                      <Img
                        src={section.image}
                        alt=""
                        loading="lazy"
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                      <span className="flex-1 text-start text-[13.5px] font-medium text-ink">
                        {section.title}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 text-teal-800' : 'text-ink/45'
                        }`}
                      />
                    </button>

                    {isOpen ? (
                      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 px-4 pb-4">
                        {section.links.map((link) => (
                          <li key={link.label}>
                            <Link
                              to={`/search?q=${encodeURIComponent(link.q)}`}
                              onClick={onClose}
                              className="block py-1 text-[12.5px] text-muted transition-colors hover:text-teal-800"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                        <li className="col-span-2">
                          <Link
                            to={`/search?q=${encodeURIComponent(section.q)}`}
                            onClick={onClose}
                            className="mt-1 inline-block text-[12.5px] font-medium text-teal-800"
                          >
                            همه {section.title}
                          </Link>
                        </li>
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-wrap gap-2 px-4 pb-6 pt-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-teal-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
