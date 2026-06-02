import { StoreLayout } from "@/components/layout/store-layout";
import {
  useGetSettings, useListBanners, useListProducts, useListCategories,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product-card";
import { useEffect, useState } from "react";
import {
  ChevronRight, ChevronLeft, ArrowRight, TrendingUp, Truck,
  RefreshCw, Shield, HeadphonesIcon, Flame, Timer, Gift, Star, Zap,
  Tag, CheckCircle2, Percent,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

const CATEGORY_ICONS: Record<string, string> = {
  default: "📦", electronics: "📱", fashion: "👗", clothing: "👔",
  food: "🍎", beauty: "💄", home: "🏠", "home-appliances": "🏠",
  furniture: "🛋️", sports: "⚽", toys: "🧸", books: "📚",
  garden: "🌿", health: "💊", automotive: "🚗", jewelry: "💍",
  bags: "👜", shoes: "👟", watches: "⌚", kitchen: "🍳",
  stationery: "✏️", kids: "🧒", grocery: "🛒",
};
function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return CATEGORY_ICONS.default;
}

function useFlashSaleCountdown() {
  const getEndOfDay = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return Math.max(0, end.getTime() - now.getTime());
  };
  const [timeLeft, setTimeLeft] = useState(getEndOfDay());
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getEndOfDay()), 1000);
    return () => clearInterval(timer);
  }, []);
  return {
    hours: Math.floor(timeLeft / 3600000),
    minutes: Math.floor((timeLeft % 3600000) / 60000),
    seconds: Math.floor((timeLeft % 60000) / 1000),
  };
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur rounded-lg w-12 h-12 flex items-center justify-center text-white font-black text-xl border border-white/30 tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[10px] text-white/80 mt-1 font-medium uppercase tracking-wide">{label}</span>
    </div>
  );
}

function SectionHeader({
  icon, title, subtitle, href, hrefLabel = "View all",
}: {
  icon?: React.ReactNode; title: string; subtitle?: string; href?: string; hrefLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        {icon && (
          <div className="flex items-center gap-2 mb-0.5">
            {icon}
            <h2 className="text-xl md:text-2xl font-black tracking-tight">{title}</h2>
          </div>
        )}
        {!icon && <h2 className="text-xl md:text-2xl font-black tracking-tight mb-0.5">{title}</h2>}
        {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm text-primary font-bold hover:underline whitespace-nowrap">
          {hrefLabel} <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

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
    const timer = setInterval(() => emblaApi.scrollNext(), 4200);
    return () => clearInterval(timer);
  }, [emblaApi]);

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
                  <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative h-[48vw] min-h-[260px] max-h-[620px]">
                    <img src={banner.imageUrl} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/35 to-transparent flex items-center px-6 md:px-20">
                      <div className="max-w-xl text-white">
                        <div className="inline-flex items-center gap-2 bg-primary/30 backdrop-blur-sm border border-primary/40 rounded-full px-4 py-1.5 mb-4">
                          <Zap className="w-4 h-4 text-primary fill-primary" />
                          <span className="text-xs font-black text-primary tracking-widest uppercase">Hot Deals</span>
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all shadow-lg backdrop-blur">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => emblaApi?.scrollNext()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all shadow-lg backdrop-blur">
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
          <div className="h-[50vh] md:h-[68vh] flex items-center hero-gradient relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-primary/10" />
              <div className="absolute bottom-0 right-40 w-72 h-72 rounded-full bg-white/5" />
              <div className="absolute top-1/2 left-1/3 w-2 h-2 rounded-full bg-primary animate-ping" style={{ animationDelay: "0.5s" }} />
              <div className="absolute top-1/4 left-2/3 w-1.5 h-1.5 rounded-full bg-primary/60 animate-ping" style={{ animationDelay: "1s" }} />
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
                <p className="text-lg md:text-xl mb-8 text-white/85 max-w-md">
                  {settings?.heroSubtitle || "Order today and get free delivery anywhere in Bangladesh!"}
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button asChild size="lg" className="rounded-full px-10 font-black shadow-xl h-12 bg-primary text-primary-foreground hover:bg-primary/90 neon-glow">
                    <Link href="/products">Shop Now →</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12 border-white/40 text-white hover:bg-white/15 bg-transparent">
                    <Link href="/track-order">Track My Order</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-6 mt-8">
                  {[["150+", "Products"], ["50K+", "Happy Customers"], ["4.9★", "Rating"]].map(([val, lab]) => (
                    <div key={lab} className="text-center">
                      <p className="text-2xl font-black text-primary">{val}</p>
                      <p className="text-xs text-white/60">{lab}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── TRUST BADGES BAR ──────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-primary-foreground/20">
            {[
              { icon: Truck, label: "Free Delivery", sub: "On orders BDT 500+" },
              { icon: RefreshCw, label: "Easy Returns", sub: "7-day policy" },
              { icon: Shield, label: "100% Genuine", sub: "Verified products" },
              { icon: HeadphonesIcon, label: "24/7 Support", sub: "Always here for you" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-3 px-4 md:px-6">
                <item.icon className="w-5 h-5 text-primary-foreground/80 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-black truncate">{item.label}</p>
                  <p className="text-[11px] text-primary-foreground/70 truncate">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY GRID ─────────────────────────────────────────────────── */}
      {categories && categories.length > 0 && (
        <section className="py-8 container mx-auto px-4">
          <SectionHeader title="Shop by Category" subtitle="Find exactly what you need" href="/products" />
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2">
            <Link href="/products">
              <div className="flex flex-col items-center gap-2 p-2 md:p-3 rounded-2xl border-2 border-primary/30 bg-primary/8 hover:border-primary hover:bg-primary/15 hover:shadow-sm transition-all group cursor-pointer text-center">
                <span className="text-2xl md:text-3xl">🛒</span>
                <span className="text-[10px] md:text-xs font-black text-primary transition-colors leading-tight">All</span>
              </div>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.id}`}>
                <div className="flex flex-col items-center gap-2 p-2 md:p-3 rounded-2xl border-2 border-transparent bg-card hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm transition-all group cursor-pointer text-center">
                  <span className="text-2xl md:text-3xl">{getCategoryIcon(cat.name)}</span>
                  <span className="text-[10px] md:text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── FLASH SALE TIMER ──────────────────────────────────────────────── */}
      <section className="mx-4 md:container md:mx-auto md:px-4 mb-2">
        <div className="flash-sale-bg rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 pulse-badge">
              <Zap className="w-7 h-7 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-white font-black text-xl md:text-2xl">Flash Sale</span>
                <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase tracking-wide">Live Now</span>
              </div>
              <p className="text-white/80 text-sm">Grab the deals before time runs out!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-white/60" />
            <div className="flex items-center gap-1.5">
              <CountdownBox value={hours} label="Hours" />
              <span className="text-white/60 font-black text-xl mb-4">:</span>
              <CountdownBox value={minutes} label="Mins" />
              <span className="text-white/60 font-black text-xl mb-4">:</span>
              <CountdownBox value={seconds} label="Secs" />
            </div>
            <Button asChild size="sm" className="hidden md:flex rounded-full ml-4 bg-white/20 border border-white/30 text-white hover:bg-white/30 font-bold">
              <Link href="/products?featured=true">Shop Flash Deals</Link>
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
              subtitle="Handpicked bestsellers at best prices"
              href="/products?featured=true"
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

      {/* ── PROMO CARDS (2-column) ────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg"
            style={{ background: "linear-gradient(135deg, hsl(218 60% 14%) 0%, hsl(192 80% 28%) 100%)" }}>
            <div className="absolute right-0 top-0 w-48 h-48 bg-primary/10 rounded-full -translate-y-1/3 translate-x-1/4" />
            <div className="absolute bottom-0 right-16 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
            <Percent className="w-10 h-10 mb-3 text-primary" />
            <h3 className="text-2xl font-black leading-tight mb-1">Free Delivery<br />on Orders BDT 500+!</h3>
            <p className="text-white/70 text-sm mb-4">Pay via bKash, Rocket or Cash on Delivery. No hidden charges.</p>
            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-black rounded-full neon-glow">
              <Link href="/products">Shop Now →</Link>
            </Button>
          </div>
          <div className="rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-600 p-6 text-white relative overflow-hidden shadow-lg">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/4" />
            <Star className="w-10 h-10 mb-3 fill-yellow-300 text-yellow-300" />
            <h3 className="text-xl font-black leading-tight mb-1">New Fashion<br />Collection!</h3>
            <p className="text-white/70 text-xs mb-4">Special Eid & Festival picks</p>
            <Button asChild size="sm" className="bg-white text-violet-700 hover:bg-white/90 font-black rounded-full">
              <Link href="/products?category=clothing">Explore</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── ELECTRONICS SECTION ───────────────────────────────────────────── */}
      {electronicsProducts.length > 0 && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <SectionHeader
              icon={<span className="text-xl">📱</span>}
              title="Electronics"
              subtitle="Top gadgets & tech deals"
              href="/products?category=electronics"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {electronicsProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── DEAL OF THE DAY (Product spotlight) ──────────────────────────── */}
      {featuredProducts[0] && (
        <section className="container mx-auto px-4 py-6">
          <div className="rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-r from-background to-primary/5 flex flex-col md:flex-row shadow-lg">
            <div className="md:w-72 bg-muted/30 flex items-center justify-center p-8 md:p-12">
              {featuredProducts[0].images?.[0] ? (
                <img src={featuredProducts[0].images[0]} alt={featuredProducts[0].name}
                  className="w-full max-w-[180px] rounded-2xl object-cover shadow-xl" />
              ) : (
                <div className="text-7xl">📦</div>
              )}
            </div>
            <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1 mb-3 w-fit">
                <Flame className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-xs font-black text-primary uppercase tracking-wider">Deal of the Day</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black mb-2 leading-snug">{featuredProducts[0].name}</h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2 max-w-lg">{featuredProducts[0].description}</p>
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-3xl font-black text-primary">BDT {featuredProducts[0].price.toLocaleString()}</span>
                {featuredProducts[0].comparePrice && featuredProducts[0].comparePrice > featuredProducts[0].price && (
                  <span className="text-lg text-muted-foreground line-through">
                    BDT {featuredProducts[0].comparePrice.toLocaleString()}
                  </span>
                )}
                {featuredProducts[0].comparePrice && featuredProducts[0].comparePrice > featuredProducts[0].price && (
                  <span className="bg-red-500 text-white text-sm font-black px-2 py-0.5 rounded-lg">
                    -{Math.round(((featuredProducts[0].comparePrice - featuredProducts[0].price) / featuredProducts[0].comparePrice) * 100)}%
                  </span>
                )}
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button asChild className="rounded-full font-black px-8 h-11 neon-glow">
                  <Link href={`/products/${featuredProducts[0].id}`}>Buy Now</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-8 h-11">
                  <Link href="/products?featured=true">See All Deals</Link>
                </Button>
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
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {clothingProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── WHY CHOOSE US ─────────────────────────────────────────────────── */}
      <section className="py-10 bg-muted/20 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: "⚡", title: "Fast Delivery", desc: "Same-day Dhaka, 24-48h nationwide" },
              { icon: "💯", title: "100% Genuine", desc: "Verified & quality-checked products" },
              { icon: "💳", title: "bKash / Rocket / COD", desc: "Flexible payment options" },
              { icon: "🔄", title: "Easy 7-Day Returns", desc: "Hassle-free, no questions asked" },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 items-start p-4 rounded-2xl bg-card border hover:border-primary/40 hover:shadow-sm transition-all group">
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-black text-sm group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEAUTY SECTION ────────────────────────────────────────────────── */}
      {beautyProducts.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <SectionHeader
              icon={<span className="text-xl">💄</span>}
              title="Beauty & Skincare"
              subtitle="Glow up with the best products"
              href="/products?category=beauty"
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
            subtitle="Fresh products just added"
            href="/products"
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
                  <Button asChild variant="outline" className="rounded-full px-10 font-bold">
                    <Link href="/products">See All Products →</Link>
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 border rounded-2xl bg-muted/20">
              <p className="text-muted-foreground">No products yet.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/admin/products">Add Products</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── APP PROMO CTA ────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-8">
        <div className="rounded-3xl announcement-bg p-8 md:p-12 text-white text-center relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -left-10 w-60 h-60 bg-primary/10 rounded-full" />
            <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-primary/8 rounded-full" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 mb-4">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-black text-primary uppercase tracking-widest">AcholGatha Promise</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-3">Bangladesh's Most Trusted<br />Online Shopping Destination</h2>
            <p className="text-white/70 text-lg mb-6 max-w-xl mx-auto">
              50,000+ satisfied customers. 150+ products. Real SMS notifications. 100% genuine goods.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg" className="rounded-full px-10 font-black h-12 bg-primary text-primary-foreground hover:bg-primary/90 neon-glow">
                <Link href="/products">Start Shopping →</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12 border-white/30 text-white hover:bg-white/10 bg-transparent">
                <Link href="/track-order">Track My Order</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY SHOP — DETAILED ───────────────────────────────────────────── */}
      <section className="py-10 container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black">Why Shoppers Love AcholGatha</h2>
          <p className="text-muted-foreground text-sm mt-1">Our commitment to your satisfaction</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: "⚡", title: "Lightning Fast Delivery", desc: "Same-day delivery in Dhaka. 24-48hrs anywhere in Bangladesh.", color: "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/10 dark:border-yellow-900/20" },
            { icon: "🛡️", title: "Secure Shopping", desc: "Your personal info is always safe. SSL encrypted, trusted platform.", color: "border-blue-200 bg-blue-50 dark:bg-blue-950/10 dark:border-blue-900/20" },
            { icon: "💳", title: "Flexible Payments", desc: "bKash, Rocket, Nagad or Cash on Delivery. 100% transparent.", color: "border-green-200 bg-green-50 dark:bg-green-950/10 dark:border-green-900/20" },
            { icon: "🔄", title: "Hassle-free Returns", desc: "Not satisfied? Return within 7 days, easy and stress-free.", color: "border-purple-200 bg-purple-50 dark:bg-purple-950/10 dark:border-purple-900/20" },
            { icon: "💯", title: "100% Authentic", desc: "Every product verified for authenticity. What you see is what you get.", color: "border-rose-200 bg-rose-50 dark:bg-rose-950/10 dark:border-rose-900/20" },
            { icon: "📞", title: "24/7 Live Support", desc: "WhatsApp, Facebook, or phone — we're always here to help you.", color: "border-orange-200 bg-orange-50 dark:bg-orange-950/10 dark:border-orange-900/20" },
          ].map((item) => (
            <div key={item.title} className={`flex gap-4 p-5 rounded-2xl border-2 hover:shadow-md transition-all ${item.color}`}>
              <span className="text-3xl flex-shrink-0">{item.icon}</span>
              <div>
                <h3 className="font-black mb-1">{item.title}</h3>
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
