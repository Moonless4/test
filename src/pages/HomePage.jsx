import HeroSection from '../components/home/HeroSection.jsx';
import ServicesSection from '../components/home/ServicesSection.jsx';
import HomeProjects from '../components/home/HomeProjects.jsx';
import TimelineSection from '../components/home/TimelineSection.jsx';
import PromoSection from '../components/home/PromoSection.jsx';
import CustomersSection from '../components/home/CustomersSection.jsx';
import HomeTeam from '../components/home/HomeTeam.jsx';
import HomeBlog from '../components/home/HomeBlog.jsx';
import HomeFaq from '../components/home/HomeFaq.jsx';
import PageMeta from '../components/PageMeta.jsx';
import { site } from '../content/site.js';
import '../styles/home.css';

// One component per band of the reference page. The panel controls the order
// and visibility of these bands through `settings.homeSections`.
const BANDS = {
  hero: HeroSection,
  services: ServicesSection,
  projects: HomeProjects,
  timeline: TimelineSection,
  promo: PromoSection,
  clients: CustomersSection,
  team: HomeTeam,
  blog: HomeBlog,
  faq: HomeFaq,
};

const DEFAULT_ORDER = Object.keys(BANDS);

export default function HomePage() {
  const saved = Array.isArray(site.homeSections) ? site.homeSections : [];
  const order = saved.length ? saved : DEFAULT_ORDER.map((id) => ({ id, enabled: true }));

  return (
    <div className="hp-home">
      <PageMeta title={site.seo?.title} description={site.seo?.description} path="/" />
      {order
        .filter((band) => band && band.enabled !== false && BANDS[band.id])
        .map((band) => {
          const Band = BANDS[band.id];
          return <Band key={band.id} />;
        })}
    </div>
  );
}
