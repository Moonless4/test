import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, authToken, setAuthToken } from '../lib/api/client';
import { adminLogin, adminLogout, adminMe } from '../services/admin';
import type { ApiAdminUser } from '../lib/api/types';

/**
 * The admin panel's own session.
 *
 * It is deliberately separate from the storefront's `AuthContext`: that one is the browser's demo
 * account, while this one is a **Sanctum token** the Laravel API issued. The token is kept in the
 * same `styleon.api.token` slot every other API call already reads, so the panel and the storefront
 * share one identity instead of two.
 *
 * `can()` is what the panel draws with. It is not a security boundary — every admin route checks
 * its named permission again on the server.
 */

type AdminAuthValue = {
  user: ApiAdminUser | undefined;
  /** True while the stored token is being checked, so a guarded route can wait instead of bouncing. */
  loading: boolean;
  error: ApiError | undefined;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  can: (permission: string) => boolean;
  reload: () => void;
};

const AdminAuthContext = createContext<AdminAuthValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiAdminUser | undefined>(undefined);
  const [loading, setLoading] = useState(authToken() !== null);
  const [error, setError] = useState<ApiError | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (authToken() === null) {
      setUser(undefined);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    adminMe()
      .then((account) => {
        if (active) {
          setUser(account);
          setError(undefined);
        }
      })
      .catch((failure: unknown) => {
        if (!active) return;

        // A refused token is a token to forget; anything else (the API is down, a 403 for a
        // shopper without staff permissions) leaves it in place so the panel can say why.
        if (failure instanceof ApiError && failure.status === 401) setAuthToken(null);

        setUser(undefined);
        setError(
          failure instanceof ApiError
            ? failure
            : new ApiError('ارتباط با سرور فروشگاه برقرار نشد.', 0),
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await adminLogin(email, password);

    setAuthToken(session.token);
    setUser(session.user);
    setError(undefined);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await adminLogout();
    } catch {
      /* the token is dropped locally either way — that is what actually ends the session */
    } finally {
      setAuthToken(null);
      setUser(undefined);
      setError(undefined);
    }
  }, []);

  const value = useMemo<AdminAuthValue>(
    () => ({
      user,
      loading,
      error,
      signIn,
      signOut,
      can: (permission: string) => user?.permissions?.includes(permission) === true,
      reload: () => setAttempt((current) => current + 1),
    }),
    [user, loading, error, signIn, signOut],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthValue {
  const context = useContext(AdminAuthContext);

  if (!context) throw new Error('useAdminAuth must be used inside AdminAuthProvider');

  return context;
}
