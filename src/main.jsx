import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/header.css';
import './styles/hero.css';
import './styles/sections.css';
import './styles/products.css';
import './styles/content.css';
import './styles/overlays.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
