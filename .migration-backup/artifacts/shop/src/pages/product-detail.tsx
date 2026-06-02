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
import { useState } from "react";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function fakeRating(id: number) {
  return 3.5 + (id % 5) * 0.3;
}
function fakeReviews(id: number) {
  return 12 + (id * 17) % 240;
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

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const { recentIds } = useRecentlyViewed(id);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
      toast({ title: "Added to cart!", description: `${quantity}x ${product.name}` });
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addItem(product, quantity);
      setLocation("/checkout");
    }
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
            {/* Main image */}
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

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === idx
                        ? "border-primary shadow-md"
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ────────────────────────── */}
          <div className="flex flex-col">
            {/* Category + badges */}
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

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
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

            {/* Price */}
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

            {/* Stock badge */}
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
                <span className="text-sm text-destructive font-medium">✗ Out of Stock</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="text-sm text-muted-foreground leading-relaxed mb-6 pb-6 border-b">
                {product.description}
              </div>
            )}

            {/* Quantity + Actions */}
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
                    className="h-12 gap-2 font-bold"
                    onClick={handleBuyNow}
                  >
                    <Zap className="w-5 h-5" /> Buy Now
                  </Button>
                </div>
              </div>
            )}

            {/* Delivery + policies */}
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

            {/* Share */}
            <button
              onClick={handleShare}
              className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share this product
            </button>
          </div>
        </div>

        {/* ── Related Products ───────────────── */}
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

        {/* ── Recently Viewed ────────────────── */}
        <RecentlyViewedRow recentIds={recentIds} />
      </div>
    </StoreLayout>
  );
}
