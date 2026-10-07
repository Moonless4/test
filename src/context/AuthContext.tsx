import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Accounts live in the browser only: this app ships without a server, so the demo
 * keeps users, addresses and orders in localStorage. Swap these helpers for real
 * API calls when a backend is added.
 */

export type User = {
  id: string;
  name: string;
  email: string;
  mobile: string;
};

type StoredUser = User & { password: string };

export type Address = {
  id: string;
  title: string;
  receiver: string;
  mobile: string;
  city: string;
  line: string;
  postalCode: string;
};

export type OrderLine = {
  name: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  date: string;
  total: number;
  status: string;
  lines: OrderLine[];
};

export type WalletTransaction = {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string;
};

export type Wallet = {
  balance: number;
  transactions: WalletTransaction[];
};

export type AuthResult = { ok: boolean; error?: string };

type AuthValue = {
  user: User | null;
  addresses: Address[];
  orders: Order[];
  wallet: Wallet;
  register: (input: { name: string; email: string; mobile: string; password: string }) => AuthResult;
  login: (email: string, password: string) => AuthResult;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, 'name' | 'email' | 'mobile'>>) => void;
  changePassword: (current: string, next: string) => AuthResult;
  depositWallet: (amount: number) => void;
  withdrawWallet: (amount: number) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'date'> & { id: string }) => void;
  /** Moves a registered order to a new state, e.g. once its payment lands. */
  updateOrderStatus: (id: string, status: string) => void;
};

const USERS_KEY = 'styleon.users';
const SESSION_KEY = 'styleon.session';
const ADDRESSES_KEY = 'styleon.addresses';
const ORDERS_KEY = 'styleon.orders';
const WALLET_KEY = 'styleon.wallet';

const EMPTY_WALLET: Wallet = { balance: 0, transactions: [] };

const AuthContext = createContext<AuthValue | null>(null);

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — the session simply stays in memory */
  }
};

const normaliseEmail = (email: string) => email.trim().toLowerCase();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<StoredUser[]>(() => read<StoredUser[]>(USERS_KEY, []));
  const [userId, setUserId] = useState<string | null>(() => read<string | null>(SESSION_KEY, null));
  const [addressBook, setAddressBook] = useState<Record<string, Address[]>>(() =>
    read<Record<string, Address[]>>(ADDRESSES_KEY, {}),
  );
  const [orderBook, setOrderBook] = useState<Record<string, Order[]>>(() =>
    read<Record<string, Order[]>>(ORDERS_KEY, {}),
  );
  const [walletBook, setWalletBook] = useState<Record<string, Wallet>>(() =>
    read<Record<string, Wallet>>(WALLET_KEY, {}),
  );

  useEffect(() => write(USERS_KEY, users), [users]);
  useEffect(() => write(SESSION_KEY, userId), [userId]);
  useEffect(() => write(ADDRESSES_KEY, addressBook), [addressBook]);
  useEffect(() => write(ORDERS_KEY, orderBook), [orderBook]);
  useEffect(() => write(WALLET_KEY, walletBook), [walletBook]);

  const user = useMemo(
    () => users.find((item) => item.id === userId) ?? null,
    [users, userId],
  );

  const register: AuthValue['register'] = useCallback(
    ({ name, email, mobile, password }) => {
      const cleanEmail = normaliseEmail(email);
      if (users.some((item) => normaliseEmail(item.email) === cleanEmail)) {
        return { ok: false, error: 'این ایمیل قبلاً ثبت شده است.' };
      }
      const created: StoredUser = {
        id: `u-${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        mobile: mobile.trim(),
        password,
      };
      setUsers((prev) => [...prev, created]);
      setUserId(created.id);
      return { ok: true };
    },
    [users],
  );

  const login: AuthValue['login'] = useCallback(
    (email, password) => {
      const cleanEmail = normaliseEmail(email);
      const found = users.find((item) => normaliseEmail(item.email) === cleanEmail);
      if (!found || found.password !== password) {
        return { ok: false, error: 'ایمیل یا رمز عبور درست نیست.' };
      }
      setUserId(found.id);
      return { ok: true };
    },
    [users],
  );

  const logout = useCallback(() => setUserId(null), []);

  const updateProfile: AuthValue['updateProfile'] = useCallback(
    (patch) => {
      if (!userId) return;
      setUsers((prev) =>
        prev.map((item) =>
          item.id === userId
            ? {
                ...item,
                ...patch,
                email: patch.email ? normaliseEmail(patch.email) : item.email,
              }
            : item,
        ),
      );
    },
    [userId],
  );

  const changePassword: AuthValue['changePassword'] = useCallback(
    (current, next) => {
      const found = users.find((item) => item.id === userId);
      if (!found) return { ok: false, error: 'ابتدا وارد حساب کاربری شوید.' };
      if (found.password !== current) return { ok: false, error: 'رمز عبور فعلی درست نیست.' };
      setUsers((prev) =>
        prev.map((item) => (item.id === userId ? { ...item, password: next } : item)),
      );
      return { ok: true };
    },
    [userId, users],
  );

  const addAddress: AuthValue['addAddress'] = useCallback(
    (address) => {
      if (!userId) return;
      setAddressBook((prev) => ({
        ...prev,
        [userId]: [...(prev[userId] ?? []), { ...address, id: `a-${Date.now()}` }],
      }));
    },
    [userId],
  );

  const removeAddress: AuthValue['removeAddress'] = useCallback(
    (id) => {
      if (!userId) return;
      setAddressBook((prev) => ({
        ...prev,
        [userId]: (prev[userId] ?? []).filter((item) => item.id !== id),
      }));
    },
    [userId],
  );

  const addOrder: AuthValue['addOrder'] = useCallback(
    (order) => {
      if (!userId) return;
      const date = new Date().toLocaleDateString('fa-IR');
      setOrderBook((prev) => ({
        ...prev,
        [userId]: [{ ...order, date }, ...(prev[userId] ?? [])],
      }));
    },
    [userId],
  );

  const updateOrderStatus: AuthValue['updateOrderStatus'] = useCallback(
    (id, status) => {
      if (!userId) return;
      setOrderBook((prev) => ({
        ...prev,
        [userId]: (prev[userId] ?? []).map((order) =>
          order.id === id ? { ...order, status } : order,
        ),
      }));
    },
    [userId],
  );

  const depositWallet: AuthValue['depositWallet'] = useCallback(
    (amount) => {
      if (!userId || amount <= 0) return;
      setWalletBook((prev) => {
        const current = prev[userId] ?? EMPTY_WALLET;
        const transaction: WalletTransaction = {
          id: `t-${Date.now()}`,
          type: 'deposit',
          amount,
          date: new Date().toLocaleDateString('fa-IR'),
        };
        return {
          ...prev,
          [userId]: {
            balance: current.balance + amount,
            transactions: [transaction, ...current.transactions],
          },
        };
      });
    },
    [userId],
  );

  const withdrawWallet: AuthValue['withdrawWallet'] = useCallback(
    (amount) => {
      if (!userId || amount <= 0) return;
      setWalletBook((prev) => {
        const current = prev[userId] ?? EMPTY_WALLET;
        if (amount > current.balance) return prev;
        const transaction: WalletTransaction = {
          id: `t-${Date.now()}`,
          type: 'withdraw',
          amount,
          date: new Date().toLocaleDateString('fa-IR'),
        };
        return {
          ...prev,
          [userId]: {
            balance: current.balance - amount,
            transactions: [transaction, ...current.transactions],
          },
        };
      });
    },
    [userId],
  );

  const value = useMemo<AuthValue>(
    () => ({
      user: user ? { id: user.id, name: user.name, email: user.email, mobile: user.mobile } : null,
      addresses: userId ? addressBook[userId] ?? [] : [],
      orders: userId ? orderBook[userId] ?? [] : [],
      wallet: userId ? walletBook[userId] ?? EMPTY_WALLET : EMPTY_WALLET,
      register,
      login,
      logout,
      updateProfile,
      changePassword,
      depositWallet,
      withdrawWallet,
      addAddress,
      removeAddress,
      addOrder,
      updateOrderStatus,
    }),
    [
      user,
      userId,
      addressBook,
      orderBook,
      walletBook,
      register,
      login,
      logout,
      updateProfile,
      changePassword,
      depositWallet,
      withdrawWallet,
      addAddress,
      removeAddress,
      addOrder,
      updateOrderStatus,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
