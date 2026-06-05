import { StoreLayout } from "@/components/layout/store-layout";
import { useCart } from "@/components/cart-context";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGetSettings, useCreateOrder, OrderInputPaymentMethod } from "@workspace/api-client-react";
import { useState, useRef } from "react";
import {
  Trash2, Copy, CheckCircle2, ShieldCheck, Phone, Loader2,
  Lock, MapPin, Truck, Mail, PartyPopper, Tag, X as XIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-context";
import { BD_DISTRICTS, DHAKA_ZONE_DISTRICTS } from "@/lib/bd-districts";

type DeliveryZone = "inside-dhaka" | "outside-dhaka";

const DELIVERY_CHARGE: Record<DeliveryZone, number> = {
  "inside-dhaka": 60,
  "outside-dhaka": 120,
};

export function CheckoutPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { data: settings } = useGetSettings();
  const { customer } = useAuth();
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customerName: customer?.name || "",
    customerPhone: customer?.phone || "",
    customerAddress: customer?.address || "",
    customerEmail: customer?.email || "",
    paymentMethod: "cod" as OrderInputPaymentMethod,
    paymentNumber: "",
    transactionId: "",
    note: "",
  });

  const [district, setDistrict] = useState(customer?.city || "");
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>(
    customer?.city && !DHAKA_ZONE_DISTRICTS.has(customer.city) ? "outside-dhaka" : "inside-dhaka"
  );
  const deliveryCharge = DELIVERY_CHARGE[deliveryZone];
  const grandTotal = totalPrice + deliveryCharge;

  const handleDistrictChange = (val: string) => {
    setDistrict(val);
    setDeliveryZone(DHAKA_ZONE_DISTRICTS.has(val) ? "inside-dhaka" : "outside-dhaka");
  };

  const [copied, setCopied] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);

  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; discount: number; label: string } | null>(null);

  const PROMO_CODES: Record<string, { discount: number; label: string }> = {
    "WELCOME10": { discount: 0.10, label: "10% off (Welcome discount)" },
    "SAVE50": { discount: 0.05, label: "5% off (Seasonal sale)" },
    "NEWUSER": { discount: 0.15, label: "15% off (New user)" },
  };

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setPromoApplied({ code, ...PROMO_CODES[code] });
      toast({ title: `🎉 Promo applied!`, description: PROMO_CODES[code].label });
    } else {
      toast({ title: "Invalid promo code", description: "Check the code and try again.", variant: "destructive" });
    }
  };

  const promoDiscount = promoApplied ? Math.round(totalPrice * promoApplied.discount) : 0;
  const finalTotal = grandTotal - promoDiscount;

  // OTP state — only used when email is provided
  const [otpStep, setOtpStep] = useState<"idle" | "sent" | "verified">("idle");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoCode, setDemoCode] = useState("");
  const otpInputRef = useRef<HTMLInputElement>(null);

  const emailProvided = formData.customerEmail.trim().length > 0;
  const needsOtp = emailProvided;
  const canSubmit = !needsOtp || otpStep === "verified";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePhoneChange = (val: string) => {
    setFormData({ ...formData, customerPhone: val });
    if (otpStep !== "idle") {
      setOtpStep("idle"); setOtpInput(""); setOtpError("");
    }
  };

  const handleEmailChange = (val: string) => {
    setFormData({ ...formData, customerEmail: val });
    if (otpStep !== "idle") {
      setOtpStep("idle"); setOtpInput(""); setOtpError("");
    }
  };

  const handleSendOtp = async () => {
    const phone = formData.customerPhone.trim();
    const email = formData.customerEmail.trim();
    if (!phone) {
      toast({ title: "Enter phone number first", variant: "destructive" });
      return;
    }
    setSendingOtp(true); setOtpError("");
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error ?? "Failed to send OTP"); return; }
      setOtpStep("sent");
      setDemoMode(!!data.demoMode);
      if (data.demoMode && data.demoCode) setDemoCode(data.demoCode);
      toast({
        title: "OTP Sent! 📧",
        description: data.emailSent
          ? `Verification code sent to ${email}`
          : data.demoMode
          ? "Demo mode: code shown below."
          : `OTP sent to ${phone}`,
      });
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch { setOtpError("Network error. Please try again."); }
    finally { setSendingOtp(false); }
  };

  const handleVerifyOtp = async () => {
    const phone = formData.customerPhone.trim();
    if (!otpInput || otpInput.length !== 6) {
      setOtpError("Please enter the 6-digit code.");
      return;
    }
    setVerifyingOtp(true); setOtpError("");
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otpInput }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error ?? "Invalid code. Try again."); return; }
      setOtpStep("verified");
      toast({ title: "Email Verified! ✅" });
    } catch { setOtpError("Network error. Please try again."); }
    finally { setVerifyingOtp(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (needsOtp && otpStep !== "verified") {
      toast({
        title: "Email not verified",
        description: "Please verify your email address first.",
        variant: "destructive",
      });
      return;
    }

    const city = district;
    const fullAddress = city
      ? `${formData.customerAddress}, ${city}`
      : formData.customerAddress;

    const deliveryNote = [
      `Delivery: ${deliveryZone === "inside-dhaka" ? "Inside Dhaka (BDT 60)" : "Outside Dhaka (BDT 120)"}`,
      formData.note ? `Note: ${formData.note}` : "",
    ].filter(Boolean).join(" | ");

    createOrder.mutate(
      {
        data: {
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerAddress: fullAddress,
          paymentMethod: formData.paymentMethod,
          paymentNumber: formData.paymentNumber || undefined,
          transactionId: formData.transactionId || undefined,
          note: deliveryNote,
          items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
          ...(formData.customerEmail ? { customerEmail: formData.customerEmail } : {}),
          ...(city ? { customerCity: city } : {}),
        } as any,
      },
      {
        onSuccess: (order) => {
          clearCart();
          setPlacedOrderId(order.id);
          setOrderPlaced(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        onError: () => {
          toast({
            title: "Error placing order",
            description: "There was a problem. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  /* ── Order Success Screen ─────────────────────────────────────────── */
  if (orderPlaced) {
    return (
      <StoreLayout>
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-lg mx-auto float-in">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="w-28 h-28 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center ring-8 ring-green-50 dark:ring-green-950/20">
                <PartyPopper className="w-14 h-14 text-green-600" />
              </div>
            </div>

            <h1 className="text-4xl font-black text-green-600 mb-3">
              ✅ Order Confirmed!
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-6">
              Your order has been received and is being processed. You will receive delivery within{" "}
              <strong className="text-foreground">3–5 working days</strong>. 🎉
            </p>

            {/* Order Reference Box */}
            {placedOrderId && (
              <div className="mb-6 mx-auto max-w-xs w-full bg-card border-2 border-primary/30 rounded-2xl px-6 py-5 shadow-lg shadow-primary/10">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Order Reference Number</p>
                <div className="text-3xl font-black font-mono tracking-wider text-primary">
                  AG-{String(placedOrderId).padStart(6, "0")}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Save this number to track your order
                </p>
              </div>
            )}

            {formData.customerEmail && (
              <div className="mb-6 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl text-sm text-muted-foreground">
                📧 A confirmation email has been sent to <strong>{formData.customerEmail}</strong>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {placedOrderId && (
                <Button asChild size="lg" className="neon-glow font-bold">
                  <Link href={`/track-order?orderId=${placedOrderId}&phone=${encodeURIComponent(formData.customerPhone)}`}>
                    📦 Track My Order
                  </Link>
                </Button>
              )}
              <Button asChild size="lg" variant="outline" className="font-bold">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  /* ── Empty cart ──────────────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
          <Button asChild size="lg" className="neon-glow">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  /* ── Checkout Form ───────────────────────────────────────────────── */
  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link href="/products" className="text-muted-foreground hover:text-primary">Shop</Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-primary">Checkout</span>
        </div>
        <h1 className="text-3xl font-bold mb-8">Secure Checkout</h1>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* ── Form ── */}
          <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">

              {/* Delivery Info */}
              <div className="bg-card border rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">1</span>
                  Delivery Information
                </h2>
                <div className="space-y-4">

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      required
                      placeholder="e.g. Mohammad Rahim"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="customerPhone"
                        required
                        placeholder="01XXXXXXXXX"
                        className="pl-9"
                        value={formData.customerPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* District */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 font-semibold">
                      <MapPin className="w-4 h-4 text-primary" /> City / District *
                    </Label>
                    <select
                      required
                      value={district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="h-11 w-full rounded-lg border-2 border-input bg-background px-3 text-sm focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="">— Select your district —</option>
                      {BD_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {district && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        Auto-detected:{" "}
                        <span className={`font-bold ${deliveryZone === "inside-dhaka" ? "text-green-600" : "text-orange-500"}`}>
                          {deliveryZone === "inside-dhaka" ? "Inside Dhaka (BDT 60)" : "Outside Dhaka (BDT 120)"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDeliveryZone((z) => z === "inside-dhaka" ? "outside-dhaka" : "inside-dhaka")}
                          className="ml-1 underline text-primary"
                        >
                          change
                        </button>
                      </p>
                    )}
                  </div>

                  {/* Delivery Zone Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {(["inside-dhaka", "outside-dhaka"] as DeliveryZone[]).map((zone) => (
                      <div
                        key={zone}
                        onClick={() => setDeliveryZone(zone)}
                        className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${
                          deliveryZone === zone
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/40 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <MapPin className={`w-3.5 h-3.5 ${deliveryZone === zone ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`font-bold text-xs ${deliveryZone === zone ? "text-primary" : ""}`}>
                            {zone === "inside-dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                          </span>
                        </div>
                        <div className={`text-lg font-black ${deliveryZone === zone ? "text-primary" : "text-foreground"}`}>
                          BDT {DELIVERY_CHARGE[zone]}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="customerAddress">Delivery Address *</Label>
                    <Textarea
                      id="customerAddress"
                      required
                      rows={3}
                      placeholder="House No., Road, Area, Thana"
                      value={formData.customerAddress}
                      onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                    />
                  </div>

                  {/* Email (optional) + OTP */}
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail" className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email{" "}
                      <span className="text-muted-foreground font-normal text-xs">(optional — for order confirmation)</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="customerEmail"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.customerEmail}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        disabled={otpStep === "verified"}
                        className={otpStep === "verified" ? "bg-green-50 border-green-200 dark:bg-green-950/20" : ""}
                      />
                      {emailProvided && (
                        otpStep === "verified" ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-semibold px-3 bg-green-50 border border-green-200 rounded-lg text-sm whitespace-nowrap dark:bg-green-950/20 dark:border-green-800">
                            <CheckCircle2 className="w-4 h-4" /> Verified
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleSendOtp}
                            disabled={sendingOtp}
                            className="whitespace-nowrap border-primary text-primary hover:bg-primary hover:text-white flex-shrink-0"
                          >
                            {sendingOtp ? (
                              <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Sending…</>
                            ) : otpStep === "sent" ? "Resend" : "Send OTP"}
                          </Button>
                        )
                      )}
                    </div>

                    {/* OTP input box */}
                    {emailProvided && otpStep === "sent" && (
                      <div className="mt-2 p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <ShieldCheck className="w-4 h-4 text-primary" />
                          {demoMode ? (
                            <span>Demo — code: <strong className="font-mono text-lg tracking-widest bg-primary/10 px-2 py-0.5 rounded">{demoCode}</strong></span>
                          ) : (
                            <span>Verification code sent to <strong>{formData.customerEmail}</strong>. Valid 10 min.</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            ref={otpInputRef}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            value={otpInput}
                            onChange={(e) => { setOtpInput(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                            className="font-mono text-center text-lg tracking-widest"
                            onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                          />
                          <Button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={verifyingOtp || otpInput.length !== 6}
                            className="neon-glow"
                          >
                            {verifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                          </Button>
                        </div>
                        {otpError && <p className="text-sm text-destructive font-medium">{otpError}</p>}
                      </div>
                    )}

                    {!emailProvided && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <ShieldCheck className="w-3 h-3" /> No email? No problem — your order goes through without OTP.
                      </p>
                    )}
                  </div>

                  {/* Note */}
                  <div className="space-y-2">
                    <Label htmlFor="note">Order Note <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
                    <Textarea
                      id="note"
                      rows={2}
                      placeholder="Any special instructions…"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-card border rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">2</span>
                  Payment Method
                </h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { value: "cod",    label: "Cash on Delivery", icon: "💵" },
                    { value: "bkash",  label: "bKash",            icon: "📱" },
                    { value: "rocket", label: "Rocket",           icon: "🚀" },
                  ].map((opt) => {
                    const selected = formData.paymentMethod === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: opt.value as OrderInputPaymentMethod })}
                        className={`relative border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all w-full ${
                          selected
                            ? "border-primary bg-primary/8 shadow-md ring-2 ring-primary/20"
                            : "border-border hover:border-primary/40 hover:bg-muted/60 bg-card"
                        }`}
                      >
                        {selected && (
                          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                              <path d="M1.5 5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                        <span className="text-xl">{opt.icon}</span>
                        <span className={`font-bold text-sm text-center leading-tight ${selected ? "text-primary" : "text-foreground"}`}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {formData.paymentMethod !== "cod" && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-xl space-y-4 border">
                    <div className="flex items-center justify-between p-3 bg-card border rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Send money to this {formData.paymentMethod === "bkash" ? "bKash" : "Rocket"} number:
                        </p>
                        <p className="text-xl font-bold font-mono tracking-wider">
                          {formData.paymentMethod === "bkash" ? settings?.bkashNumber : settings?.rocketNumber}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          const num = formData.paymentMethod === "bkash" ? settings?.bkashNumber : settings?.rocketNumber;
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
                          onChange={(e) => setFormData({ ...formData, paymentNumber: e.target.value })}
                          placeholder="e.g. 017xxxxxxxx"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transactionId">Transaction ID *</Label>
                        <Input
                          id="transactionId"
                          required
                          value={formData.transactionId}
                          onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                          placeholder="e.g. 8KXXXXXX"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile place order */}
              <div className="md:hidden">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg gap-2 neon-glow"
                  disabled={createOrder.isPending || !canSubmit}
                >
                  {!canSubmit ? (
                    <><Lock className="w-5 h-5" /> Verify Email to Place Order</>
                  ) : createOrder.isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
                  ) : (
                    `Place Order — BDT ${finalTotal.toLocaleString()}`
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* ── Cart Summary ── */}
          <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2 sticky top-24">
            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-primary/5 border-b px-6 py-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" /> Order Summary
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1 mb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3 items-center">
                      <div className="w-16 h-16 rounded-lg border bg-muted flex-shrink-0 overflow-hidden">
                        {item.product.images?.[0] && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" title={item.product.name}>
                          {item.product.name}
                        </p>
                        <div className="text-primary font-bold text-sm">
                          BDT {item.product.price.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            className="w-6 h-6 flex items-center justify-center border rounded hover:bg-muted text-lg leading-none"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >−</button>
                          <span className="text-sm w-5 text-center font-medium">{item.quantity}</span>
                          <button
                            className="w-6 h-6 flex items-center justify-center border rounded hover:bg-muted text-lg leading-none"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >+</button>
                        </div>
                      </div>
                      <button
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="border-t pt-4 mb-4">
                  {!promoApplied ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyPromo())}
                          placeholder="Promo code (e.g. WELCOME10)"
                          className="w-full h-10 pl-8 pr-3 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono tracking-wider"
                        />
                      </div>
                      <Button type="button" size="sm" variant="outline" className="h-10 px-4 font-bold" onClick={applyPromo}>
                        Apply
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-green-700 dark:text-green-400 font-mono">{promoApplied.code}</p>
                        <p className="text-xs text-green-600/80">{promoApplied.label}</p>
                      </div>
                      <button onClick={() => { setPromoApplied(null); setPromoInput(""); }} className="text-muted-foreground hover:text-destructive transition-colors">
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                    <span>BDT {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      Delivery ({deliveryZone === "inside-dhaka" ? "Inside Dhaka" : "Outside Dhaka"})
                    </span>
                    <span className="font-medium text-orange-600">BDT {deliveryCharge}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Promo Discount</span>
                      <span>− BDT {promoDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xl pt-3 border-t mt-2">
                    <span>Total</span>
                    <div className="text-right">
                      {promoDiscount > 0 && (
                        <p className="text-sm text-muted-foreground line-through font-normal">BDT {grandTotal.toLocaleString()}</p>
                      )}
                      <span className="text-primary">BDT {finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  form="checkout-form"
                  size="lg"
                  className="w-full h-14 text-lg mt-5 hidden md:flex gap-2 items-center justify-center neon-glow"
                  disabled={createOrder.isPending || !canSubmit}
                >
                  {!canSubmit ? (
                    <><Lock className="w-5 h-5" /> Verify Email First</>
                  ) : createOrder.isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
                  ) : (
                    <>Place Order — BDT {finalTotal.toLocaleString()}</>
                  )}
                </Button>

                {needsOtp && otpStep !== "verified" && (
                  <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verify your email to place the order
                  </p>
                )}
                {!needsOtp && (
                  <p className="text-xs text-center text-green-600 font-medium mt-3 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready to place order
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
