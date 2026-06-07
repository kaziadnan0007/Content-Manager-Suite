import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetDashboardStats, useGetRecentOrders } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  ShoppingCart, TrendingUp, Clock, Package,
  Users, BanknoteIcon, CheckCircle2, Calendar,
  ArrowRight, Sparkles,
} from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:    { bg: "rgba(234,179,8,.15)", text: "#facc15" },
  confirmed:  { bg: "rgba(37,99,235,.15)", text: "#60a5fa" },
  processing: { bg: "rgba(99,102,241,.15)", text: "#818cf8" },
  shipped:    { bg: "rgba(139,92,246,.15)", text: "#c084fc" },
  delivered:  { bg: "rgba(34,197,94,.15)", text: "#4ade80" },
  cancelled:  { bg: "rgba(239,68,68,.15)", text: "#f87171" },
};

function StatCard({
  title, value, sub, icon: Icon, gradient, iconColor, loading, href,
}: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; gradient: string; iconColor: string;
  loading?: boolean; href?: string;
}) {
  const inner = (
    <div
      className="relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-300 border"
      style={{
        background: "rgba(30,41,59,0.60)",
        borderColor: "rgba(255,255,255,.07)",
        backdropFilter: "blur(8px)",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 12px 40px rgba(0,0,0,.40), 0 0 0 1px rgba(37,99,235,.20)";
        el.style.borderColor = "rgba(37,99,235,.30)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "";
        el.style.boxShadow = "";
        el.style.borderColor = "rgba(255,255,255,.07)";
      }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: gradient }} />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,.45)" }}>{title}</p>
          {loading ? (
            <div className="h-8 w-24 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,.08)" }} />
          ) : (
            <div className="text-2xl font-black text-white">{value}</div>
          )}
          {sub && !loading && (
            <p className="text-xs mt-1 font-medium" style={{ color: "rgba(255,255,255,.40)" }}>{sub}</p>
          )}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${iconColor}22`, border: `1px solid ${iconColor}33` }}>
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recentOrders, isLoading: ordersLoading } = useGetRecentOrders();

  const s = stats as any;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h1 className="text-2xl font-black text-white">Dashboard</h1>
            </div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,.35)" }}>
              {format(new Date(), "EEEE, MMMM d, yyyy")} — AcholGatha Control Center
            </p>
          </div>
        </div>

        {/* Today's highlight cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl p-5 border relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,.20), rgba(6,182,212,.10))",
              borderColor: "rgba(37,99,235,.30)",
              boxShadow: "0 0 40px rgba(37,99,235,.10)",
            }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
              style={{ background: "radial-gradient(circle, #2563eb, transparent)" }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Today's Orders</span>
              </div>
              {statsLoading ? <div className="h-10 w-24 rounded-lg animate-pulse bg-white/10" /> : (
                <div className="text-5xl font-black text-white">{s?.todayOrders ?? 0}</div>
              )}
              {statsLoading ? <div className="h-4 w-40 rounded mt-1 animate-pulse bg-white/10" /> : (
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,.45)" }}>
                  BDT {(s?.todayRevenue ?? 0).toLocaleString()} revenue today
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-5 border relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(34,197,94,.15), rgba(16,185,129,.08))",
              borderColor: "rgba(34,197,94,.25)",
            }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
              style={{ background: "radial-gradient(circle, #22c55e, transparent)" }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-green-400">New Customers Today</span>
              </div>
              {statsLoading ? <div className="h-10 w-24 rounded-lg animate-pulse bg-white/10" /> : (
                <div className="text-5xl font-black text-white">{s?.newCustomersToday ?? 0}</div>
              )}
              {statsLoading ? <div className="h-4 w-40 rounded mt-1 animate-pulse bg-white/10" /> : (
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,.45)" }}>
                  {(s?.totalCustomers ?? 0).toLocaleString()} total registered
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total Revenue"
            value={`BDT ${(s?.totalRevenue ?? 0).toLocaleString()}`}
            icon={TrendingUp}
            gradient="linear-gradient(135deg, rgba(37,99,235,.30), rgba(6,182,212,.15))"
            iconColor="#60a5fa"
            loading={statsLoading}
          />
          <StatCard
            title="Total Orders"
            value={s?.totalOrders ?? 0}
            sub={`${s?.deliveredOrders ?? 0} delivered`}
            icon={ShoppingCart}
            gradient="linear-gradient(135deg, rgba(99,102,241,.25), rgba(139,92,246,.12))"
            iconColor="#818cf8"
            loading={statsLoading}
            href="/admin/orders"
          />
          <StatCard
            title="Pending Orders"
            value={s?.pendingOrders ?? 0}
            sub="Needs attention"
            icon={Clock}
            gradient="linear-gradient(135deg, rgba(234,179,8,.20), rgba(245,158,11,.10))"
            iconColor="#fbbf24"
            loading={statsLoading}
            href="/admin/orders"
          />
          <StatCard
            title="Total Customers"
            value={s?.totalCustomers ?? 0}
            sub={`+${s?.newCustomersToday ?? 0} today`}
            icon={Users}
            gradient="linear-gradient(135deg, rgba(34,197,94,.20), rgba(16,185,129,.10))"
            iconColor="#4ade80"
            loading={statsLoading}
            href="/admin/customers"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total Products"
            value={s?.totalProducts ?? 0}
            icon={Package}
            gradient="linear-gradient(135deg, rgba(139,92,246,.20), rgba(168,85,247,.10))"
            iconColor="#c084fc"
            loading={statsLoading}
            href="/admin/products"
          />
          <StatCard
            title="Categories"
            value={s?.totalCategories ?? 0}
            icon={Package}
            gradient="linear-gradient(135deg, rgba(236,72,153,.20), rgba(244,114,182,.10))"
            iconColor="#f472b6"
            loading={statsLoading}
          />
          <StatCard
            title="Delivered"
            value={s?.deliveredOrders ?? 0}
            icon={CheckCircle2}
            gradient="linear-gradient(135deg, rgba(20,184,166,.20), rgba(6,182,212,.10))"
            iconColor="#2dd4bf"
            loading={statsLoading}
          />
          <StatCard
            title="Today Revenue"
            value={`BDT ${(s?.todayRevenue ?? 0).toLocaleString()}`}
            icon={BanknoteIcon}
            gradient="linear-gradient(135deg, rgba(245,158,11,.20), rgba(252,211,77,.10))"
            iconColor="#fbbf24"
            loading={statsLoading}
          />
        </div>

        {/* Bottom 2-col */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent orders */}
          <div className="rounded-2xl border overflow-hidden"
            style={{ background: "rgba(30,41,59,.60)", borderColor: "rgba(255,255,255,.07)", backdropFilter: "blur(8px)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,.06)" }}>
              <span className="font-bold text-white text-sm">Recent Orders</span>
              <Link href="/admin/orders" className="text-xs text-blue-400 hover:text-blue-300 font-bold hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {ordersLoading ? (
              <div className="space-y-0 divide-y px-5 py-2" style={{ borderColor: "rgba(255,255,255,.05)" }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="py-3">
                    <div className="h-10 w-full rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,.06)" }} />
                  </div>
                ))}
              </div>
            ) : recentOrders?.length ? (
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,.05)" }}>
                {recentOrders.slice(0, 6).map(order => (
                  <div key={order.id}
                    className="flex items-center justify-between px-5 py-3 transition-colors"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.03)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,.30)" }}>#{order.id}</span>
                        <span className="font-semibold text-sm text-white truncate">{order.customerName}</span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,.30)" }}>
                        {order.createdAt ? format(new Date(order.createdAt), "MMM d, HH:mm") : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-bold text-sm text-blue-400">BDT {Number(order.total).toLocaleString()}</span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                        style={STATUS_COLORS[order.status] ? {
                          background: STATUS_COLORS[order.status].bg,
                          color: STATUS_COLORS[order.status].text,
                        } : { background: "rgba(255,255,255,.10)", color: "rgba(255,255,255,.60)" }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12" style={{ color: "rgba(255,255,255,.25)" }}>
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No orders yet.</p>
              </div>
            )}
          </div>

          {/* Revenue by payment */}
          <div className="rounded-2xl border overflow-hidden"
            style={{ background: "rgba(30,41,59,.60)", borderColor: "rgba(255,255,255,.07)", backdropFilter: "blur(8px)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,.06)" }}>
              <span className="font-bold text-white text-sm">Revenue by Payment Method</span>
            </div>
            <div className="p-5 space-y-4">
              {statsLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-10 w-full rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,.06)" }} />
                ))
              ) : (
                [
                  { label: "bKash", value: s?.revenueByPayment?.bkash ?? 0, color: "#e2136e", bg: "rgba(226,19,110,.25)" },
                  { label: "Rocket", value: s?.revenueByPayment?.rocket ?? 0, color: "#8b2fc9", bg: "rgba(139,47,201,.25)" },
                  { label: "Cash on Delivery", value: s?.revenueByPayment?.cod ?? 0, color: "#60a5fa", bg: "rgba(96,165,250,.20)" },
                ].map(pm => {
                  const max = Math.max(
                    s?.revenueByPayment?.bkash ?? 0,
                    s?.revenueByPayment?.rocket ?? 0,
                    s?.revenueByPayment?.cod ?? 0,
                    1
                  );
                  const pct = Math.round((pm.value / max) * 100);
                  return (
                    <div key={pm.label}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm" style={{ color: pm.color }}>{pm.label}</span>
                        <span className="font-semibold text-sm text-white">BDT {pm.value.toLocaleString()}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: pm.bg.replace(".25)", ".80)").replace(".20)", ".80)") }}
                        />
                      </div>
                    </div>
                  );
                })
              )}

              {!statsLoading && (
                <div className="pt-3 border-t grid grid-cols-2 gap-2" style={{ borderColor: "rgba(255,255,255,.06)" }}>
                  <Link href="/admin/customers"
                    className="flex items-center gap-2 text-xs font-medium transition-colors"
                    style={{ color: "rgba(255,255,255,.35)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "white"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.35)"; }}
                  >
                    <Users className="w-3.5 h-3.5 text-green-400" /> View Customers
                  </Link>
                  <Link href="/admin/orders"
                    className="flex items-center gap-2 text-xs font-medium transition-colors"
                    style={{ color: "rgba(255,255,255,.35)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "white"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.35)"; }}
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-blue-400" /> All Orders
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
