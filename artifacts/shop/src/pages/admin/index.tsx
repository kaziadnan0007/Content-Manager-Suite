import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetDashboardStats, useGetRecentOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  ShoppingCart, TrendingUp, Clock, Package,
  Users, BanknoteIcon, CheckCircle2, Calendar,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed:  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  shipped:    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function StatCard({
  title, value, sub, icon: Icon, color, loading, href,
}: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; loading?: boolean; href?: string;
}) {
  const inner = (
    <Card className={`relative overflow-hidden border transition-shadow hover:shadow-md ${href ? "cursor-pointer" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <div className={`text-2xl font-black ${color}`}>{value}</div>
            )}
            {sub && !loading && (
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">{sub}</p>
            )}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color === "text-primary" ? "bg-primary/10" : "bg-current/5"}`} style={{ backgroundColor: undefined }}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recentOrders, isLoading: ordersLoading } = useGetRecentOrders();

  const s = stats as any;

  return (
    <AdminLayout>
      <div className="space-y-7">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")} — AcholGatha Control Center
          </p>
        </div>

        {/* ── Today highlight ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Today's Orders</span>
              </div>
              {statsLoading ? <Skeleton className="h-9 w-20 mt-1" /> : (
                <div className="text-4xl font-black text-primary">{s?.todayOrders ?? 0}</div>
              )}
              {statsLoading ? <Skeleton className="h-4 w-32 mt-1" /> : (
                <p className="text-sm text-muted-foreground mt-1">BDT {(s?.todayRevenue ?? 0).toLocaleString()} revenue today</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-green-300/40 bg-gradient-to-br from-green-500/5 to-green-500/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-green-600">New Customers Today</span>
              </div>
              {statsLoading ? <Skeleton className="h-9 w-20 mt-1" /> : (
                <div className="text-4xl font-black text-green-600">{s?.newCustomersToday ?? 0}</div>
              )}
              {statsLoading ? <Skeleton className="h-4 w-32 mt-1" /> : (
                <p className="text-sm text-muted-foreground mt-1">{(s?.totalCustomers ?? 0).toLocaleString()} total registered</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Main stats grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={`BDT ${(s?.totalRevenue ?? 0).toLocaleString()}`}
            icon={TrendingUp} color="text-primary" loading={statsLoading} />
          <StatCard title="Total Orders" value={s?.totalOrders ?? 0}
            sub={`${s?.deliveredOrders ?? 0} delivered`}
            icon={ShoppingCart} color="text-blue-600" loading={statsLoading} href="/admin/orders" />
          <StatCard title="Pending Orders" value={s?.pendingOrders ?? 0}
            sub="Needs attention"
            icon={Clock} color="text-amber-600" loading={statsLoading} href="/admin/orders" />
          <StatCard title="Total Customers" value={s?.totalCustomers ?? 0}
            sub={`+${s?.newCustomersToday ?? 0} today`}
            icon={Users} color="text-green-600" loading={statsLoading} href="/admin/customers" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Products" value={s?.totalProducts ?? 0}
            icon={Package} color="text-indigo-600" loading={statsLoading} href="/admin/products" />
          <StatCard title="Categories" value={s?.totalCategories ?? 0}
            icon={Package} color="text-pink-600" loading={statsLoading} />
          <StatCard title="Delivered" value={s?.deliveredOrders ?? 0}
            icon={CheckCircle2} color="text-green-600" loading={statsLoading} />
          <StatCard title="Today Revenue" value={`BDT ${(s?.todayRevenue ?? 0).toLocaleString()}`}
            icon={BanknoteIcon} color="text-teal-600" loading={statsLoading} />
        </div>

        {/* ── Bottom 2-col ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold">Recent Orders</CardTitle>
              <Link href="/admin/orders" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {ordersLoading ? (
                <div className="space-y-0 divide-y px-5 pb-4">
                  {[1, 2, 3, 4].map(i => <div key={i} className="py-3"><Skeleton className="h-10 w-full" /></div>)}
                </div>
              ) : recentOrders?.length ? (
                <div className="divide-y">
                  {recentOrders.slice(0, 6).map(order => (
                    <div key={order.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">#{order.id}</span>
                          <span className="font-semibold text-sm truncate">{order.customerName}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {order.createdAt ? format(new Date(order.createdAt), "MMM d, HH:mm") : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-bold text-sm text-primary">BDT {Number(order.total).toLocaleString()}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground text-sm">No orders yet.</div>
              )}
            </CardContent>
          </Card>

          {/* Revenue by payment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Revenue by Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statsLoading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)
              ) : (
                [
                  { label: "bKash", value: s?.revenueByPayment?.bkash ?? 0, color: "bg-pink-500", text: "text-pink-600" },
                  { label: "Rocket", value: s?.revenueByPayment?.rocket ?? 0, color: "bg-purple-600", text: "text-purple-700" },
                  { label: "Cash on Delivery", value: s?.revenueByPayment?.cod ?? 0, color: "bg-slate-600", text: "text-slate-700 dark:text-slate-300" },
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
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`font-bold text-sm ${pm.text}`}>{pm.label}</span>
                        <span className="font-semibold text-sm">BDT {pm.value.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${pm.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}

              {/* Quick nav links */}
              {!statsLoading && (
                <div className="pt-3 border-t grid grid-cols-2 gap-2 mt-2">
                  <Link href="/admin/customers" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
                    <Users className="w-3.5 h-3.5 text-green-600" /> View Customers
                  </Link>
                  <Link href="/admin/orders" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
                    <ShoppingCart className="w-3.5 h-3.5 text-blue-600" /> All Orders
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
