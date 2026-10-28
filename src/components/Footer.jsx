import { useEffect } from 'react';
import footerHtml from '../content/footer.html?raw';
import { applyFooterChrome } from '../lib/siteChrome.js';

// The site footer is the reference theme's own markup; its contact details,
// social links and licence marks are filled in from the saved content.
export default function Footer() {
  useEffect(() => {
    applyFooterChrome();
  }, []);

  return <div className="site-footer-slot" dangerouslySetInnerHTML={{ __html: footerHtml }} />;
}
