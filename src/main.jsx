import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { initSmoothScroll } from './lib/smoothScroll.js';
import './styles/site.css';
import './styles/service-pages.css';

initSmoothScroll();

createRoot(document.getElementById('root')).render(<App />);
