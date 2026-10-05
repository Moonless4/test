import { AboutSection } from '@/components/home/AboutSection'
import { CtaBanner } from '@/components/home/CtaBanner'
import { FeaturedProperties } from '@/components/home/FeaturedProperties'
import { Hero } from '@/components/home/Hero'
import { ServicesSection } from '@/components/home/ServicesSection'
import { TeamSection } from '@/components/home/TeamSection'
import { WhyChooseSection } from '@/components/home/WhyChooseSection'

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <FeaturedProperties />
      <ServicesSection />
      <WhyChooseSection />
      <TeamSection />
      <CtaBanner />
    </>
  )
}
