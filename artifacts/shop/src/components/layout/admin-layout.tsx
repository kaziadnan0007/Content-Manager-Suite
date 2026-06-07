import { useGetMe } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Package, Tags, ShoppingCart,
  Image as ImageIcon, Settings, LogOut, Menu, Store,
  Bell, X, CheckCircle2, Clock, Users, Sparkles,
} from "lucide-react";
import { useAdminLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOrderNotifications } from "@/hooks/use-order-notifications";
import type { OrderNotification } from "@/hooks/use-order-notifications";

function NotificationToast({ n, onDismiss }: { n: OrderNotification; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 8000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const paymentLabel: Record<string, string> = {
    cod: "Cash on Delivery", bkash: "bKash", rocket: "Rocket",
  };

  return (
    <div
      className="flex items-start gap-3 rounded-xl p-4 shadow-2xl w-80 animate-in slide-in-from-right-5 fade-in duration-300 border"
      style={{
        background: "#1e293b",
        borderColor: "rgba(37,99,235,.30)",
        boxShadow: "0 0 24px rgba(37,99,235,.20), 0 8px 40px rgba(0,0,0,.60)",
      }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.30)" }}>
        <ShoppingCart className="w-5 h-5 text-green-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-xs font-bold text-green-400 uppercase tracking-wide">New Order #{n.orderId}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-1" />
        </div>
        <p className="font-semibold text-sm text-white truncate">{n.customerName}</p>
        <p className="text-xs text-slate-400">{n.customerPhone}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-sm font-bold text-blue-400">BDT {n.total.toLocaleString()}</span>
          <span className="text-xs px-2 py-0.5 rounded-full text-slate-300"
            style={{ background: "rgba(255,255,255,.07)" }}>
            {paymentLabel[n.paymentMethod] ?? n.paymentMethod}
          </span>
        </div>
      </div>
      <button onClick={onDismiss} className="p-1 text-slate-500 hover:text-slate-300 transition-colors rounded flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function NotificationPanel({ notifications, onDismiss, onClose }: {
  notifications: OrderNotification[];
  onDismiss: (id: number) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl z-50 overflow-hidden border"
      style={{
        background: "#1e293b",
        borderColor: "rgba(255,255,255,.08)",
        boxShadow: "0 0 40px rgba(0,0,0,.60), 0 0 80px rgba(37,99,235,.08)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(255,255,255,.06)", background: "rgba(0,0,0,.30)" }}>
        <span className="font-bold text-sm text-white">Recent Notifications</span>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      {notifications.length === 0 ? (
        <div className="py-10 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
          <Bell className="w-8 h-8 opacity-20" />
          No new notifications
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto divide-y" style={{ borderColor: "rgba(255,255,255,.05)" }}>
          {notifications.map(n => (
            <div key={n.orderId} className="px-4 py-3 hover:bg-white/3 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-green-400">Order #{n.orderId}</span>
                  </div>
                  <p className="font-medium text-sm text-white truncate mt-0.5">{n.customerName}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-blue-400">BDT {n.total.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.timestamp).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <button onClick={() => onDismiss(n.orderId)} className="p-1 text-slate-600 hover:text-slate-300 transition-colors rounded flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="px-4 py-2 border-t" style={{ borderColor: "rgba(255,255,255,.06)", background: "rgba(0,0,0,.20)" }}>
        <Link href="/admin/orders" onClick={onClose} className="text-xs text-blue-400 hover:text-blue-300 font-medium hover:underline">
          View all orders →
        </Link>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useGetMe({ query: { retry: false } });
  const logout = useAdminLogout();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toasts, setToasts] = useState<OrderNotification[]>([]);
  const queryClient = useQueryClient();
  const panelRef = useRef<HTMLDivElement>(null);

  const isAdmin = !isLoading && !isError && !!user;
  const { notifications, unreadCount, clearUnread, dismissNotification } = useOrderNotifications(isAdmin);

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      setLocation("/admin/login");
    }
  }, [isLoading, isError, user, setLocation]);

  const prevLen = useRef(0);
  useEffect(() => {
    if (notifications.length > prevLen.current && prevLen.current >= 0) {
      const newest = notifications[0];
      if (newest && !toasts.find(t => t.orderId === newest.orderId)) {
        setToasts(prev => [newest, ...prev].slice(0, 3));
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      }
    }
    prevLen.current = notifications.length;
  }, [notifications, toasts, queryClient]);

  useEffect(() => {
    if (!panelOpen) return;
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [panelOpen]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "#0f172a" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #2563eb, #06b6d4)", boxShadow: "0 0 32px rgba(37,99,235,.50)" }}>
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </div>
          <p className="text-slate-400 text-sm font-medium tracking-wide">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (isError || !user) return null;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/admin/login");
      }
    });
  };

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/admin/customers", icon: Users, label: "Customers" },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/categories", icon: Tags, label: "Categories" },
    { href: "/admin/banners", icon: ImageIcon, label: "Banners" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: "#0a0e1a" }}>
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,.05)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #2563eb, #06b6d4)", boxShadow: "0 0 16px rgba(37,99,235,.40)" }}>
            <img
              src="/acholgatha-logo-transparent.png"
              alt="AG"
              className="h-5 w-auto object-contain brightness-0 invert"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
                el.parentElement!.innerHTML = '<span style="color:white;font-weight:900;font-size:14px">AG</span>';
              }}
            />
          </div>
          <div className="min-w-0">
            <p className="font-black text-white text-sm leading-none tracking-tight">AcholGatha</p>
            <p className="text-[9px] tracking-widest uppercase font-bold mt-0.5" style={{ color: "rgba(37,99,235,.80)" }}>Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] font-black uppercase tracking-widest px-3 pb-2 pt-1" style={{ color: "rgba(255,255,255,.20)" }}>
          Main Menu
        </p>
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium"
              style={isActive ? {
                background: "linear-gradient(135deg, rgba(37,99,235,.20), rgba(6,182,212,.12))",
                borderLeft: "2px solid #2563eb",
                paddingLeft: "10px",
                color: "white",
              } : {
                color: "rgba(255,255,255,.45)",
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.04)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.45)"; } }}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" style={isActive ? { color: "#60a5fa" } : {}} />
              <span>{item.label}</span>
              {item.href === "/admin/orders" && unreadCount > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", minWidth: "20px" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#60a5fa" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 space-y-1 border-t" style={{ borderColor: "rgba(255,255,255,.05)" }}>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all"
          style={{ color: "rgba(255,255,255,.30)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.04)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.80)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.30)"; }}
        >
          <Store className="w-4 h-4" />
          View Store
        </Link>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
          style={{ background: "rgba(255,255,255,.03)", borderColor: "rgba(255,255,255,.06)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #2563eb, #06b6d4)" }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white truncate">{user.username}</div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,.30)" }}>Administrator</div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,.25)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,.15)"; (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.25)"; }}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "#0f172a" }}>
      {/* Desktop sidebar */}
      <aside className="w-64 flex-shrink-0 hidden md:block fixed inset-y-0 z-50 border-r" style={{ borderColor: "rgba(255,255,255,.05)" }}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top header */}
        <header
          className="h-14 border-b flex items-center px-4 sticky top-0 z-40 gap-3"
          style={{
            background: "rgba(10,14,26,0.90)",
            backdropFilter: "blur(16px)",
            borderColor: "rgba(255,255,255,.06)",
          }}
        >
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="flex-shrink-0" style={{ color: "rgba(255,255,255,.50)" }}>
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-none" style={{ background: "#0a0e1a" }}>
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs"
              style={{ background: "linear-gradient(135deg, #2563eb, #06b6d4)" }}>
              AG
            </div>
            <span className="font-black text-white text-sm">AcholGatha</span>
          </div>

          <div className="flex-1" />

          {/* Notification bell */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => {
                setPanelOpen(p => !p);
                if (!panelOpen) clearUnread();
              }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors border"
              style={{ borderColor: "rgba(255,255,255,.06)", color: unreadCount > 0 ? "#60a5fa" : "rgba(255,255,255,.35)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.05)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
              title="Order notifications"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center border-2"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    borderColor: "#0a0e1a",
                    minWidth: "18px",
                    height: "18px",
                    padding: "0 3px",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {panelOpen && (
              <NotificationPanel
                notifications={notifications}
                onDismiss={dismissNotification}
                onClose={() => setPanelOpen(false)}
              />
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map(n => (
          <NotificationToast
            key={n.orderId}
            n={n}
            onDismiss={() => setToasts(prev => prev.filter(t => t.orderId !== n.orderId))}
          />
        ))}
      </div>

      <style>{`
        @keyframes ring {
          0%   { transform: rotate(0deg); }
          10%  { transform: rotate(15deg); }
          30%  { transform: rotate(-12deg); }
          50%  { transform: rotate(10deg); }
          70%  { transform: rotate(-8deg); }
          90%  { transform: rotate(5deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
