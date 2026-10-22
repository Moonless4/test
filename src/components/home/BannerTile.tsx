import { Link } from 'react-router-dom';
import { unsplashSrcSet } from '../../lib/images';
import Img from '../ui/Img';

type Props = {
  to: string;
  image: string;
  label: string;
  /**
   * The layout width this tile is drawn at, for the browser's `srcset` choice: `50vw` for a tile
   * that shares a row, `100vw` for a full-bleed one.
   */
  sizes?: string;
};

/** Photo-only promo tile: olive canvas, soft corners, no copy. */
export default function BannerTile({ to, image, label, sizes = '100vw' }: Props) {
  // These tiles are the widest artwork on the page and were downloading a 1600px source at every
  // viewport; the browser now picks the crop that matches the screen it is drawn on.
  const srcSet = unsplashSrcSet(image, 600);

  return (
    <Link
      to={to}
      aria-label={label}
      className="group relative block h-[150px] overflow-hidden rounded-lg bg-[#3F4635] sm:h-[170px] lg:h-[190px]"
    >
      <Img
        src={image}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
      />
      {/* Muted olive wash that keeps every tile in one tone. */}
      <div className="absolute inset-0 bg-[#3F4635]/30" />
    </Link>
  );
}
