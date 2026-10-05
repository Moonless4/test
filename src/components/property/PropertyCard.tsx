import clsx from 'clsx'
import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FavoriteButton } from '@/components/property/FavoriteButton'
import type { Property } from '@/types'
import { formatPrice } from '@/lib/format'
import { photo, photoSrcSet } from '@/lib/images'

export type PropertyCardVariant = 'default' | 'wide'

interface PropertyCardProps {
  property: Property
  className?: string
  variant?: PropertyCardVariant
  sizes?: string
  eager?: boolean
}

export function PropertyCard({
  property,
  className,
  variant = 'default',
  sizes = '(min-width: 1280px) 30vw, (min-width: 1024px) 38vw, (min-width: 640px) 60vw, 86vw',
  eager = false,
}: PropertyCardProps) {
  const href = `/properties/${property.slug}`

  return (
    <article className={clsx('group', className)}>
      <div className="relative">
        <Link
          to={href}
          aria-label={`${property.name}، ${property.city}، ${property.region} — ${formatPrice(property.price)}`}
          className="block"
        >
          <div
            className={clsx(
              'relative overflow-hidden rounded-card bg-mist shadow-soft transition-shadow duration-700 ease-premium group-hover:shadow-lift',
              variant === 'wide' ? 'aspect-[16/11]' : 'aspect-[4/3]',
            )}
          >
            <img
              src={photo(property.imageId, 1280)}
              srcSet={photoSrcSet(property.imageId, [640, 960, 1280, 1600])}
              sizes={sizes}
              alt={`${property.name} در ${property.city}، ${property.region}`}
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              className="drag-none h-full w-full object-cover transition-transform duration-[1200ms] ease-premium group-hover:scale-[1.05]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-navy/35 via-transparent to-transparent opacity-0 transition-opacity duration-700 ease-premium group-hover:opacity-100"
            />
          </div>
        </Link>

        {/* Sits on the logical end corner, so it mirrors to the left in RTL. */}
        <FavoriteButton
          propertyId={property.id}
          propertyName={property.name}
          className="absolute end-3.5 top-3.5 opacity-95"
        />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[12px] font-semibold text-gold">{property.status}</span>
          <span className="text-[12px] text-muted/80">{property.type}</span>
        </div>

        <h3 className="mt-3 text-[17px] font-bold leading-snug text-ink">
          <Link to={href} className="transition-colors duration-300 hover:text-navy-700">
            {property.name}
          </Link>
        </h3>

        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.8} aria-hidden="true" />
          <span>
            {property.city}، {property.region}
          </span>
        </p>

        <p className="mt-3 text-[15px] font-bold text-navy">{formatPrice(property.price)}</p>
      </div>
    </article>
  )
}
