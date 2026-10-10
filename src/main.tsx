import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { initAdminBase } from './admin/lib/basePath';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

/**
 * The admin panel's address is a shop setting, so it is read before the first render: a router that
 * did not know the panel's prefix yet would answer the panel's own URL with the shop's 404.
 * `initAdminBase()` never rejects — a shop whose API cannot be reached is drawn at the default
 * address — so this can only ever delay the first paint by one very small request.
 */
initAdminBase().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <StoreProvider>
            <App />
          </StoreProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  );
});
