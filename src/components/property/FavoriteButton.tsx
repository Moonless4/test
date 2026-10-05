import clsx from 'clsx'
import { Heart } from 'lucide-react'
import { favoritesStore, useFavorites } from '@/lib/favorites'

interface FavoriteButtonProps {
  propertyId: string
  propertyName: string
  className?: string
  tone?: 'overlay' | 'plain'
}

export function FavoriteButton({
  propertyId,
  propertyName,
  className,
  tone = 'overlay',
}: FavoriteButtonProps) {
  const favorites = useFavorites()
  const saved = favorites.includes(propertyId)

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `حذف ${propertyName} از ذخیره‌شده‌ها` : `ذخیرهٔ ${propertyName}`}
      title={saved ? 'ذخیره شده' : 'ذخیرهٔ ملک'}
      onClick={() => favoritesStore.toggle(propertyId)}
      className={clsx(
        'grid h-10 w-10 place-items-center rounded-full transition-all duration-500 ease-premium',
        tone === 'overlay'
          ? 'bg-white/85 text-navy backdrop-blur-sm hover:bg-white'
          : 'border border-navy/15 text-navy hover:border-navy',
        saved && 'text-gold',
        className,
      )}
    >
      <Heart
        className={clsx('h-[17px] w-[17px] transition-transform duration-500 ease-premium', saved && 'scale-105')}
        strokeWidth={1.8}
        fill={saved ? 'currentColor' : 'none'}
      />
    </button>
  )
}
