import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createId, demoAccount } from '../data/account.js';

const STORAGE_KEY = 'naval-account-v1';

const AccountContext = createContext(null);

const clone = (value) => JSON.parse(JSON.stringify(value));

const readState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(demoAccount);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.user) return clone(demoAccount);
    return {
      ...clone(demoAccount),
      ...parsed,
      user: { ...demoAccount.user, ...parsed.user },
      loyalty: { ...demoAccount.loyalty, ...parsed.loyalty },
      settings: { ...demoAccount.settings, ...parsed.settings },
    };
  } catch {
    return clone(demoAccount);
  }
};

export function AccountProvider({ children }) {
  const [state, setState] = useState(readState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage can be unavailable in private mode */
    }
  }, [state]);

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
      unreadCount: state.notifications.filter((item) => !item.read).length,
      isFavorite,
      toggleFavorite,
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
      updateSettings,
      setLanguage,
    }),
    [
      state,
      loading,
      isFavorite,
      toggleFavorite,
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
