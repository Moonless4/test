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
import {
  adminLogin,
  adminLogout,
  adminMe,
  adminTwoFactorChallenge,
  adminTwoFactorConfirm,
  adminTwoFactorEnroll,
  type AdminTwoFactorEnrollment,
} from '../services/admin';
import type { ApiAdminUser } from '../lib/api/types';

/**
 * The admin panel's own session.
 *
 * It is deliberately separate from the storefront's `AuthContext`: that one is the browser's demo
 * account, while this one is a **Sanctum token** the Laravel API issued. The token is kept in the
 * same `styleon.api.token` slot every other API call already reads, so the panel and the storefront
 * share one identity instead of two.
 *
 * A password is not always the end of a sign-in: the shop requires a second factor of its staff, so
 * `signIn` may answer "answer the challenge" or "enroll first" instead of a session. Either way the
 * token the login handed out lives in `pending` — in memory, never in the storage slot the session
 * uses — and only a finished flow writes the real token there. A page reload in the middle of a
 * login therefore loses the half-finished attempt, which is exactly right.
 *
 * `can()` is what the panel draws with. It is not a security boundary — every admin route checks
 * its named permission again on the server.
 */

/** A sign-in that is waiting on its second step. */
export type AdminPendingAuth =
  | { kind: 'challenge'; token: string }
  | { kind: 'setup'; token: string; user: ApiAdminUser };

type AdminAuthValue = {
  user: ApiAdminUser | undefined;
  /** True while the stored token is being checked, so a guarded route can wait instead of bouncing. */
  loading: boolean;
  error: ApiError | undefined;
  /** A sign-in that has not finished its second factor (or its enrollment) yet. */
  pending: AdminPendingAuth | undefined;
  signIn: (email: string, password: string) => Promise<void>;
  /** Answer the challenge: the code from the app, or one of the recovery codes. */
  submitChallenge: (code: string, recoveryCode?: string) => Promise<void>;
  /** Enrollment while the login waits on it — runs on the login's own setup token. */
  enrollPending: () => Promise<AdminTwoFactorEnrollment>;
  /** Confirm that enrollment; answers the recovery codes shown once, and enters the panel. */
  confirmPending: (code: string) => Promise<string[]>;
  /** Abandon the second step and go back to the password form. */
  cancelPending: () => void;
  signOut: () => Promise<void>;
  can: (permission: string) => boolean;
  reload: () => void;
};

const AdminAuthContext = createContext<AdminAuthValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiAdminUser | undefined>(undefined);
  const [loading, setLoading] = useState(authToken() !== null);
  const [error, setError] = useState<ApiError | undefined>(undefined);
  const [pending, setPending] = useState<AdminPendingAuth | undefined>(undefined);
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
    const result = await adminLogin(email, password);

    setError(undefined);
    setUser(undefined);

    // A second factor is asked for before any session exists: nothing is stored yet.
    if ('two_factor_required' in result) {
      setPending({ kind: 'challenge', token: result.challenge_token });
      return;
    }

    if ('two_factor_setup_required' in result) {
      setPending({ kind: 'setup', token: result.token, user: result.user });
      return;
    }

    setPending(undefined);
    setAuthToken(result.token);
    setUser(result.user);
  }, []);

  const submitChallenge = useCallback(
    async (code: string, recoveryCode?: string) => {
      if (pending?.kind !== 'challenge') throw new ApiError('پاسخ نامعتبر از سرور فروشگاه.', 0);

      const session = await adminTwoFactorChallenge(pending.token, code, recoveryCode);

      setPending(undefined);
      setAuthToken(session.token);
      setUser(session.user);
    },
    [pending],
  );

  const enrollPending = useCallback(async () => {
    if (pending?.kind !== 'setup') throw new ApiError('پاسخ نامعتبر از سرور فروشگاه.', 0);

    return adminTwoFactorEnroll(pending.token);
  }, [pending]);

  const confirmPending = useCallback(
    async (code: string) => {
      if (pending?.kind !== 'setup') throw new ApiError('پاسخ نامعتبر از سرور فروشگاه.', 0);

      const confirmation = await adminTwoFactorConfirm(code, pending.token);

      setPending(undefined);
      setAuthToken(confirmation.token);
      setUser(confirmation.user);

      return confirmation.recovery_codes;
    },
    [pending],
  );

  const cancelPending = useCallback(() => {
    setPending(undefined);
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
      setPending(undefined);
    }
  }, []);

  const value = useMemo<AdminAuthValue>(
    () => ({
      user,
      loading,
      error,
      pending,
      signIn,
      submitChallenge,
      enrollPending,
      confirmPending,
      cancelPending,
      signOut,
      can: (permission: string) => user?.permissions?.includes(permission) === true,
      reload: () => setAttempt((current) => current + 1),
    }),
    [
      user,
      loading,
      error,
      pending,
      signIn,
      submitChallenge,
      enrollPending,
      confirmPending,
      cancelPending,
      signOut,
    ],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthValue {
  const context = useContext(AdminAuthContext);

  if (!context) throw new Error('useAdminAuth must be used inside AdminAuthProvider');

  return context;
}
