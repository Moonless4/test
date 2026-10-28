import AboutSection from '../components/AboutSection.jsx';
import Stats from '../components/Stats.jsx';
import Testimonials from '../components/Testimonials.jsx';
import OrderSection from '../components/OrderSection.jsx';

export default function AboutPage({ onMenu, onReserve }) {
  return (
    <>
      <AboutSection onMenu={onMenu} onReserve={onReserve} />
      <Stats />
      <OrderSection onMenu={onMenu} />
      <Testimonials />
    </>
  );
}
