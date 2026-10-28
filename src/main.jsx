import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { loadSiteContent } from './lib/siteContent.js';
import { initSmoothScroll } from './lib/smoothScroll.js';
import './styles/site.css';
import './styles/service-pages.css';
import './styles/blog.css';
import './styles/scroll.css';

// The saved content is applied before the first render, so every page and the
// captured header/footer mount with the owner's text already in place. A failed
// request leaves the static content untouched.
loadSiteContent().finally(() => {
  initSmoothScroll();
  createRoot(document.getElementById('root')).render(<App />);
});
