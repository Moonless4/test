import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createAccount, createId, DEFAULT_SETTINGS, REWARDS } from '../data/account.js';
import { DEFAULT_AVATAR } from './Avatar.jsx';

const ACCOUNTS_KEY = 'naval-accounts-v1';
const SESSION_KEY = 'naval-account-session-v1';
const GUEST_KEY = 'guest';
/* The old sample customer is gone; drop any trace of it left in storage */
const LEGACY_SAMPLE_KEY = '09121234567';

const AccountContext = createContext(null);

const clone = (value) => JSON.parse(JSON.stringify(value));

/* Persian/Arabic digits → Latin, so one phone always maps to one account */
const normalizeDigits = (value = '') =>
  value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));

/* Stock photos used before the graphic avatar set landed */
const LEGACY_AVATAR = /^\/assets\/avatar\d+\.png$/;

const normalizeAvatar = (avatar) =>
  LEGACY_AVATAR.test(avatar || '') ? DEFAULT_AVATAR : avatar;

const normalize = (account) => ({
  user: { ...account.user, avatar: normalizeAvatar(account.user.avatar) },
  addresses: account.addresses || [],
  orders: account.orders || [],
  reservations: account.reservations || [],
  favorites: account.favorites || [],
  notifications: account.notifications || [],
  loyalty: {
    points: 0,
    nextRewardAt: 500,
    tier: 'نقره‌ای',
    rewards: REWARDS,
    history: [],
    ...account.loyalty,
  },
  settings: { ...clone(DEFAULT_SETTINGS), ...account.settings },
});

const readAccounts = () => {
  const fallback = { [GUEST_KEY]: createAccount() };
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fallback;
    const accounts = {};
    let dropped = false;
    Object.entries(parsed).forEach(([key, value]) => {
      if (key === LEGACY_SAMPLE_KEY) {
        dropped = true;
        return;
      }
      if (value && typeof value === 'object' && value.user) accounts[key] = normalize(value);
    });
    if (dropped) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      if (localStorage.getItem(SESSION_KEY) === LEGACY_SAMPLE_KEY) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    return { ...fallback, ...accounts };
  } catch {
    return fallback;
  }
};

const readSession = () => {
  try {
    return localStorage.getItem(SESSION_KEY) || null;
  } catch {
    return null;
  }
};

const writeSession = (key) => {
  try {
    if (key) localStorage.setItem(SESSION_KEY, key);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage can be unavailable in private mode */
  }
};

export function AccountProvider({ children }) {
  const [accounts, setAccounts] = useState(readAccounts);
  const [session, setSession] = useState(readSession);
  const signedIn = Boolean(session && accounts[session]);
  const activeKey = signedIn ? session : GUEST_KEY;
  const [state, setState] = useState(() => accounts[activeKey]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(timer);
  }, []);

  /* Every mutation is written back under the signed-in phone (or the guest profile) */
  useEffect(() => {
    setAccounts((prev) => {
      if (prev[activeKey] === state) return prev;
      const next = { ...prev, [activeKey]: state };
      try {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
      } catch {
        /* storage can be unavailable in private mode */
      }
      return next;
    });
  }, [state, activeKey]);

  const activate = useCallback((key, account) => {
    writeSession(key);
    setSession(key);
    setState(account);
  }, []);

  const saveAccount = useCallback((key, account) => {
    setAccounts((prev) => {
      const next = { ...prev, [key]: account };
      try {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
      } catch {
        /* storage can be unavailable in private mode */
      }
      return next;
    });
  }, []);

  /* Login never falls back to a prepared profile: an unknown number starts an empty account */
  const login = useCallback(
    ({ identifier }) => {
      const key = normalizeDigits(identifier).trim().toLowerCase();
      const existing = accounts[key];
      const account = existing ? normalize(existing) : createAccount({ phone: key });

      if (!existing) saveAccount(key, account);
      activate(key, account);
      return { created: !existing };
    },
    [accounts, activate, saveAccount]
  );

  const register = useCallback(
    ({ name, identifier }) => {
      const key = normalizeDigits(identifier).trim().toLowerCase();
      if (accounts[key]) {
        return { ok: false, error: 'این شماره قبلاً ثبت‌نام کرده است؛ از تب «ورود» وارد شوید.' };
      }
      const parts = name.trim().split(/\s+/);
      const firstName = parts.shift() || '';
      const account = createAccount({ firstName, lastName: parts.join(' '), phone: key });

      saveAccount(key, account);
      activate(key, account);
      return { ok: true };
    },
    [accounts, activate, saveAccount]
  );

  const signOut = useCallback(() => {
    activate(null, accounts[GUEST_KEY] || createAccount());
  }, [accounts, activate]);

  const isFavorite = useCallback(
    (productId) => state.favorites.includes(productId),
    [state.favorites]
  );

  const toggleFavorite = useCallback((productId) => {
    let added = false;
    setState((prev) => {
      const exists = prev.favorites.includes(productId);
      added = !exists;
      return {
        ...prev,
        favorites: exists
          ? prev.favorites.filter((id) => id !== productId)
          : [productId, ...prev.favorites],
      };
    });
    return added;
  }, []);

  const saveProfile = useCallback((patch) => {
    setState((prev) => ({ ...prev, user: { ...prev.user, ...patch } }));
  }, []);

  const saveAddress = useCallback((address) => {
    setState((prev) => {
      const id = address.id || createId('addr');
      const saved = { ...address, id };
      const exists = prev.addresses.some((item) => item.id === id);

      let addresses = exists
        ? prev.addresses.map((item) => (item.id === id ? saved : item))
        : [saved, ...prev.addresses];

      if (saved.isDefault) {
        addresses = addresses.map((item) => ({ ...item, isDefault: item.id === id }));
      } else if (!addresses.some((item) => item.isDefault)) {
        addresses = addresses.map((item, index) => ({ ...item, isDefault: index === 0 }));
      }

      return { ...prev, addresses };
    });
  }, []);

  const deleteAddress = useCallback((id) => {
    setState((prev) => {
      const addresses = prev.addresses.filter((item) => item.id !== id);
      if (addresses.length && !addresses.some((item) => item.isDefault)) {
        addresses[0] = { ...addresses[0], isDefault: true };
      }
      return { ...prev, addresses };
    });
  }, []);

  const setDefaultAddress = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      addresses: prev.addresses.map((item) => ({ ...item, isDefault: item.id === id })),
    }));
  }, []);

  const cancelReservation = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      reservations: prev.reservations.map((item) =>
        item.id === id ? { ...item, status: 'cancelled' } : item
      ),
    }));
  }, []);

  const rescheduleReservation = useCallback((id, date, time) => {
    setState((prev) => ({
      ...prev,
      reservations: prev.reservations.map((item) =>
        item.id === id ? { ...item, date, time, status: 'pending' } : item
      ),
    }));
  }, []);

  const markNotification = useCallback((id, read) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) =>
        item.id === id ? { ...item, read } : item
      ),
    }));
  }, []);

  const markAllRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) => ({ ...item, read: true })),
    }));
  }, []);

  const deleteNotification = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((item) => item.id !== id),
    }));
  }, []);

  const redeemReward = useCallback((reward) => {
    let earned = false;
    setState((prev) => {
      if (prev.loyalty.points < reward.cost) return prev;
      earned = true;
      return {
        ...prev,
        loyalty: {
          ...prev.loyalty,
          points: prev.loyalty.points - reward.cost,
          history: [
            {
              id: createId('h'),
              label: reward.title,
              points: -reward.cost,
              date: new Date().toISOString(),
            },
            ...prev.loyalty.history,
          ],
        },
      };
    });
    return earned;
  }, []);

  /* Points spent on an order (never more than the account holds) */
  const spendPoints = useCallback((points, label = 'استفاده از امتیاز در سفارش') => {
    let spent = 0;
    setState((prev) => {
      const available = Math.min(Math.max(0, Math.round(points)), prev.loyalty.points);
      if (available <= 0) return prev;
      spent = available;
      return {
        ...prev,
        loyalty: {
          ...prev.loyalty,
          points: prev.loyalty.points - available,
          history: [
            { id: createId('h'), label, points: -available, date: new Date().toISOString() },
            ...prev.loyalty.history,
          ],
        },
      };
    });
    return spent;
  }, []);

  /* Points earned by a completed order */
  const earnPoints = useCallback((points, label = 'امتیاز سفارش') => {
    const amount = Math.max(0, Math.round(points));
    if (!amount) return false;
    setState((prev) => ({
      ...prev,
      loyalty: {
        ...prev.loyalty,
        points: prev.loyalty.points + amount,
        history: [
          { id: createId('h'), label, points: amount, date: new Date().toISOString() },
          ...prev.loyalty.history,
        ],
      },
    }));
    return true;
  }, []);

  const setLanguage = useCallback((language) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, language } }));
  }, []);

  const updateSettings = useCallback((scope, patch) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [scope]: { ...prev.settings[scope], ...patch },
      },
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      loading,
      isAuthenticated: signedIn,
      unreadCount: state.notifications.filter((item) => !item.read).length,
      isFavorite,
      toggleFavorite,
      login,
      register,
      signOut,
      saveProfile,
      saveAddress,
      deleteAddress,
      setDefaultAddress,
      cancelReservation,
      rescheduleReservation,
      markNotification,
      markAllRead,
      deleteNotification,
      redeemReward,
      spendPoints,
      earnPoints,
      updateSettings,
      setLanguage,
    }),
    [
      state,
      loading,
      signedIn,
      isFavorite,
      toggleFavorite,
      login,
      register,
      signOut,
      saveProfile,
      saveAddress,
      deleteAddress,
      setDefaultAddress,
      cancelReservation,
      rescheduleReservation,
      markNotification,
      markAllRead,
      deleteNotification,
      redeemReward,
      spendPoints,
      earnPoints,
      updateSettings,
      setLanguage,
    ]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error('useAccount must be used inside AccountProvider');
  return context;
}
