import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetDashboardStats, useGetRecentOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, IndianRupee, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recentOrders, isLoading: ordersLoading } = useGetRecentOrders();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">BDT {stats?.totalRevenue || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : recentOrders?.length ? (
                <div className="space-y-4">
                  {recentOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div>
                        <div className="font-medium">Order #{order.id}</div>
                        <div className="text-sm text-muted-foreground">{order.customerName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">BDT {order.total}</div>
                        <div className="text-xs px-2 py-1 rounded-full bg-muted mt-1 uppercase">
                          {order.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No recent orders.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-4">
                   <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-pink-600 font-bold">bKash</span>
                    <span className="font-medium">BDT {stats?.revenueByPayment?.bkash || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-700 font-bold">Rocket</span>
                    <span className="font-medium">BDT {stats?.revenueByPayment?.rocket || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">COD</span>
                    <span className="font-medium">BDT {stats?.revenueByPayment?.cod || 0}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
