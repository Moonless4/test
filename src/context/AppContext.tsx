import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface User {
  name: string;
  phone: string;
  email?: string;
}

export interface Order {
  id: string;
  kind: 'flight' | 'hotel' | 'train' | 'bus' | 'tour';
  title: string;
  subtitle: string;
  price: number;
  createdAt: string;
  status: 'issued' | 'pending';
}

interface AppContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const USER_KEY = 'safarban.user';
const ORDERS_KEY = 'safarban.orders';
const FAVORITES_KEY = 'safarban.favorites';

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStorage<User | null>(USER_KEY, null));
  const [orders, setOrders] = useState<Order[]>(() => readStorage<Order[]>(ORDERS_KEY, []));
  const [favorites, setFavorites] = useState<string[]>(() => readStorage<string[]>(FAVORITES_KEY, []));

  useEffect(() => {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const login = useCallback((nextUser: User) => setUser(nextUser), []);
  const logout = useCallback(() => setUser(null), []);

  const addOrder = useCallback((order: Omit<Order, 'id' | 'createdAt'>) => {
    const created: Order = {
      ...order,
      id: `SB-${Math.floor(100000 + Math.random() * 899999)}`,
      createdAt: new Date().toISOString(),
    };
    setOrders((current) => [created, ...current]);
    return created;
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, orders, addOrder, favorites, toggleFavorite }),
    [user, login, logout, orders, addOrder, favorites, toggleFavorite],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
