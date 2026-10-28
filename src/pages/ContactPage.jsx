import ContactSection from '../components/ContactSection.jsx';
import FAQ from '../components/FAQ.jsx';

export default function ContactPage({ onToast }) {
  return (
    <>
      <ContactSection onToast={onToast} />
      <FAQ />
    </>
  );
}
