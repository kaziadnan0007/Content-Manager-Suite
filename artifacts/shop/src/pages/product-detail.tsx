import { StoreLayout } from "@/components/layout/store-layout";
import { useGetProduct, useListProducts } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart-context";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product-card";
import { RecentlyViewedRow } from "@/components/recently-viewed-row";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { useAuthGate } from "@/components/auth-gate";
import { useState, useEffect } from "react";
import {
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  ChevronRight,
  Star,
  Truck,
  RefreshCw,
  Shield,
  Share2,
  CheckCircle2,
  Package,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function fakeRating(id: number) {
  return 3.5 + (id % 5) * 0.3;
}
function fakeReviews(id: number) {
  return 12 + (id * 17) % 240;
}

const FAKE_REVIEWERS = [
  { name: "Md. Rafiqul Islam", city: "Dhaka", avatar: "RI", color: "bg-blue-500" },
  { name: "Fatema Akter", city: "Chattogram", avatar: "FA", color: "bg-pink-500" },
  { name: "Karim Hossain", city: "Sylhet", avatar: "KH", color: "bg-green-500" },
  { name: "Nasrin Sultana", city: "Rajshahi", avatar: "NS", color: "bg-purple-500" },
  { name: "Tanvir Ahmed", city: "Khulna", avatar: "TA", color: "bg-orange-500" },
  { name: "Ritu Begum", city: "Barishal", avatar: "RB", color: "bg-rose-500" },
];

const REVIEW_TEXTS = [
  "Excellent product! Delivery was fast and packaging was great. Highly recommended.",
  "Good quality, matches the description. Will definitely buy again from AcholGatha.",
  "Very satisfied with the purchase. Customer service was helpful when I had a question.",
  "Product is exactly as shown. Reasonable price and quick delivery to my area.",
  "Bought as a gift and the recipient loved it! Great quality for the price.",
  "Smooth ordering process. Product arrived on time and in perfect condition.",
];

function FakeReviewsSection({ productId, rating, reviewCount }: { productId: number; rating: number; reviewCount: number }) {
  const dist = [
    { stars: 5, pct: 58 + (productId % 12) },
    { stars: 4, pct: 22 + (productId % 8) },
    { stars: 3, pct: 10 - (productId % 4) },
    { stars: 2, pct: 5 - (productId % 3) },
    { stars: 1, pct: 5 - (productId % 2) },
  ];

  const reviews = FAKE_REVIEWERS.map((r, i) => ({
    ...r,
    stars: i < 3 ? 5 : i < 5 ? 4 : 3,
    text: REVIEW_TEXTS[(productId + i) % REVIEW_TEXTS.length],
    daysAgo: [2, 5, 8, 14, 21, 30][(productId + i) % 6],
    helpful: [12, 8, 23, 6, 15, 4][(productId + i) % 6],
  })).slice(0, 4 + (productId % 3));

  return (
    <div className="mt-16">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold leading-tight">Customer Reviews</h2>
          <p className="text-xs text-muted-foreground">{reviewCount} verified purchases</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        {/* Rating summary */}
        <div className="bg-card border rounded-2xl p-6 flex flex-col items-center text-center self-start">
          <div className="text-6xl font-black text-primary mb-1">{rating.toFixed(1)}</div>
          <div className="flex items-center gap-0.5 mb-1">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-4 h-4 ${s <= Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mb-5">Based on {reviewCount} reviews</p>
          <div className="w-full space-y-2">
            {dist.map(({ stars, pct }) => (
              <div key={stars} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right font-medium">{stars}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <span className="w-6 text-muted-foreground">{Math.min(pct, 99)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Individual reviews */}
        <div className="space-y-4">
          {reviews.map((rev, i) => (
            <div key={i} className="border rounded-xl p-5 bg-card hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${rev.color} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
                    {rev.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{rev.name}</p>
                    <p className="text-xs text-muted-foreground">📍 {rev.city} · {rev.daysAgo} days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.stars ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{rev.text}</p>
              <div className="flex items-center gap-1 mt-3">
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Helpful ({rev.helpful})
                </button>
                <span className="text-muted-foreground/40 mx-1">·</span>
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  ✓ Verified Purchase
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: product, isLoading } = useGetProduct(id);
  const { data: relatedData } = useListProducts({
    categoryId: product?.categoryId || undefined,
    limit: 6,
  });
  const { addItem } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { requireAuth } = useAuthGate();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const { recentIds } = useRecentlyViewed(id);

  const [viewingNow, setViewingNow] = useState(() => 8 + (id % 23));
  useEffect(() => {
    const t = setInterval(() => {
      setViewingNow((v) => Math.max(4, v + (Math.random() > 0.5 ? 1 : -1)));
    }, 7000);
    return () => clearInterval(t);
  }, [id]);

  useEffect(() => {
    const sentinel = document.getElementById("buy-buttons-sentinel");
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [product]);

  const handleAddToCart = () => {
    requireAuth(() => {
      if (product) {
        addItem(product, quantity);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
        toast({ title: "Added to cart! 🛒", description: `${quantity}x ${product.name}` });
      }
    });
  };

  const handleBuyNow = () => {
    requireAuth(() => {
      if (product) {
        addItem(product, quantity);
        setLocation("/checkout");
      }
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied!" });
    }
  };

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            <div className="space-y-4">
              <Skeleton className="w-full aspect-square rounded-2xl" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-20 h-20 rounded-xl" />)}
              </div>
            </div>
            <div className="space-y-5">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-24 text-center">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">This product may have been removed.</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  const images = product.images?.length ? product.images : [];
  const rating = fakeRating(product.id);
  const reviewCount = fakeReviews(product.id);
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const relatedProducts = (relatedData?.products || []).filter((p) => p.id !== product.id).slice(0, 5);

  return (
    <StoreLayout>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
          {product.categoryName && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link
                href={`/products?category=${product.categoryId}`}
                className="hover:text-primary transition-colors"
              >
                {product.categoryName}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium line-clamp-1 max-w-[160px]">{product.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* ── Images ─────────────────────────── */}
          <div className="space-y-3">
            <div className="aspect-square bg-muted rounded-2xl overflow-hidden border relative group">
              {images[activeImage] ? (
                <img
                  src={images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-muted-foreground/30" />
                </div>
              )}
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="bg-white text-black font-bold px-4 py-2 rounded-full text-sm">
                    Out of Stock
                  </span>
                </div>
              )}
              {discount && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-2.5 py-1 rounded-lg shadow">
                  -{discount}%
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => {
                  const ANGLE_LABELS = ["Front View", "Side Angle", "Detail Close-up"];
                  const label = ANGLE_LABELS[idx] ?? `View ${idx + 1}`;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`flex-shrink-0 w-20 md:w-24 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImage === idx
                          ? "border-primary shadow-md"
                          : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="w-full h-16 md:h-20 overflow-hidden">
                        <img src={img} alt={label} className="w-full h-full object-cover" />
                      </div>
                      <div className={`text-[9px] font-semibold text-center py-1 px-1 leading-tight transition-colors ${
                        activeImage === idx ? "text-primary bg-primary/10" : "text-muted-foreground"
                      }`}>
                        {label}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Details ────────────────────────── */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {product.categoryName && (
                <Link href={`/products?category=${product.categoryId}`}>
                  <span className="text-xs text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors">
                    {product.categoryName}
                  </span>
                </Link>
              )}
              {product.badge && (
                <Badge className="text-[10px] uppercase">{product.badge}</Badge>
              )}
              {product.featured && (
                <Badge variant="secondary" className="text-[10px]">⭐ Featured</Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.floor(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
            </div>

            {/* Viewing now social proof */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 text-orange-700 dark:text-orange-400 text-xs font-bold px-2.5 py-1.5 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                </span>
                {viewingNow} people viewing now
              </div>
              <div className="text-xs text-muted-foreground">
                🔥 {50 + (product.id * 43) % 950}+ sold this week
              </div>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl md:text-4xl font-extrabold text-primary">
                BDT {product.price.toLocaleString()}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    BDT {product.comparePrice.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-lg">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <div className="mb-5">
              {product.stock > 10 ? (
                <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> In Stock ({product.stock} available)
                </span>
              ) : product.stock > 0 ? (
                <span className="text-sm text-orange-600 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Only {product.stock} left — order soon!
                </span>
              ) : (
                <div className="space-y-2">
                  <span className="text-sm text-destructive font-medium flex items-center gap-1.5">
                    <Package className="w-4 h-4" /> Currently Out of Stock
                  </span>
                  <NotifyStockForm productName={product.name} />
                </div>
              )}
            </div>

            {product.description && (
              <div className="text-sm text-muted-foreground leading-relaxed mb-6 pb-6 border-b">
                {product.description}
              </div>
            )}

            {product.stock > 0 && (
              <div className="space-y-4 mt-auto">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium w-20">Quantity:</span>
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      className="px-3 py-2.5 hover:bg-muted transition-colors disabled:opacity-40"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold">{quantity}</span>
                    <button
                      className="px-3 py-2.5 hover:bg-muted transition-colors disabled:opacity-40"
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">({product.stock} available)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 gap-2 font-bold"
                    onClick={handleAddToCart}
                  >
                    {addedToCart ? (
                      <><CheckCircle2 className="w-5 h-5 text-green-600" /> Added!</>
                    ) : (
                      <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                    )}
                  </Button>
                  <Button
                    size="lg"
                    className="h-12 gap-2 font-bold neon-glow"
                    onClick={handleBuyNow}
                  >
                    <Zap className="w-5 h-5" /> Buy Now
                  </Button>
                </div>
                {/* Sentinel for sticky bar */}
                <div id="buy-buttons-sentinel" className="h-px" />
              </div>
            )}

            <div className="mt-6 rounded-xl border bg-muted/30 p-4 space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <Truck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold">Free Delivery</span>
                  <span className="text-muted-foreground"> on orders over BDT 500. Available across Bangladesh.</span>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <RefreshCw className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold">7-day Return Policy</span>
                  <span className="text-muted-foreground"> — Easy and hassle-free returns.</span>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold">100% Genuine</span>
                  <span className="text-muted-foreground"> — Verified authentic product.</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share this product
            </button>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold">Related Products</h2>
                <p className="text-muted-foreground text-sm mt-0.5">More from {product.categoryName || "this category"}</p>
              </div>
              <Link href={`/products?category=${product.categoryId}`} className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        <FakeReviewsSection productId={product.id} rating={rating} reviewCount={reviewCount} />

        <RecentlyViewedRow recentIds={recentIds} />
      </div>

      {/* ── Sticky Add to Cart Bar ──────────────────────────────────────── */}
      {product.stock > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
          stickyVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}>
          <div className="bg-card/95 backdrop-blur-md border-t shadow-2xl">
            <div className="container mx-auto px-4 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{product.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-primary">BDT {(product.price * quantity).toLocaleString()}</span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-xs text-muted-foreground line-through">BDT {(product.comparePrice * quantity).toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center border rounded-lg overflow-hidden flex-shrink-0">
                <button className="px-2.5 py-1.5 hover:bg-muted transition-colors" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                <button className="px-2.5 py-1.5 hover:bg-muted transition-colors" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <Button size="sm" variant="outline" className="h-10 gap-1.5 font-bold flex-shrink-0" onClick={handleAddToCart}>
                <ShoppingCart className="w-4 h-4" />
                {addedToCart ? "Added!" : "Add to Cart"}
              </Button>
              <Button size="sm" className="h-10 gap-1.5 font-bold neon-glow flex-shrink-0" onClick={handleBuyNow}>
                <Zap className="w-4 h-4" /> Buy Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </StoreLayout>
  );
}
