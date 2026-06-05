import { StoreLayout } from "@/components/layout/store-layout";
import {
  useGetSettings, useListBanners, useListProducts, useListCategories,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product-card";
import { RecentlyViewedRow } from "@/components/recently-viewed-row";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { useEffect, useRef, useState } from "react";
import {
  ChevronRight, ChevronLeft, TrendingUp,
  Truck, RefreshCw, Shield, HeadphonesIcon, Flame, Timer, Zap,
  CheckCircle2, Percent, Star, ArrowRight, BadgePercent,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

/* ── Category gradient map ──────────────────────────────────────────────── */
function getCatStyle(name: string): { bg: string; accent: string; emoji: string } {
  const n = name.toLowerCase();
  if (n.includes("electron") || n.includes("tech") || n.includes("gadget"))
    return { bg: "linear-gradient(135deg,#1e3a8a,#2563eb)", accent: "#93c5fd", emoji: "📱" };
  if (n.includes("fashion") || n.includes("clothing") || n.includes("apparel"))
    return { bg: "linear-gradient(135deg,#9d174d,#db2777)", accent: "#fbcfe8", emoji: "👗" };
  if (n.includes("beauty") || n.includes("skincare") || n.includes("cosmetic"))
    return { bg: "linear-gradient(135deg,#6b21a8,#a855f7)", accent: "#e9d5ff", emoji: "💄" };
  if (n.includes("food") || n.includes("grocery") || n.includes("organic"))
    return { bg: "linear-gradient(135deg,#14532d,#16a34a)", accent: "#86efac", emoji: "🛒" };
  if (n.includes("home") || n.includes("decor") || n.includes("interior"))
    return { bg: "linear-gradient(135deg,#9a3412,#ea580c)", accent: "#fed7aa", emoji: "🏠" };
  if (n.includes("furniture") || n.includes("bed") || n.includes("sofa"))
    return { bg: "linear-gradient(135deg,#713f12,#d97706)", accent: "#fde68a", emoji: "🛋️" };
  if (n.includes("sport") || n.includes("fitness") || n.includes("gym"))
    return { bg: "linear-gradient(135deg,#075985,#0284c7)", accent: "#7dd3fc", emoji: "⚽" };
  if (n.includes("health") || n.includes("pharma") || n.includes("medicine"))
    return { bg: "linear-gradient(135deg,#065f46,#059669)", accent: "#6ee7b7", emoji: "💊" };
  if (n.includes("auto") || n.includes("car") || n.includes("vehicle"))
    return { bg: "linear-gradient(135deg,#1c1917,#57534e)", accent: "#d6d3d1", emoji: "🚗" };
  if (n.includes("kid") || n.includes("toy") || n.includes("baby"))
    return { bg: "linear-gradient(135deg,#c2410c,#f97316)", accent: "#fed7aa", emoji: "🧸" };
  if (n.includes("book") || n.includes("station") || n.includes("office"))
    return { bg: "linear-gradient(135deg,#1e3a5f,#3b82f6)", accent: "#bfdbfe", emoji: "📚" };
  if (n.includes("bag") || n.includes("luggage") || n.includes("watch") || n.includes("jewelr"))
    return { bg: "linear-gradient(135deg,#4c1d95,#7c3aed)", accent: "#ddd6fe", emoji: "👜" };
  if (n.includes("shoe") || n.includes("footwear") || n.includes("slipper"))
    return { bg: "linear-gradient(135deg,#1e3a5f,#4f46e5)", accent: "#c7d2fe", emoji: "👟" };
  if (n.includes("kitchen") || n.includes("cook") || n.includes("utensil"))
    return { bg: "linear-gradient(135deg,#7f1d1d,#dc2626)", accent: "#fca5a5", emoji: "🍳" };
  return { bg: "linear-gradient(135deg,hsl(218 62% 18%),hsl(192 80% 28%))", accent: "#67e8f9", emoji: "📦" };
}

/* ── Countdown hook ─────────────────────────────────────────────────────── */
function useFlashSaleCountdown() {
  const getEndOfDay = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return Math.max(0, end.getTime() - now.getTime());
  };
  const [timeLeft, setTimeLeft] = useState(getEndOfDay());
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getEndOfDay()), 1000);
    return () => clearInterval(t);
  }, []);
  return {
    hours: Math.floor(timeLeft / 3600000),
    minutes: Math.floor((timeLeft % 3600000) / 60000),
    seconds: Math.floor((timeLeft % 60000) / 1000),
  };
}

/* ── Countdown box ──────────────────────────────────────────────────────── */
function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur rounded-xl w-14 h-14 flex items-center justify-center text-white font-black text-2xl border border-white/30 tabular-nums shadow-inner">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[10px] text-white/80 mt-1 font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
}

/* ── Section header ─────────────────────────────────────────────────────── */
function SectionHeader({
  icon, title, subtitle, href, hrefLabel = "View all", accent = false,
}: {
  icon?: React.ReactNode; title: string; subtitle?: string;
  href?: string; hrefLabel?: string; accent?: boolean;
}) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h2 className="text-xl md:text-2xl font-black tracking-tight">{title}</h2>
        </div>
        {accent && (
          <div className="h-1 w-12 rounded-full bg-primary mb-1.5" />
        )}
        {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href}
          className="flex items-center gap-1 text-sm text-primary font-bold hover:underline whitespace-nowrap group">
          {hrefLabel}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

/* ── Brand marquee ──────────────────────────────────────────────────────── */
const BRANDS = [
  "Samsung", "Sony", "LG", "Walton", "Singer", "Marcel", "Vision", "Rangs",
  "Butterfly", "RFL", "Pran", "ACI", "Aarong", "Yellow", "Cats Eye", "Apex",
  "Ecstasy", "Sailor", "Bay Emporium", "Unilever", "Nestlé", "P&G", "Beximco",
  "Partex", "Square", "BSRM", "Bashundhara", "Fresh", "Ispahani", "Igloo",
];

function BrandMarquee() {
  const repeated = [...BRANDS, ...BRANDS];
  return (
    <section className="py-3 border-y bg-muted/20 overflow-hidden">
      <div className="flex items-center gap-0 whitespace-nowrap marquee-track">
        {repeated.map((b, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-6 text-xs font-black text-muted-foreground hover:text-primary transition-colors cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 inline-block" />
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ── Payment methods ────────────────────────────────────────────────────── */
const PAYMENT_METHODS = [
  { label: "bKash", color: "#E2136E", bg: "#fce4f0", text: "#E2136E", emoji: "💳" },
  { label: "Nagad", color: "#F7941D", bg: "#fff3e0", text: "#E65100", emoji: "💰" },
  { label: "Rocket", color: "#8B2FC9", bg: "#f3e8ff", text: "#6B21A8", emoji: "🚀" },
  { label: "VISA", color: "#1A1F71", bg: "#e8eaf6", text: "#1A1F71", emoji: "💳" },
  { label: "Mastercard", color: "#EB001B", bg: "#fce4ec", text: "#c62828", emoji: "💳" },
  { label: "Cash on Delivery", color: "#1B5E20", bg: "#e8f5e9", text: "#2e7d32", emoji: "💵" },
  { label: "SSL Commerz", color: "#0070ba", bg: "#e3f2fd", text: "#0070ba", emoji: "🔒" },
];

function PaymentMethodsStrip() {
  return (
    <section className="py-8 border-t bg-muted/10">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
          Secure Payment Methods Accepted
        </p>
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {PAYMENT_METHODS.map((m) => (
            <div
              key={m.label}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-black transition-all hover:scale-105"
              style={{ borderColor: m.color + "40", background: m.bg, color: m.text }}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonial strip ──────────────────────────────────────────────────── */
const TESTIMONIALS = [
  { name: "Rahim Uddin", area: "Dhaka", rating: 5, text: "Got my order in 4 hours! Packaging was perfect. Highly recommend AcholGatha." },
  { name: "Nusrat Jahan", area: "Chittagong", rating: 5, text: "Authentic products at fair prices. bKash payment was super easy!" },
  { name: "Karim Hossain", area: "Sylhet", rating: 5, text: "Best online shop in Bangladesh. Customer service replied instantly on WhatsApp." },
  { name: "Tania Akter", area: "Rajshahi", rating: 4, text: "Wide product selection and fast delivery. Will definitely order again!" },
];

function TestimonialStrip() {
  return (
    <section className="py-10 bg-muted/20">
      <div className="container mx-auto px-4">
        <SectionHeader
          icon={<Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
          title="What Customers Say"
          subtitle="Real reviews from verified buyers across Bangladesh"
        />
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 hover:shadow-md hover:border-primary/30 transition-all">
              <div className="flex gap-0.5 mb-2">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s <= t.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-black leading-none">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.area}</p>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Newsletter CTA ─────────────────────────────────────────────────────── */
function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="rounded-3xl overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, hsl(218 65% 8%) 0%, hsl(218 58% 16%) 50%, hsl(192 80% 22%) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary/10" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full bg-white/3" />
          <div className="absolute top-1/2 left-12 w-2 h-2 rounded-full bg-primary animate-ping" style={{ animationDelay: "0.3s" }} />
          <div className="absolute top-8 right-1/3 w-1.5 h-1.5 rounded-full bg-primary/60 animate-ping" style={{ animationDelay: "1.1s" }} />
        </div>
        <div className="relative z-10 p-8 md:p-12 text-white text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 mb-5">
            <BadgePercent className="w-4 h-4 text-primary" />
            <span className="text-xs font-black text-primary uppercase tracking-widest">Exclusive Offers</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black mb-2 leading-tight">
            Get 10% Off Your First Order!
          </h2>
          <p className="text-white/70 mb-6 max-w-md mx-auto text-sm md:text-base">
            Subscribe to our newsletter and receive exclusive deals, flash sale alerts & new arrival updates.
          </p>
          {done ? (
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-full px-6 py-3 text-green-300 font-black">
              <CheckCircle2 className="w-5 h-5" /> You're subscribed — watch your inbox!
            </div>
          ) : (
            <form
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
              onSubmit={(e) => { e.preventDefault(); if (email.trim()) setDone(true); }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary text-sm"
              />
              <Button type="submit" className="h-12 px-8 rounded-xl font-black bg-primary text-primary-foreground hover:bg-primary/90 neon-glow whitespace-nowrap">
                Subscribe →
              </Button>
            </form>
          )}
          <p className="text-white/40 text-xs mt-3">No spam. Unsubscribe any time.</p>
        </div>
      </div>
    </section>
  );
}

/* ── Stats counter strip ────────────────────────────────────────────────── */
function StatsStrip() {
  return (
    <section className="py-6 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x divide-primary-foreground/20">
          {[
            { value: "50,000+", label: "Happy Customers" },
            { value: "150+", label: "Products Listed" },
            { value: "4.9 ★", label: "Average Rating" },
            { value: "24/7", label: "Customer Support" },
          ].map((s) => (
            <div key={s.label} className="px-4 py-1">
              <p className="text-2xl md:text-3xl font-black tracking-tight">{s.value}</p>
              <p className="text-xs text-primary-foreground/70 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Main home page ─────────────────────────────────────────────────────── */
export function Home() {
  const { data: settings } = useGetSettings();
  const { data: banners } = useListBanners();
  const { data: categories } = useListCategories();
  const { data: featuredData, isLoading: loadingFeatured } = useListProducts({ featured: true, limit: 8 });
  const { data: latestData, isLoading: loadingLatest } = useListProducts({ limit: 16 });
  const { data: electronicsData } = useListProducts({ category: "electronics", limit: 6 });
  const { data: clothingData } = useListProducts({ category: "clothing", limit: 6 });
  const { data: beautyData } = useListProducts({ category: "beauty", limit: 6 });

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentSlide, setCurrentSlide] = useState(0);
  const { hours, minutes, seconds } = useFlashSaleCountdown();

  const activeBanners = (banners?.filter((b) => b.active) || []).sort((a, b) => a.sortOrder - b.sortOrder);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setCurrentSlide(emblaApi.selectedScrollSnap()));
    const timer = setInterval(() => emblaApi.scrollNext(), 4500);
    return () => clearInterval(timer);
  }, [emblaApi]);

  const { recentIds } = useRecentlyViewed();

  const featuredProducts = featuredData?.products || [];
  const latestProducts = latestData?.products || [];
  const electronicsProducts = electronicsData?.products || [];
  const clothingProducts = clothingData?.products || [];
  const beautyProducts = beautyData?.products || [];

  return (
    <StoreLayout>

      {/* ── HERO CAROUSEL ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {activeBanners.length > 0 ? (
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {activeBanners.map((banner) => (
                  <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative h-[48vw] min-h-[260px] max-h-[640px]">
                    <img src={banner.imageUrl} alt={banner.title}
                      className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent flex items-center px-6 md:px-20">
                      <div className="max-w-xl text-white">
                        <div className="inline-flex items-center gap-2 bg-primary/30 backdrop-blur-sm border border-primary/40 rounded-full px-4 py-1.5 mb-4">
                          <Zap className="w-4 h-4 text-primary fill-primary" />
                          <span className="text-xs font-black text-primary tracking-widest uppercase">Hot Deal</span>
                        </div>
                        <h1 className="text-3xl md:text-6xl font-black mb-3 leading-tight drop-shadow-lg">{banner.title}</h1>
                        {banner.subtitle && (
                          <p className="text-base md:text-xl mb-6 text-white/90 drop-shadow-sm">{banner.subtitle}</p>
                        )}
                        {banner.linkUrl && (
                          <div className="flex gap-3 flex-wrap">
                            <Button asChild size="lg" className="rounded-full font-black px-8 shadow-xl text-base h-12 bg-primary text-primary-foreground hover:bg-primary/90 neon-glow">
                              <Link href={banner.linkUrl}>Shop Now →</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="rounded-full px-6 h-12 border-white/50 text-white hover:bg-white/20 bg-transparent">
                              <Link href="/track-order">Track Order</Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {activeBanners.length > 1 && (
              <>
                <button onClick={() => emblaApi?.scrollPrev()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-primary/80 text-white flex items-center justify-center transition-all shadow-xl backdrop-blur border border-white/10">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => emblaApi?.scrollNext()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-primary/80 text-white flex items-center justify-center transition-all shadow-xl backdrop-blur border border-white/10">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {activeBanners.map((_, i) => (
                    <button key={i} onClick={() => emblaApi?.scrollTo(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "bg-primary w-8" : "bg-white/50 w-2"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="h-[52vh] md:h-[70vh] flex items-center hero-gradient relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-[600px] h-[600px] rounded-full bg-primary/8" />
              <div className="absolute bottom-0 right-40 w-72 h-72 rounded-full bg-white/4" />
              <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-primary animate-ping" style={{ animationDelay: "0.5s" }} />
              <div className="absolute top-1/4 left-2/3 w-1.5 h-1.5 rounded-full bg-primary/60 animate-ping" style={{ animationDelay: "1s" }} />
              <div className="absolute bottom-1/3 right-1/4 w-1 h-1 rounded-full bg-white/40 animate-ping" style={{ animationDelay: "1.7s" }} />
            </div>
            <div className="container mx-auto px-4 md:px-16 relative z-10">
              <div className="max-w-2xl text-white">
                <div className="inline-flex items-center gap-2 bg-primary/25 backdrop-blur-sm border border-primary/40 rounded-full px-4 py-1.5 mb-5">
                  <Zap className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-xs font-black text-primary tracking-widest uppercase">Best Deals in Bangladesh</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
                  {settings?.heroTitle || "Best Products,\nBest Prices"}
                </h1>
                <p className="text-lg md:text-xl mb-8 text-white/85 max-w-lg">
                  {settings?.heroSubtitle || "Order today and get free delivery anywhere in Bangladesh!"}
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button asChild size="lg" className="rounded-full px-10 font-black shadow-xl h-13 bg-primary text-primary-foreground hover:bg-primary/90 neon-glow text-base">
                    <Link href="/products">Shop Now →</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-13 border-white/40 text-white hover:bg-white/15 bg-transparent text-base">
                    <Link href="/track-order">Track My Order</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-8 mt-10">
                  {[["150+", "Products"], ["50K+", "Happy Customers"], ["4.9★", "Rating"]].map(([val, lab]) => (
                    <div key={lab}>
                      <p className="text-2xl font-black text-primary">{val}</p>
                      <p className="text-xs text-white/55 font-medium">{lab}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── TRUST BADGES BAR ──────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-primary-foreground/20">
            {[
              { icon: Truck, label: "Free Delivery", sub: "On orders BDT 500+" },
              { icon: RefreshCw, label: "Easy Returns", sub: "7-day hassle-free" },
              { icon: Shield, label: "100% Genuine", sub: "Verified products" },
              { icon: HeadphonesIcon, label: "24/7 Support", sub: "Always here for you" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-3.5 px-4 md:px-6 hover:bg-primary-foreground/5 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-primary-foreground/90" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black truncate">{item.label}</p>
                  <p className="text-[10px] text-primary-foreground/65 truncate">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND MARQUEE ─────────────────────────────────────────────────── */}
      <BrandMarquee />

      {/* ── CATEGORY GRID ─────────────────────────────────────────────────── */}
      {categories && categories.length > 0 && (
        <section className="py-8 container mx-auto px-4">
          <SectionHeader title="Shop by Category" subtitle="Discover what you need" href="/products" accent />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {/* All products card */}
            <Link href="/products">
              <div className="flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer text-center group transition-all duration-200 hover:scale-105 cat-card-glow"
                style={{ background: "linear-gradient(135deg,hsl(218 62% 18%),hsl(192 80% 28%))" }}>
                <span className="text-3xl md:text-4xl drop-shadow-sm">🛒</span>
                <span className="text-[10px] md:text-xs font-black text-white/90 leading-tight">All</span>
              </div>
            </Link>
            {categories.map((cat) => {
              const style = getCatStyle(cat.name);
              return (
                <Link key={cat.id} href={`/products?category=${cat.id}`}>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer text-center group transition-all duration-200 hover:scale-105 cat-card-glow"
                    style={{ background: style.bg }}>
                    <span className="text-3xl md:text-4xl drop-shadow-sm">{getCatStyle(cat.name).emoji}</span>
                    <span className="text-[10px] md:text-xs font-black leading-tight line-clamp-2"
                      style={{ color: style.accent }}>
                      {cat.name}
                    </span>
                    {cat.productCount > 0 && (
                      <span className="text-[9px] font-bold opacity-60" style={{ color: style.accent }}>
                        {cat.productCount} items
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── FLASH SALE TIMER ──────────────────────────────────────────────── */}
      <section className="mx-4 md:container md:mx-auto md:px-4 mb-2">
        <div className="flash-sale-bg rounded-2xl p-5 md:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 pulse-badge border border-white/20">
              <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-white font-black text-xl md:text-2xl">Flash Sale</span>
                <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase tracking-wide">🔴 Live Now</span>
              </div>
              <p className="text-white/80 text-sm">Grab the deals before time runs out!</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Timer className="w-5 h-5 text-white/50 flex-shrink-0" />
            <div className="flex items-center gap-1.5">
              <CountdownBox value={hours} label="HRS" />
              <span className="text-white/50 font-black text-2xl mb-5">:</span>
              <CountdownBox value={minutes} label="MIN" />
              <span className="text-white/50 font-black text-2xl mb-5">:</span>
              <CountdownBox value={seconds} label="SEC" />
            </div>
            <Button asChild size="sm" className="hidden md:flex rounded-full ml-2 bg-white/20 border border-white/30 text-white hover:bg-white/35 font-bold backdrop-blur">
              <Link href="/products?featured=true">Shop Flash Deals →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── FEATURED / FLASH DEALS ────────────────────────────────────────── */}
      {(loadingFeatured || featuredProducts.length > 0) && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <SectionHeader
              icon={<Flame className="w-5 h-5 text-primary fill-primary" />}
              title="Featured Deals"
              subtitle="Handpicked bestsellers at the best prices"
              href="/products?featured=true"
              accent
            />
            {loadingFeatured ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── PROMO BANNERS ─────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-2xl p-7 text-white relative overflow-hidden shadow-xl group cursor-pointer hover:shadow-2xl transition-all duration-300"
            style={{ background: "linear-gradient(135deg, hsl(218 60% 14%) 0%, hsl(192 80% 25%) 100%)" }}>
            <div className="absolute right-0 top-0 w-56 h-56 bg-primary/10 rounded-full -translate-y-1/3 translate-x-1/4 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute bottom-0 right-20 w-36 h-36 bg-white/5 rounded-full translate-y-1/2" />
            <div className="relative z-10">
              <Percent className="w-10 h-10 mb-3 text-primary" />
              <h3 className="text-2xl font-black leading-tight mb-1.5">Free Delivery<br />on Orders BDT 500+!</h3>
              <p className="text-white/70 text-sm mb-5">Pay via bKash, Nagad, Rocket or Cash on Delivery. No hidden charges ever.</p>
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-black rounded-full neon-glow">
                <Link href="/products">Shop Now →</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl p-7 text-white relative overflow-hidden shadow-xl group cursor-pointer hover:shadow-2xl transition-all duration-300"
            style={{ background: "linear-gradient(135deg, #4c1d95, #7c3aed, #5b21b6)" }}>
            <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/4 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10">
              <span className="text-4xl mb-3 block">👗</span>
              <h3 className="text-xl font-black leading-tight mb-1.5">New Fashion<br />Collection!</h3>
              <p className="text-white/65 text-xs mb-5">Special Eid & Festival exclusive picks — stylish & affordable.</p>
              <Button asChild size="sm" className="bg-white text-violet-700 hover:bg-white/90 font-black rounded-full">
                <Link href="/products?category=clothing">Explore Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────────────── */}
      <StatsStrip />

      {/* ── ELECTRONICS SECTION ───────────────────────────────────────────── */}
      {electronicsProducts.length > 0 && (
        <section className="py-8 bg-muted/20">
          <div className="container mx-auto px-4">
            <SectionHeader
              icon={<span className="text-xl">📱</span>}
              title="Electronics & Gadgets"
              subtitle="Top tech deals handpicked for you"
              href="/products?category=electronics"
              accent
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {electronicsProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── DEAL OF THE DAY ───────────────────────────────────────────────── */}
      {featuredProducts[0] && (
        <section className="container mx-auto px-4 py-6">
          <div className="rounded-3xl overflow-hidden border border-primary/20 shadow-xl relative"
            style={{ background: "linear-gradient(135deg, hsl(218 48% 6%), hsl(218 40% 10%), hsl(192 50% 15%))" }}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/8 rounded-full translate-x-1/3 -translate-y-1/3" />
              <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-primary/5 rounded-full translate-y-1/2" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row">
              <div className="md:w-80 flex items-center justify-center p-8 md:p-12">
                {featuredProducts[0].images?.[0] ? (
                  <img src={featuredProducts[0].images[0]} alt={featuredProducts[0].name}
                    className="w-full max-w-[200px] rounded-2xl object-cover shadow-2xl border border-white/10" />
                ) : (
                  <div className="text-8xl drop-shadow-xl">📦</div>
                )}
              </div>
              <div className="flex-1 p-6 md:p-10 flex flex-col justify-center text-white">
                <div className="inline-flex items-center gap-2 bg-primary/25 border border-primary/30 rounded-full px-3 py-1 mb-4 w-fit">
                  <Flame className="w-3.5 h-3.5 text-primary fill-primary" />
                  <span className="text-xs font-black text-primary uppercase tracking-wider">Deal of the Day</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-2 leading-snug">{featuredProducts[0].name}</h3>
                <p className="text-white/60 text-sm mb-5 line-clamp-2 max-w-lg">{featuredProducts[0].description}</p>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl md:text-4xl font-black text-primary">BDT {featuredProducts[0].price.toLocaleString()}</span>
                  {featuredProducts[0].comparePrice && featuredProducts[0].comparePrice > featuredProducts[0].price && (
                    <>
                      <span className="text-lg text-white/40 line-through">BDT {featuredProducts[0].comparePrice.toLocaleString()}</span>
                      <span className="bg-red-500 text-white text-sm font-black px-2.5 py-0.5 rounded-lg">
                        -{Math.round(((featuredProducts[0].comparePrice - featuredProducts[0].price) / featuredProducts[0].comparePrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                {featuredProducts[0].comparePrice && featuredProducts[0].comparePrice > featuredProducts[0].price && (
                  <p className="text-green-400 text-sm font-bold mb-5">
                    You save BDT {(featuredProducts[0].comparePrice - featuredProducts[0].price).toLocaleString()}!
                  </p>
                )}
                <div className="flex gap-3 flex-wrap">
                  <Button asChild className="rounded-full font-black px-8 h-12 neon-glow text-base">
                    <Link href={`/products/${featuredProducts[0].id}`}>Buy Now</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10 bg-transparent">
                    <Link href="/products?featured=true">See All Deals</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CLOTHING SECTION ──────────────────────────────────────────────── */}
      {clothingProducts.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <SectionHeader
              icon={<span className="text-xl">👗</span>}
              title="Fashion & Clothing"
              subtitle="Latest styles for every occasion"
              href="/products?category=clothing"
              accent
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {clothingProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <TestimonialStrip />

      {/* ── BEAUTY SECTION ────────────────────────────────────────────────── */}
      {beautyProducts.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <SectionHeader
              icon={<span className="text-xl">💄</span>}
              title="Beauty & Skincare"
              subtitle="Glow up with the best products"
              href="/products?category=beauty"
              accent
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {beautyProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── NEW ARRIVALS ──────────────────────────────────────────────────── */}
      <section className="py-8 bg-muted/20">
        <div className="container mx-auto px-4">
          <SectionHeader
            icon={<TrendingUp className="w-5 h-5 text-primary" />}
            title="New Arrivals"
            subtitle="Fresh products just added to the store"
            href="/products"
            accent
          />
          {loadingLatest ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : latestProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {latestProducts.slice(0, 12).map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {latestProducts.length > 12 && (
                <div className="text-center mt-8">
                  <Button asChild variant="outline" className="rounded-full px-10 font-bold h-11 border-2 hover:border-primary hover:text-primary transition-colors">
                    <Link href="/products">See All Products →</Link>
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 border rounded-2xl bg-muted/20">
              <p className="text-muted-foreground">No products yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── PAYMENT METHODS STRIP ─────────────────────────────────────────── */}
      <PaymentMethodsStrip />

      {/* ── NEWSLETTER CTA ────────────────────────────────────────────────── */}
      <NewsletterCTA />

      {/* ── RECENTLY VIEWED ───────────────────────────────────────────────── */}
      {recentIds.length > 0 && (
        <section className="container mx-auto px-4 py-6">
          <RecentlyViewedRow recentIds={recentIds} />
        </section>
      )}

      {/* ── WHY SHOP — DETAILED ───────────────────────────────────────────── */}
      <section className="py-10 container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black">Why Shoppers Love AcholGatha</h2>
          <div className="h-1 w-16 bg-primary rounded-full mx-auto mt-2 mb-1.5" />
          <p className="text-muted-foreground text-sm">Our commitment to every customer</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: "⚡", title: "Lightning Fast Delivery", desc: "Same-day delivery in Dhaka. 24-48hrs anywhere in Bangladesh.", color: "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/10 dark:border-yellow-900/20" },
            { icon: "🛡️", title: "Secure Shopping", desc: "Your personal info is always safe. SSL encrypted, trusted platform.", color: "border-blue-200 bg-blue-50 dark:bg-blue-950/10 dark:border-blue-900/20" },
            { icon: "💳", title: "Flexible Payments", desc: "bKash, Rocket, Nagad or Cash on Delivery. 100% transparent.", color: "border-green-200 bg-green-50 dark:bg-green-950/10 dark:border-green-900/20" },
            { icon: "🔄", title: "Hassle-free Returns", desc: "Not satisfied? Return within 7 days, easy and stress-free.", color: "border-purple-200 bg-purple-50 dark:bg-purple-950/10 dark:border-purple-900/20" },
            { icon: "💯", title: "100% Authentic", desc: "Every product verified for authenticity. What you see is what you get.", color: "border-rose-200 bg-rose-50 dark:bg-rose-950/10 dark:border-rose-900/20" },
            { icon: "📞", title: "24/7 Live Support", desc: "WhatsApp, Facebook, or phone — we're always here to help.", color: "border-orange-200 bg-orange-50 dark:bg-orange-950/10 dark:border-orange-900/20" },
          ].map((item) => (
            <div key={item.title} className={`flex gap-4 p-5 rounded-2xl border-2 hover:shadow-md hover:-translate-y-0.5 transition-all ${item.color}`}>
              <span className="text-3xl flex-shrink-0">{item.icon}</span>
              <div>
                <h3 className="font-black mb-1 text-sm">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </StoreLayout>
  );
}

function ProductSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
