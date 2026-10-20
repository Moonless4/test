import { useEffect } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import headerHtml from './content/header.html?raw';
import footerHtml from './content/footer.html?raw';
import { getContent } from './pages/pages.js';
import { applyLayoutVars } from './lib/applyLayoutVars.js';
import { initInteractions } from './lib/initInteractions.js';
import { initSliders } from './lib/initSliders.js';

function isInternalLink(anchor) {
  if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return false;
  const href = anchor.getAttribute('href');
  return Boolean(href) && href.startsWith('/') && !href.startsWith('//');
}

function Site() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  // Every rule of elementor-post-837.css is scoped under `.elementor-837`, the
  // wrapper Elementor prints around the page content.
  const html =
    headerHtml +
    '<div class="elementor elementor-837" data-elementor-id="837" data-elementor-type="wp-page">' +
    getContent(pathname, search) +
    '</div>' +
    footerHtml;

  useEffect(() => {
    const root = document.getElementById('root');
    document.body.classList.toggle('home', pathname === '/');
    applyLayoutVars(root);
    initInteractions(root);
    initSliders(root);
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
        return;
      }
      const anchor = event.target.closest?.('a[href]');
      if (!isInternalLink(anchor)) return;
      event.preventDefault();
      document.querySelector('#mobile-menu-container')?.classList.remove('open');
      navigate(anchor.getAttribute('href'));
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Site />
    </BrowserRouter>
  );
}
