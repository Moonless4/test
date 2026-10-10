import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { MIN_QUERY } from '../../services/search';
import SearchSuggestions from './SearchSuggestions';

/** Header search field: shows live matches while typing and submits to /search. */
export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Leaving the page must always close the suggestion panel.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setQuery('');
    setOpen(false);
  };

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={boxRef} className="relative">
      <form
        onSubmit={submit}
        role="search"
        className="flex items-center gap-2 rounded-full bg-[#F5F5F7] px-4"
      >
        <Search className="h-4 w-4 shrink-0 text-muted" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          aria-label="جستجوی محصولات"
          placeholder="جستجوی محصول، برند یا دسته‌بندی..."
          className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
        {query ? (
          <button
            type="button"
            aria-label="پاک کردن جستجو"
            onClick={() => {
              setQuery('');
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-white hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </form>

      {open && query.trim().length >= MIN_QUERY ? (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 max-h-[520px] overflow-y-auto rounded-2xl border border-line bg-white shadow-lift">
          <SearchSuggestions query={query} onSelect={close} />
        </div>
      ) : null}
    </div>
  );
}
