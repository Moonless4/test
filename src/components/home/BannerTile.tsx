import { Link } from 'react-router-dom';
import Img from '../ui/Img';

type Props = {
  to: string;
  image: string;
  label: string;
};

/** Photo-only promo tile: olive canvas, soft corners, no copy. */
export default function BannerTile({ to, image, label }: Props) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="group relative block h-[150px] overflow-hidden rounded-lg bg-[#3F4635] sm:h-[170px] lg:h-[190px]"
    >
      <Img
        src={image}
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
