import { StoreLayout } from "@/components/layout/store-layout";
import { useCart } from "@/components/cart-context";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useGetSettings, useCreateOrder, OrderInputPaymentMethod } from "@workspace/api-client-react";
import { useState } from "react";
import { Trash2, Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CheckoutPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { data: settings } = useGetSettings();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    paymentMethod: "cod" as OrderInputPaymentMethod,
    paymentNumber: "",
    transactionId: "",
    note: ""
  });

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) return;

    createOrder.mutate({
      data: {
        ...formData,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      }
    }, {
      onSuccess: (order) => {
        clearCart();
        setLocation(`/order-success?id=${order.id}`);
      },
      onError: () => {
        toast({
          title: "Error placing order",
          description: "There was a problem placing your order. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild size="lg">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Delivery Information</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Full Name *</Label>
                      <Input 
                        id="customerName" 
                        required 
                        value={formData.customerName}
                        onChange={e => setFormData({...formData, customerName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Phone Number *</Label>
                      <Input 
                        id="customerPhone" 
                        required 
                        value={formData.customerPhone}
                        onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerAddress">Detailed Address *</Label>
                    <Textarea 
                      id="customerAddress" 
                      required 
                      rows={3}
                      value={formData.customerAddress}
                      onChange={e => setFormData({...formData, customerAddress: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">Order Note (Optional)</Label>
                    <Textarea 
                      id="note" 
                      rows={2}
                      value={formData.note}
                      onChange={e => setFormData({...formData, note: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                <RadioGroup 
                  value={formData.paymentMethod} 
                  onValueChange={(val: any) => setFormData({...formData, paymentMethod: val})}
                  className="grid sm:grid-cols-3 gap-4"
                >
                  <div className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`} onClick={() => setFormData({...formData, paymentMethod: 'cod'})}>
                    <RadioGroupItem value="cod" id="cod" className="sr-only" />
                    <Label htmlFor="cod" className="cursor-pointer font-bold flex items-center gap-2">Cash on Delivery</Label>
                  </div>
                  <div className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors ${formData.paymentMethod === 'bkash' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`} onClick={() => setFormData({...formData, paymentMethod: 'bkash'})}>
                    <RadioGroupItem value="bkash" id="bkash" className="sr-only" />
                    <Label htmlFor="bkash" className="cursor-pointer font-bold text-pink-600">bKash</Label>
                  </div>
                  <div className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors ${formData.paymentMethod === 'rocket' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`} onClick={() => setFormData({...formData, paymentMethod: 'rocket'})}>
                    <RadioGroupItem value="rocket" id="rocket" className="sr-only" />
                    <Label htmlFor="rocket" className="cursor-pointer font-bold text-purple-700">Rocket</Label>
                  </div>
                </RadioGroup>

                {formData.paymentMethod !== 'cod' && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-4 border">
                    <div className="flex items-center justify-between p-3 bg-card border rounded-md">
                      <div>
                        <p className="text-sm text-muted-foreground">Send money to this {formData.paymentMethod === 'bkash' ? 'bKash' : 'Rocket'} number:</p>
                        <p className="text-lg font-bold font-mono tracking-wider">
                          {formData.paymentMethod === 'bkash' ? settings?.bkashNumber : settings?.rocketNumber}
                        </p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => {
                          const num = formData.paymentMethod === 'bkash' ? settings?.bkashNumber : settings?.rocketNumber;
                          if (num) copyToClipboard(num);
                        }}
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="paymentNumber">Sender Number *</Label>
                        <Input 
                          id="paymentNumber" 
                          required 
                          value={formData.paymentNumber}
                          onChange={e => setFormData({...formData, paymentNumber: e.target.value})}
                          placeholder="e.g. 017xxxxxxxx"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transactionId">Transaction ID *</Label>
                        <Input 
                          id="transactionId" 
                          required 
                          value={formData.transactionId}
                          onChange={e => setFormData({...formData, transactionId: e.target.value})}
                          placeholder="e.g. 8KXXXXXX"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="md:hidden">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 text-lg"
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? "Processing..." : `Place Order (৳${totalPrice})`}
                </Button>
              </div>
            </form>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2 sticky top-24">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded border bg-muted flex-shrink-0 overflow-hidden">
                      {item.product.images?.[0] && (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" title={item.product.name}>{item.product.name}</p>
                      <div className="text-primary font-bold text-sm">৳{item.product.price}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <button 
                          className="w-6 h-6 flex items-center justify-center border rounded hover:bg-muted"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >-</button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button 
                          className="w-6 h-6 flex items-center justify-center border rounded hover:bg-muted"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >+</button>
                      </div>
                    </div>
                    <button 
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span>৳{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>Calculated later</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                  <span>Total</span>
                  <span className="text-primary">৳{totalPrice}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                form="checkout-form"
                size="lg" 
                className="w-full h-14 text-lg mt-6 hidden md:flex"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "Processing..." : `Place Order`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
