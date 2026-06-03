import { useGetMe } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Package, Tags, ShoppingCart,
  Image as ImageIcon, Settings, LogOut, Menu, Store,
  Bell, X, CheckCircle2, Clock
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
    <div className="flex items-start gap-3 bg-white dark:bg-slate-800 border border-green-200 rounded-xl p-4 shadow-2xl w-80 animate-in slide-in-from-right-5 fade-in duration-300">
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
        <ShoppingCart className="w-5 h-5 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-xs font-bold text-green-600 uppercase tracking-wide">New Order #{n.orderId}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-1" />
        </div>
        <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{n.customerName}</p>
        <p className="text-xs text-slate-500">{n.customerPhone}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-sm font-bold text-primary">BDT {n.total.toLocaleString()}</span>
          <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">
            {paymentLabel[n.paymentMethod] ?? n.paymentMethod}
          </span>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 text-slate-400 hover:text-slate-600 transition-colors rounded flex-shrink-0"
      >
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
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50 dark:bg-slate-900">
        <span className="font-bold text-sm">Recent Notifications</span>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
      {notifications.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
          <Bell className="w-8 h-8 opacity-30" />
          No new notifications
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto divide-y">
          {notifications.map(n => (
            <div key={n.orderId} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span className="text-xs font-bold text-green-600">Order #{n.orderId}</span>
                  </div>
                  <p className="font-medium text-sm truncate mt-0.5">{n.customerName}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-primary">BDT {n.total.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.timestamp).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <button onClick={() => onDismiss(n.orderId)} className="p-1 text-slate-300 hover:text-slate-500 transition-colors rounded flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="px-4 py-2 border-t bg-slate-50 dark:bg-slate-900">
        <Link
          href="/admin/orders"
          onClick={onClose}
          className="text-xs text-primary hover:underline font-medium"
        >
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

  // Show toast for new notifications
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

  // Close panel on outside click
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
      <div className="h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
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
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/categories", icon: Tags, label: "Categories" },
    { href: "/admin/banners", icon: ImageIcon, label: "Banners" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      <div className="p-5 border-b border-slate-800">
        <div className="flex flex-col gap-1">
          <img
            src="/acholgatha-logo-transparent.png"
            alt="AcholGatha"
            className="h-8 w-auto object-contain brightness-0 invert"
          />
          <p className="text-[10px] text-slate-500 leading-tight tracking-widest uppercase font-semibold pl-0.5">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {item.href === "/admin/orders" && unreadCount > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Store className="w-4 h-4" />
          View Store
        </Link>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white truncate">{user.username}</div>
            <div className="text-xs text-slate-500">Administrator</div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="w-64 flex-shrink-0 hidden md:block fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top header bar with notification bell */}
        <header className="h-14 border-b bg-background flex items-center px-4 sticky top-0 z-40 gap-3 shadow-sm">
          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-none bg-slate-900">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-black text-xs">AG</span>
            </div>
            <span className="font-black text-primary">AcholGatha Admin</span>
          </div>

          <div className="flex-1" />

          {/* Notification bell */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => {
                setPanelOpen(p => !p);
                if (!panelOpen) clearUnread();
              }}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              title="Order notifications"
            >
              <Bell className={`w-5 h-5 ${unreadCount > 0 ? "text-primary animate-[ring_0.5s_ease-in-out]" : "text-muted-foreground"}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-background">
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

        <main className="flex-1 p-4 md:p-8 max-w-screen-xl">
          {children}
        </main>
      </div>

      {/* Floating toast notifications */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map(n => (
          <NotificationToast
            key={n.orderId}
            n={n}
            onDismiss={() => setToasts(prev => prev.filter(t => t.orderId !== n.orderId))}
          />
        ))}
      </div>

      {/* CSS for bell ring animation */}
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
