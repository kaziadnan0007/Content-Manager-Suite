import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
}

interface AuthCtx {
  customer: Customer | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, customer: Customer) => void;
  logout: () => Promise<void>;
  updateCustomer: (c: Customer) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("cust_token");
    if (!saved) { setIsLoading(false); return; }
    fetch("/api/customers/me", { headers: { Authorization: `Bearer ${saved}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.id) { setCustomer(data); setToken(saved); }
        else localStorage.removeItem("cust_token");
      })
      .catch(() => localStorage.removeItem("cust_token"))
      .finally(() => setIsLoading(false));
  }, []);

  const login = (t: string, c: Customer) => {
    localStorage.setItem("cust_token", t);
    setToken(t); setCustomer(c);
  };

  const logout = async () => {
    if (token) {
      fetch("/api/customers/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
    localStorage.removeItem("cust_token");
    setToken(null); setCustomer(null);
  };

  const updateCustomer = (c: Customer) => setCustomer(c);

  return <Ctx.Provider value={{ customer, token, isLoading, login, logout, updateCustomer }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
