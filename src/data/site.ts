import type { ServiceItem, ValueItem } from '@/types'

export const company = {
  name: 'Horizon Properties',
  tagline: 'Exceptional homes & investments',
  phone: '(555) 246-7890',
  phoneHref: 'tel:+15552467890',
  email: 'hello@horizonproperties.com',
  address: {
    line1: '14 Marina Crescent, Suite 900',
    line2: 'Austin, Texas 78701',
  },
  hours: 'Monday – Saturday, 9:00 – 18:00',
  socials: [
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'Facebook', href: 'https://facebook.com' },
  ],
}

export const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Properties', to: '/properties' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Team', to: '/team' },
  { label: 'Contact', to: '/contact' },
]

export const services: ServiceItem[] = [
  {
    title: 'Luxury Home Sales',
    description:
      'Discreet representation for architecturally significant homes, from private previews to closing.',
  },
  {
    title: 'Property Investment',
    description:
      'Yield-led acquisition strategy for buyers building a portfolio of prime residential assets.',
  },
  {
    title: 'Property Marketing',
    description:
      'Editorial photography, film and targeted campaigns that position a home in front of the right buyer.',
  },
  {
    title: 'Real Estate Advisory',
    description:
      'Market intelligence, valuation guidance and negotiation support for complex transactions.',
  },
  {
    title: 'Property Valuation',
    description:
      'Detailed appraisals grounded in comparable sales, build quality and long-term location value.',
  },
  {
    title: 'Relocation Services',
    description:
      'End-to-end support for international and interstate clients, from shortlisting to settling in.',
  },
]

export const values: ValueItem[] = [
  {
    title: 'Curated, never listed',
    description:
      'We represent a deliberately small portfolio so every home receives the attention its architecture deserves.',
  },
  {
    title: 'Private by default',
    description:
      'Off-market introductions, confidential negotiations and discretion maintained at every stage.',
  },
  {
    title: 'Investment intelligence',
    description:
      'Twenty years of transaction data and local insight behind every recommendation we make.',
  },
  {
    title: 'One team, end to end',
    description:
      'Advisory, marketing, legal coordination and relocation handled by a single accountable advisor.',
  },
]

export const stats = [
  { value: '$1.4B', label: 'Property sold' },
  { value: '620+', label: 'Homes placed' },
  { value: '20', label: 'Years advising' },
  { value: '96%', label: 'Repeat clients' },
]

export const heroImageId = 'photo-1600585154340-be6161a56a0c'
export const aboutImageIds = {
  main: 'photo-1600566753190-17f0baa2a6c3',
  secondary: 'photo-1600585154526-990dced4db0d',
}
export const servicesImageId = 'photo-1600573472550-8090b5e0745e'
