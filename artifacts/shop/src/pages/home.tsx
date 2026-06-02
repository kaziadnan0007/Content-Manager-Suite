import { StoreLayout } from "@/components/layout/store-layout";
import { useGetSettings, useListBanners, useListProducts, useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product-card";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  TrendingUp,
  Truck,
  RefreshCw,
  Shield,
  HeadphonesIcon,
  Flame,
  Timer,
  Gift,
  Star,
  Zap,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

const CATEGORY_ICONS: Record<string, string> = {
  default: "📦",
  electronics: "📱",
  fashion: "👗",
  clothing: "👔",
  food: "🍎",
  beauty: "💄",
  home: "🏠",
  "home-appliances": "🏠",
  furniture: "🛋️",
  sports: "⚽",
  toys: "🧸",
  books: "📚",
  garden: "🌿",
  health: "💊",
  automotive: "🚗",
  jewelry: "💍",
  bags: "👜",
  shoes: "👟",
  watches: "⌚",
  kitchen: "🍳",
  stationery: "✏️",
  kids: "🧒",
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
    return end.getTime() - now.getTime();
  };

  const [timeLeft, setTimeLeft] = useState(getEndOfDay());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getEndOfDay());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur rounded-lg w-12 h-12 flex items-center justify-center text-white font-black text-xl border border-white/30">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[10px] text-white/80 mt-1 font-medium uppercase tracking-wide">{label}</span>
    </div>
  );
}

export function Home() {
  const { data: settings } = useGetSettings();
  const { data: banners } = useListBanners();
  const { data: categories } = useListCategories();
  const { data: featuredData, isLoading: loadingFeatured } = useListProducts({ featured: true, limit: 8 });
  const { data: latestData, isLoading: loadingLatest } = useListProducts({ limit: 12 });

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentSlide, setCurrentSlide] = useState(0);
  const { hours, minutes, seconds } = useFlashSaleCountdown();

  const activeBanners = banners?.filter((b) => b.active).sort((a, b) => a.sortOrder - b.sortOrder) || [];

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setCurrentSlide(emblaApi.selectedScrollSnap()));
    const timer = setInterval(() => emblaApi.scrollNext(), 4500);
    return () => clearInterval(timer);
  }, [emblaApi]);

  const featuredProducts = featuredData?.products || [];
  const latestProducts = latestData?.products || [];

  return (
    <StoreLayout>
      {/* ── Hero Carousel ──────────────────────────── */}
      <section className="relative overflow-hidden">
        {activeBanners.length > 0 ? (
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {activeBanners.map((banner) => (
                  <div
                    key={banner.id}
                    className="flex-[0_0_100%] min-w-0 relative h-[50vh] md:h-[70vh]"
                  >
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center px-8 md:px-20">
                      <div className="max-w-lg text-white">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 mb-4">
                          <Flame className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                          <span className="text-xs font-bold text-yellow-200 tracking-wide">HOT DEALS</span>
                        </div>
                        <h1 className="text-3xl md:text-6xl font-black mb-3 leading-tight drop-shadow-md">
                          {banner.title}
                        </h1>
                        {banner.subtitle && (
                          <p className="text-base md:text-xl mb-6 opacity-90 drop-shadow-sm">
                            {banner.subtitle}
                          </p>
                        )}
                        {banner.linkUrl && (
                          <Button
                            asChild
                            size="lg"
                            className="rounded-full font-bold px-8 shadow-xl text-base h-12 bg-white text-primary hover:bg-white/90"
                          >
                            <Link href={banner.linkUrl}>Shop Now →</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {activeBanners.length > 1 && (
              <>
                <button
                  onClick={() => emblaApi?.scrollPrev()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => emblaApi?.scrollNext()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            {activeBanners.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                {activeBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => emblaApi?.scrollTo(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentSlide ? "bg-white w-7" : "bg-white/50 w-2"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-[50vh] md:h-[70vh] flex items-center hero-gradient relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 right-32 w-64 h-64 bg-white rounded-full translate-y-1/3" />
            </div>
            <div className="container mx-auto px-4 md:px-16 relative z-10">
              <div className="max-w-xl text-white">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 mb-5">
                  <Flame className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                  <span className="text-xs font-bold text-yellow-200 tracking-wide">Best Deals in Bangladesh</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
                  {settings?.heroTitle || "Best Products, Best Prices"}
                </h1>
                <p className="text-lg md:text-xl mb-8 text-white/90">
                  {settings?.heroSubtitle || "Order today and get free delivery!"}
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button asChild size="lg" className="rounded-full px-8 font-bold shadow-xl h-12 bg-white text-primary hover:bg-white/90">
                    <Link href="/products">Shop Now</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12 border-white/50 text-white hover:bg-white/20 bg-transparent">
                    <Link href="/track-order">Track Order</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Trust Badges ───────────────────────────── */}
      <section className="bg-primary text-primary-foreground border-y border-primary/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
            {[
              { icon: Truck, label: "Free Delivery", sub: "On orders ৳500+" },
              { icon: RefreshCw, label: "Easy Returns", sub: "7-day policy" },
              { icon: Shield, label: "100% Genuine", sub: "Verified products" },
              { icon: HeadphonesIcon, label: "24/7 Support", sub: "Always here for you" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-3 px-4 md:px-6">
                <item.icon className="w-5 h-5 text-white/80 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{item.label}</p>
                  <p className="text-[11px] text-white/70 truncate">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Showcase ──────────────────────── */}
      {categories && categories.length > 0 && (
        <section className="py-10 container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Shop by Category</h2>
              <p className="text-muted-foreground text-sm mt-0.5">Find exactly what you need</p>
            </div>
            <Link href="/products" className="flex items-center gap-1 text-sm text-primary font-bold hover:underline">
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2 md:gap-3">
            <Link href="/products">
              <div className="flex flex-col items-center gap-2 p-2 md:p-3 rounded-2xl border-2 border-transparent bg-primary/5 hover:border-primary hover:bg-primary/10 hover:shadow-md transition-all group cursor-pointer text-center">
                <span className="text-2xl md:text-3xl">🛒</span>
                <span className="text-[10px] md:text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors leading-tight">All</span>
              </div>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.id}`}>
                <div className="flex flex-col items-center gap-2 p-2 md:p-3 rounded-2xl border-2 border-transparent bg-card hover:border-primary hover:shadow-md transition-all group cursor-pointer text-center">
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

      {/* ── Flash Sale Banner ───────────────────────── */}
      <section className="mx-4 md:container md:mx-auto md:px-4 mb-2">
        <div className="flash-sale-bg rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-7 h-7 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-xl md:text-2xl">Flash Sale</span>
                <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase tracking-wide">Live</span>
              </div>
              <p className="text-white/80 text-sm">Grab the deals before time runs out!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-white/70" />
            <div className="flex items-center gap-1.5">
              <CountdownBox value={hours} label="Hours" />
              <span className="text-white/70 font-black text-xl mb-4">:</span>
              <CountdownBox value={minutes} label="Mins" />
              <span className="text-white/70 font-black text-xl mb-4">:</span>
              <CountdownBox value={seconds} label="Secs" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured / Flash Deals ─────────────────── */}
      {(loadingFeatured || featuredProducts.length > 0) && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-5 h-5 text-primary fill-primary" />
                  <h2 className="text-2xl font-black tracking-tight">Featured Deals</h2>
                </div>
                <p className="text-muted-foreground text-sm">Handpicked best sellers</p>
              </div>
              <Link href="/products?featured=true" className="flex items-center gap-1 text-sm text-primary font-bold hover:underline">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loadingFeatured ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Promo Banners ──────────────────────────── */}
      <section className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 p-6 text-white relative overflow-hidden shadow-lg">
            <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <Gift className="w-10 h-10 mb-3 opacity-90" />
            <h3 className="text-xl font-black leading-tight mb-1">Free Delivery<br />on Orders ৳500+!</h3>
            <p className="text-white/80 text-xs mb-3">Pay via bKash, Rocket or Cash on Delivery</p>
            <Button asChild size="sm" className="bg-white text-orange-600 hover:bg-white/90 font-bold rounded-full">
              <Link href="/products">Shop Now</Link>
            </Button>
          </div>
          <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 p-6 text-white relative overflow-hidden shadow-lg">
            <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <Star className="w-10 h-10 mb-3 opacity-90 fill-yellow-300 text-yellow-300" />
            <h3 className="text-xl font-black leading-tight mb-1">New Fashion<br />Collection is Here!</h3>
            <p className="text-white/80 text-xs mb-3">Special designer pieces for Eid & festivals</p>
            <Button asChild size="sm" className="bg-white text-violet-600 hover:bg-white/90 font-bold rounded-full">
              <Link href="/products?category=clothing">View Collection</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Latest Products ────────────────────────── */}
      <section className="py-8 container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-black tracking-tight">New Arrivals</h2>
            </div>
            <p className="text-muted-foreground text-sm">Fresh items just added</p>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-sm text-primary font-bold hover:underline">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingLatest ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : latestProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-2xl bg-muted/20">
            <p className="text-muted-foreground">No products found.</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/admin/products">Add Products in Admin</Link>
            </Button>
          </div>
        )}
      </section>

      {/* ── Why Shop With AcholGatha ─────────────── */}
      <section className="py-12 bg-gradient-to-b from-muted/20 to-background border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black">Why Shop With AcholGatha?</h2>
            <p className="text-muted-foreground text-sm mt-1">Our commitment is your satisfaction</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              {
                icon: "⚡",
                title: "Lightning Fast Delivery",
                desc: "Same-day delivery available in Dhaka. Get your order within 24-48 hours across Bangladesh.",
                color: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900/30",
              },
              {
                icon: "💯",
                title: "100% Authentic Products",
                desc: "Every product is carefully verified. Shop with confidence knowing you get exactly what you see.",
                color: "bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30",
              },
              {
                icon: "💳",
                title: "Flexible Payments",
                desc: "Pay with bKash, Rocket, or Cash on Delivery. No hidden charges, completely transparent.",
                color: "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30",
              },
              {
                icon: "🔄",
                title: "Hassle-free Returns",
                desc: "Not satisfied? Return within 7 days. We make returns simple and stress-free.",
                color: "bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30",
              },
              {
                icon: "🛡️",
                title: "Secure Shopping",
                desc: "Your personal information is safe with us. Shop securely every time.",
                color: "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30",
              },
              {
                icon: "📞",
                title: "24/7 Customer Support",
                desc: "Our friendly support team is always ready to help you via WhatsApp, Facebook, or phone.",
                color: "bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`flex gap-4 p-5 rounded-2xl border-2 hover:shadow-md transition-all ${item.color}`}
              >
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-black mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
