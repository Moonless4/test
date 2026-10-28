import { Suspense, useEffect } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AppRoutes from './routes.jsx';
import { applyLayoutVars } from './lib/applyLayoutVars.js';
import { initForms } from './lib/forms.js';
import { initSliders } from './lib/initSliders.js';
import { resetSmoothScroll } from './lib/smoothScroll.js';

function isInternalLink(anchor) {
  if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return false;
  const href = anchor.getAttribute('href');
  return Boolean(href) && href.startsWith('/') && !href.startsWith('//');
}

// Runs after the routed page is in the DOM (it is rendered inside the same
// Suspense boundary), and re-runs for each route change.
function RouteReady({ pathname }) {
  useEffect(() => {
    applyLayoutVars(document);
    initSliders(document);
    initForms(document);
  }, [pathname]);

  return null;
}

function Site() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.toggle('home', pathname === '/');
    document.body.classList.remove('header-hidden');
    resetSmoothScroll();
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
      document.querySelector('#mobile-menu-overlay')?.style.setProperty('display', 'none');
      document.body.classList.remove('disable-scrolling');
      navigate(anchor.getAttribute('href'));
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);

  // The admin panel is its own surface: it renders without the site header,
  // footer and content offsets.
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return (
      <div id="container">
        <Suspense fallback={<div className="rb-loading" aria-hidden="true" />}>
          <AppRoutes />
        </Suspense>
      </div>
    );
  }

  return (
    <div id="container">
      <Header />
      <div id="page-body">
        <Suspense fallback={<div className="rb-loading" aria-hidden="true" />}>
          <AppRoutes />
          <RouteReady pathname={pathname} />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Site />
    </BrowserRouter>
  );
}
