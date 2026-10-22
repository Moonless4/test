import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import SmoothScroll from './components/layout/SmoothScroll';
import { adminBase, initAdminBase } from './admin/lib/basePath';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

/**
 * The admin panel's address is a shop setting, read from its own endpoint — and it is never allowed
 * to hold up the shop. The storefront is drawn immediately (the hero, the page's LCP image, must not
 * wait on a request), and the address is applied the moment it is known: `App` reads it while
 * rendering, so the one re-render below is enough.
 *
 * The panel is drawn at the default address while the lookup is in flight, which is the address it
 * answers on anyway unless the shop moved it in its settings — and only that case re-renders, so
 * the storefront's own first paint is never rendered twice. `initAdminBase()` never rejects, so
 * this cannot leave the app unrendered.
 */
const root = createRoot(document.getElementById('root')!);

const render = () =>
  root.render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <StoreProvider>
            {/* Page-wide inertial scrolling — mounted once, outside the router's own tree. */}
            <SmoothScroll />
            <App />
          </StoreProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  );

render();

const initialAdminBase = adminBase();

initAdminBase().then(() => {
  if (adminBase() !== initialAdminBase) render();
});
