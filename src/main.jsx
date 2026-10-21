import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { RouterProvider } from './router.jsx';
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
import './styles/overlays.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider>
      <App />
    </RouterProvider>
  </React.StrictMode>
);
