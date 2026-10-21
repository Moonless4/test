import HeroSection from '../components/home/HeroSection.jsx';
import ServicesSection from '../components/home/ServicesSection.jsx';
import HomeProjects from '../components/home/HomeProjects.jsx';
import TimelineSection from '../components/home/TimelineSection.jsx';
import PromoSection from '../components/home/PromoSection.jsx';
import CustomersSection from '../components/home/CustomersSection.jsx';
import HomeTeam from '../components/home/HomeTeam.jsx';
import HomeBlog from '../components/home/HomeBlog.jsx';
import HomeFaq from '../components/home/HomeFaq.jsx';
import '../styles/home.css';

// The homepage is assembled from React components, one per band of the
// reference page, in the same order.
export default function HomePage() {
  return (
    <div className="hp-home ed-page">
      <HeroSection />
      <ServicesSection />
      <HomeProjects />
      <TimelineSection />
      <PromoSection />
      <CustomersSection />
      <HomeTeam />
      <HomeBlog />
      <HomeFaq />
    </div>
  );
}
