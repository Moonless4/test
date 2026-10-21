import footerHtml from '../content/footer.html?raw';

// The site footer is the reference theme's own markup.
export default function Footer() {
  return <div className="site-footer-slot" dangerouslySetInnerHTML={{ __html: footerHtml }} />;
}
