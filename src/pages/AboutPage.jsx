import PageHero from '../components/PageHero.jsx';
import AboutSection from '../components/AboutSection.jsx';
import Stats from '../components/Stats.jsx';
import Testimonials from '../components/Testimonials.jsx';
import OrderSection from '../components/OrderSection.jsx';

export default function AboutPage({ onMenu, onReserve }) {
  return (
    <>
      <PageHero
        eyebrow="درباره نوال"
        title="داستان"
        highlight="رستوران نوال"
        script="About us"
        text="از سال ۱۳۹۲ با عشق به طعم و مهمان‌نوازی؛ آشپزخانه‌ای که مواد اولیه تازه را پایه هر غذا می‌داند."
        crumbs={[{ label: 'درباره ما' }]}
      />
      <AboutSection onMenu={onMenu} onReserve={onReserve} />
      <Stats />
      <OrderSection onMenu={onMenu} />
      <Testimonials />
    </>
  );
}
