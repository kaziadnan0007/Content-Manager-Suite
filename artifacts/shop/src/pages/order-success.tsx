import { StoreLayout } from "@/components/layout/store-layout";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag, PackageSearch, Truck, Clock, Phone, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const STEPS = [
  { icon: CheckCircle2, label: "Order Received", desc: "We got your order", color: "text-green-500", done: true },
  { icon: Phone, label: "Confirmation Call", desc: "We'll call to confirm", color: "text-blue-500", done: false },
  { icon: Truck, label: "Out for Delivery", desc: "On its way to you", color: "text-purple-500", done: false },
  { icon: CheckCircle2, label: "Delivered", desc: "Enjoy your purchase!", color: "text-primary", done: false },
];

export function OrderSuccessPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const orderId = params.get("id");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">

        {/* ── Confetti-style success header ───────────────────────── */}
        <div className={`text-center mb-10 transition-all duration-700 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center ring-4 ring-green-500/20 ring-offset-4 ring-offset-background animate-pulse">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" strokeWidth={2.5} />
              </div>
            </div>
            <span className="absolute -top-2 -right-2 text-2xl animate-bounce">🎉</span>
            <span className="absolute -bottom-1 -left-3 text-xl animate-bounce" style={{ animationDelay: "0.2s" }}>⭐</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground text-lg">Thank you for shopping with SAFQUN</p>
        </div>

        {/* ── Order ID card ───────────────────────────────────────── */}
        <div className={`bg-card border-2 border-primary/20 rounded-2xl p-6 mb-6 text-center shadow-md transition-all duration-700 delay-100 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-2">Your Order ID</p>
          <div className="text-4xl font-black font-mono tracking-widest text-primary mb-3">
            #{orderId?.padStart(6, "0")}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Save this order ID to track your delivery. Our team will contact you shortly to confirm.
          </p>
        </div>

        {/* ── Delivery timeline ───────────────────────────────────── */}
        <div className={`bg-card border rounded-2xl p-6 mb-6 transition-all duration-700 delay-200 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="font-black mb-5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> What happens next?
          </h2>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />
            <div className="space-y-5">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${
                      step.done
                        ? "bg-green-500/10 border-green-500 text-green-500"
                        : "bg-card border-border text-muted-foreground"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 pt-2">
                      <p className={`font-bold text-sm ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                    {step.done && (
                      <span className="text-xs text-green-600 font-bold bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full mt-2 flex-shrink-0">Done</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Delivery info banner ─────────────────────────────────── */}
        <div className={`rounded-2xl p-4 mb-8 flex items-start gap-3 border bg-muted/30 transition-all duration-700 delay-300 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Estimated Delivery</p>
            <p className="text-sm text-muted-foreground">
              <strong>Dhaka:</strong> 1–2 business days &nbsp;·&nbsp; <strong>Outside Dhaka:</strong> 2–4 business days
            </p>
          </div>
        </div>

        {/* ── Action buttons ───────────────────────────────────────── */}
        <div className={`flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-[400ms] ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <Button asChild size="lg" className="flex-1 gap-2 neon-glow h-12 font-bold">
            <Link href={`/track-order?orderId=${orderId}`}>
              <PackageSearch className="w-5 h-5" /> Track My Order
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1 gap-2 h-12 font-bold">
            <Link href="/products">
              <ShoppingBag className="w-5 h-5" /> Continue Shopping
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="sm:w-auto gap-1 h-12">
            <Link href="/">
              Home <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

      </div>
    </StoreLayout>
  );
}
