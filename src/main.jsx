import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { RouterProvider } from './router.jsx';
import { SiteProvider } from './site/SiteContent.jsx';
import { initSmoothScroll } from './lib/smoothScroll.js';
import 'lenis/dist/lenis.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/header.css';
import './styles/hero.css';
import './styles/sections.css';
import './styles/delivery-banner.css';
import './styles/products.css';
import './styles/newest-menu.css';
import './styles/content.css';
import './styles/pages.css';
import './styles/cart.css';
import './styles/overlays.css';
import './styles/account.css';
import './styles/admin.css';

initSmoothScroll();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider>
      <SiteProvider>
        <App />
      </SiteProvider>
    </RouterProvider>
  </React.StrictMode>
);
