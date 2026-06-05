import { Link } from "wouter";
import { ShoppingCart, Star, Zap, Heart, TrendingUp } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuthGate } from "@/components/auth-gate";

interface Product {
  id: number;
  name: string;
  price: number;
  comparePrice?: number | null;
  images?: string[] | null;
  badge?: string | null;
  categoryName?: string | null;
  stock: number;
  featured?: boolean | null;
}

function fakeRating(id: number) { return 3.5 + (id % 5) * 0.3; }
function fakeReviews(id: number) { return 12 + (id * 17) % 240; }
function fakeSold(id: number) { return 50 + (id * 43) % 950; }

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { toggle, isWishlisted } = useWishlist();
  const { requireAuth } = useAuthGate();

  const wishlisted = isWishlisted(product.id);

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const savings =
    product.comparePrice && product.comparePrice > product.price
      ? product.comparePrice - product.price
      : null;

  const rating = fakeRating(product.id);
  const reviews = fakeReviews(product.id);
  const sold = fakeSold(product.id);
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const stockPercent = Math.min(100, Math.round((product.stock / 20) * 100));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => {
      addItem(product as any, 1);
      toast({ title: "Added to cart! 🛒", description: product.name });
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => {
      addItem(product as any, 1);
      window.location.href = "/checkout";
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    toast({
      title: wishlisted ? "Removed from wishlist" : "Saved to wishlist! ♡",
      description: wishlisted ? undefined : product.name,
    });
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full flex flex-col product-card-shine">

        {/* Image */}
        <div className="relative overflow-hidden bg-muted aspect-square">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-400"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
              <span className="text-5xl opacity-40">📦</span>
            </div>
          )}

          {/* Badges — top left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount && discount >= 5 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                -{discount}%
              </span>
            )}
            {product.badge && (
              <span className="bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-lg uppercase shadow-sm">
                {product.badge}
              </span>
            )}
            {product.featured && !product.badge && !discount && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                ⭐ Top Pick
              </span>
            )}
            {isLowStock && (
              <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm animate-pulse">
                🔥 Only {product.stock} left
              </span>
            )}
          </div>

          {/* Wishlist — top right */}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 z-10
              ${wishlisted
                ? "bg-red-500 text-white scale-100"
                : "bg-white/90 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
              }`}
            title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          >
            <Heart className={`w-4 h-4 transition-all ${wishlisted ? "fill-white" : ""}`} />
          </button>

          {/* Out of stock overlay */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center backdrop-blur-[1px]">
              <span className="bg-white text-black text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
                Out of Stock
              </span>
            </div>
          )}

          {/* Hover actions */}
          {product.stock > 0 && (
            <div className="absolute bottom-2 inset-x-2 flex gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-1 bg-white/95 backdrop-blur text-primary text-[11px] font-black py-2 px-2 rounded-xl shadow-lg hover:bg-primary hover:text-white transition-colors border border-primary/20"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-1 bg-primary text-white text-[11px] font-black py-2 px-2 rounded-xl shadow-lg hover:bg-primary/90 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                Buy Now
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-1 flex-1">
          {product.categoryName && (
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              {product.categoryName}
            </p>
          )}
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 flex-1 group-hover:text-primary transition-colors leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating + sold */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`w-3 h-3 ${
                  s <= Math.floor(rating) ? "fill-yellow-400 text-yellow-400"
                  : s - rating < 1 ? "fill-yellow-200 text-yellow-300"
                  : "fill-muted text-muted-foreground"}`}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">{rating.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">({reviews})</span>
            <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" />{sold}+ sold
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
            <span className="text-base font-black text-primary">BDT {product.price.toLocaleString()}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                BDT {product.comparePrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Savings */}
          {savings && savings > 0 ? (
            <p className="text-[10px] text-green-600 dark:text-green-400 font-bold">
              You save BDT {savings.toLocaleString()}
            </p>
          ) : product.price >= 500 ? (
            <p className="text-[10px] text-green-600 dark:text-green-400 font-bold">
              🚚 Free delivery
            </p>
          ) : null}

          {/* Stock progress — only for low stock */}
          {isLowStock && product.stock <= 10 && (
            <div className="mt-1.5">
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                  style={{ width: `${stockPercent}%` }}
                />
              </div>
              <p className="text-[9px] text-orange-600 dark:text-orange-400 font-bold mt-0.5">
                Selling fast — hurry!
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
