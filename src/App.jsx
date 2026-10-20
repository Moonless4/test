import { useEffect } from 'react';
import headerHtml from './content/header.html?raw';
import footerHtml from './content/footer.html?raw';
import { homeSections } from './content/home.js';
import { applyLayoutVars } from './lib/applyLayoutVars.js';

// Every rule of elementor-post-837.css is scoped under `.elementor-837`, which
// is the wrapper Elementor prints around the page content. Without it the
// sections render as unstyled markup.
const pageHtml =
  headerHtml +
  '<div class="elementor elementor-837" data-elementor-id="837" data-elementor-type="wp-page">' +
  homeSections.map((section) => section.html).join('') +
  '</div>' +
  footerHtml;

export default function App() {
  useEffect(() => {
    applyLayoutVars();
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: pageHtml }} />;
}
