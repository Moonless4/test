import PageHero from '../components/PageHero.jsx';
import ContactSection from '../components/ContactSection.jsx';
import FAQ from '../components/FAQ.jsx';

export default function ContactPage({ onToast }) {
  return (
    <>
      <PageHero
        eyebrow="ارتباط با ما"
        title="تماس با"
        highlight="رستوران نوال"
        script="Say hello"
        text="برای رزرو، پیگیری سفارش یا هر سؤالی درباره منو، تیم پشتیبانی نوال در کنار شماست."
        crumbs={[{ label: 'تماس با ما' }]}
      />
      <ContactSection onToast={onToast} />
      <FAQ />
    </>
  );
}
