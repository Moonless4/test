import { Link } from 'react-router-dom';

type Props = {
  to: string;
  /** AVIF source: the same artwork at ~40% of the WebP's weight. */
  avif: string;
  /** WebP fallback, for a browser without AVIF. */
  webp: string;
  /** Accessible name for the whole tile — the artwork's own copy is a picture, not text. */
  label: string;
};

/**
 * One full-width campaign banner.
 *
 * The artwork is finished — its headline and CTA pill are drawn into the picture — so the tile takes
 * the picture's own 1920×364 shape instead of a fixed height (which cropped the copy), and it
 * carries no colour wash and no hover zoom over that copy.
 */
export default function CampaignBanner({ to, avif, webp, label }: Props) {
  return (
    <Link to={to} aria-label={label} className="block overflow-hidden rounded-lg bg-[#2C483A]">
      <picture>
        <source type="image/avif" srcSet={avif} />
        <img
          src={webp}
          alt=""
          width={1920}
          height={364}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </picture>
    </Link>
  );
}
