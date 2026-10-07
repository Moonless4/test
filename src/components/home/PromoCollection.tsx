import { promoArt } from '../../lib/data';
import Reveal from '../ui/Reveal';
import BannerTile from './BannerTile';

export default function PromoCollection() {
  return (
    <section className="container mt-12 sm:mt-16" aria-label="پیشنهاد ویژه">
      <Reveal>
        <BannerTile to="/shop?discount=true" image={promoArt.collection} label="پیشنهادهای ویژه" />
      </Reveal>
    </section>
  );
}
