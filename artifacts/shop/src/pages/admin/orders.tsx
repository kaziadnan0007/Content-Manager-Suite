import { AdminLayout } from "@/components/layout/admin-layout";
import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey, OrderStatusUpdateStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: ordersData } = useListOrders({ status: statusFilter !== "all" ? statusFilter : undefined, limit: 50 });
  const updateOrderStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();

  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateOrderStatus.mutate({ id: orderId, data: { status: newStatus as OrderStatusUpdateStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      case 'processing': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-500';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersData?.orders?.map(order => (
              <TableRow key={order.id}>
                <TableCell className="font-bold">#{order.id}</TableCell>
                <TableCell>{order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy") : '-'}</TableCell>
                <TableCell>
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                </TableCell>
                <TableCell className="font-bold text-primary">৳{order.total}</TableCell>
                <TableCell className="uppercase text-xs font-bold">{order.paymentMethod}</TableCell>
                <TableCell>
                  <Select 
                    value={order.status} 
                    onValueChange={(val) => handleStatusChange(order.id, val)}
                  >
                    <SelectTrigger className={`w-[130px] h-8 text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">PENDING</SelectItem>
                      <SelectItem value="confirmed">CONFIRMED</SelectItem>
                      <SelectItem value="processing">PROCESSING</SelectItem>
                      <SelectItem value="shipped">SHIPPED</SelectItem>
                      <SelectItem value="delivered">DELIVERED</SelectItem>
                      <SelectItem value="cancelled">CANCELLED</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    {selectedOrder?.id === order.id && (
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl flex items-center justify-between">
                            Order #{order.id}
                            <span className={`text-xs px-3 py-1 rounded-full uppercase ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="grid md:grid-cols-2 gap-6 my-4">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-bold text-lg mb-2 border-b pb-1">Customer Details</h3>
                              <p><span className="text-muted-foreground mr-2">Name:</span> {order.customerName}</p>
                              <p><span className="text-muted-foreground mr-2">Phone:</span> {order.customerPhone}</p>
                              <p><span className="text-muted-foreground mr-2">Address:</span> {order.customerAddress}</p>
                              {order.note && <p><span className="text-muted-foreground mr-2">Note:</span> {order.note}</p>}
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-bold text-lg mb-2 border-b pb-1">Payment Info</h3>
                              <p><span className="text-muted-foreground mr-2">Method:</span> <span className="uppercase font-bold">{order.paymentMethod}</span></p>
                              {order.paymentMethod !== 'cod' && (
                                <>
                                  <p><span className="text-muted-foreground mr-2">Sender No:</span> {order.paymentNumber}</p>
                                  <p><span className="text-muted-foreground mr-2">TrxID:</span> {order.transactionId}</p>
                                </>
                              )}
                              <p><span className="text-muted-foreground mr-2">Total Amount:</span> <span className="font-bold text-primary text-xl">৳{order.total}</span></p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-bold text-lg mb-2 border-b pb-1">Order Items</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-center">Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {order.items?.map((item: any, idx: number) => (
                                <TableRow key={idx}>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                                        {item.productImage && <img src={item.productImage} className="w-full h-full object-cover" />}
                                      </div>
                                      <span className="font-medium">{item.productName}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">{item.quantity}</TableCell>
                                  <TableCell className="text-right">৳{item.price}</TableCell>
                                  <TableCell className="text-right font-bold">৳{item.price * item.quantity}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        
                        <div className="flex justify-end mt-4">
                          <Select 
                            value={order.status} 
                            onValueChange={(val) => handleStatusChange(order.id, val)}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">PENDING</SelectItem>
                              <SelectItem value="confirmed">CONFIRMED</SelectItem>
                              <SelectItem value="processing">PROCESSING</SelectItem>
                              <SelectItem value="shipped">SHIPPED</SelectItem>
                              <SelectItem value="delivered">DELIVERED</SelectItem>
                              <SelectItem value="cancelled">CANCELLED</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
            {(!ordersData?.orders || ordersData.orders.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
