import { useState } from "react";
import { StoreLayout } from "@/components/layout/store-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTrackOrder, getTrackOrderQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  PackageSearch, Package, CheckCircle2, Truck, Clock,
  XCircle, ShoppingBag, Phone, MapPin, CreditCard, AlertCircle,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; step: number }> = {
  pending: {
    label: "Order Received",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: <Clock className="w-4 h-4" />,
    step: 1,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    icon: <CheckCircle2 className="w-4 h-4" />,
    step: 2,
  },
  processing: {
    label: "Processing",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    icon: <Package className="w-4 h-4" />,
    step: 3,
  },
  shipped: {
    label: "Shipped",
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    icon: <Truck className="w-4 h-4" />,
    step: 4,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    icon: <CheckCircle2 className="w-4 h-4" />,
    step: 5,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: <XCircle className="w-4 h-4" />,
    step: 0,
  },
};

const TIMELINE_STEPS = [
  { key: "pending",    label: "Order Received",   icon: <ShoppingBag className="w-5 h-5" /> },
  { key: "confirmed",  label: "Order Confirmed",   icon: <CheckCircle2 className="w-5 h-5" /> },
  { key: "processing", label: "Packing in Progress", icon: <Package className="w-5 h-5" /> },
  { key: "shipped",    label: "Out for Delivery",  icon: <Truck className="w-5 h-5" /> },
  { key: "delivered",  label: "Delivered",         icon: <CheckCircle2 className="w-5 h-5" /> },
];

const PAYMENT_LABELS: Record<string, string> = {
  bkash: "bKash",
  rocket: "Rocket",
  cod: "Cash on Delivery",
};

export function TrackOrderPage() {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [queryParams, setQueryParams] = useState<{ orderId: number; phone: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: order, isLoading, error } = useTrackOrder(
    queryParams ? { orderId: queryParams.orderId, phone: queryParams.phone } : { orderId: 0, phone: "" },
    {
      query: {
        enabled: !!queryParams,
        queryKey: getTrackOrderQueryKey(
          queryParams ? { orderId: queryParams.orderId, phone: queryParams.phone } : { orderId: 0, phone: "" }
        ),
        retry: false,
      },
    }
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = parseInt(orderIdInput.trim());
    if (!id || !phoneInput.trim()) return;
    setQueryParams({ orderId: id, phone: phoneInput.trim() });
  }

  const statusConfig = order ? STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending"] : null;
  const currentStep = statusConfig?.step ?? 0;
  const isCancelled = order?.status === "cancelled";

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 shadow-sm">
            <PackageSearch className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">Enter your order ID and phone number to check your order status</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 shadow-sm border-2">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="order-id" className="font-semibold">Order ID</Label>
                <Input
                  id="order-id"
                  data-testid="input-order-id"
                  placeholder="e.g. 1234"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  type="number"
                  min="1"
                  required
                  className="h-11"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="phone" className="font-semibold">Phone Number</Label>
                <Input
                  id="phone"
                  data-testid="input-phone"
                  placeholder="e.g. 01700000000"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  type="tel"
                  required
                  className="h-11"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  data-testid="button-track-order"
                  className="w-full sm:w-auto gap-2 h-11 px-6 font-bold rounded-xl"
                  disabled={isLoading}
                >
                  <PackageSearch className="w-4 h-4" />
                  {isLoading ? "Searching..." : "Track Order"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Error */}
        {error && queryParams && (
          <Card className="border-destructive/50 bg-destructive/5 mb-6">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-destructive">Order Not Found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please check your order ID and phone number and try again.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Result */}
        {order && statusConfig && (
          <div className="space-y-6" data-testid="order-result">
            {/* Order Header */}
            <Card className="shadow-sm border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="text-xl font-black">
                    Order #{String(order.id).padStart(6, "0")}
                  </CardTitle>
                  <Badge className={`${statusConfig.color} flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold border-0`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5 font-medium uppercase tracking-wide">Customer</p>
                      <p className="font-semibold">{order.customerName}</p>
                      <p className="text-muted-foreground">{order.customerPhone}</p>
                    </div>
                  </div>
                  {order.customerAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-xs mb-0.5 font-medium uppercase tracking-wide">Delivery Address</p>
                        <p className="font-semibold">{order.customerAddress}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5 font-medium uppercase tracking-wide">Payment Method</p>
                      <p className="font-semibold">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
                      {order.transactionId && (
                        <p className="text-muted-foreground text-xs mt-0.5">TxID: {order.transactionId}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Timeline */}
            {!isCancelled && (
              <Card className="shadow-sm border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-black">Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-muted" />
                    <div
                      className="absolute left-5 top-5 w-0.5 bg-primary transition-all duration-700"
                      style={{ height: `${Math.max(0, ((currentStep - 1) / (TIMELINE_STEPS.length - 1)) * 100)}%` }}
                    />
                    <div className="space-y-6">
                      {TIMELINE_STEPS.map((step, idx) => {
                        const stepNum = idx + 1;
                        const isDone = currentStep >= stepNum;
                        const isCurrent = currentStep === stepNum;
                        return (
                          <div key={step.key} className="flex items-start gap-4 relative">
                            <div
                              className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                isDone ? "border-primary bg-primary text-primary-foreground" : "border-muted bg-background text-muted-foreground"
                              } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                              data-testid={`step-${step.key}`}
                            >
                              {step.icon}
                            </div>
                            <div className="pt-1.5">
                              <p className={`font-semibold text-sm ${isDone ? "text-foreground" : "text-muted-foreground"}`}>
                                {step.label}
                              </p>
                              {isCurrent && (
                                <p className="text-xs text-primary font-bold mt-0.5">Current Status</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isCancelled && (
              <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
                <CardContent className="pt-6 flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-destructive flex-shrink-0" />
                  <div>
                    <p className="font-black text-lg">Order Cancelled</p>
                    <p className="text-sm text-muted-foreground mt-1">Please contact us for more information or to re-order.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card className="shadow-sm border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-black">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3" data-testid={`order-item-${item.productId}`}>
                      <div className="w-14 h-14 rounded-xl bg-muted flex-shrink-0 overflow-hidden border">
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.quantity} × BDT {item.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-black text-sm flex-shrink-0 text-primary">
                        BDT {(item.quantity * item.price).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <span className="font-black text-base">Total Amount</span>
                  <span className="text-2xl font-black text-primary">BDT {order.total.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
