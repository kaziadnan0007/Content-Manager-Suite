import { Link } from "wouter";
import { ShoppingCart, Star, Zap, Heart } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/hooks/use-wishlist";

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

function fakeRating(id: number) {
  return 3.5 + (id % 5) * 0.3;
}
function fakeReviews(id: number) {
  return 12 + (id * 17) % 240;
}
function fakeSold(id: number) {
  return 50 + (id * 43) % 950;
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { toggle, isWishlisted } = useWishlist();

  const wishlisted = isWishlisted(product.id);

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const rating = fakeRating(product.id);
  const reviews = fakeReviews(product.id);
  const sold = fakeSold(product.id);
  const isLowStock = product.stock > 0 && product.stock <= 10;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product as any, 1);
    toast({ title: "Added to cart!", description: product.name });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product as any, 1);
    window.location.href = "/checkout";
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    toast({
      title: wishlisted ? "Removed from wishlist" : "Saved to wishlist!",
      description: wishlisted ? undefined : product.name,
    });
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full flex flex-col">

        {/* Image */}
        <div className="relative overflow-hidden bg-muted aspect-[1/1]">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm bg-gradient-to-br from-muted to-muted/50">
              📦
            </div>
          )}

          {/* Top-left badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount && discount >= 10 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                -{discount}%
              </span>
            )}
            {product.badge && (
              <span className="bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-lg uppercase shadow-sm">
                {product.badge}
              </span>
            )}
            {product.featured && !product.badge && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                ⭐ Top Pick
              </span>
            )}
          </div>

          {/* Wishlist heart — top right */}
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

          {/* Low stock warning */}
          {isLowStock && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-500/90 to-transparent pt-3 pb-1.5 px-2">
              <p className="text-white text-[10px] font-black text-center">
                ⚡ Only {product.stock} left!
              </p>
            </div>
          )}

          {/* Hover actions — Add / Buy */}
          {product.stock > 0 && (
            <div className="absolute bottom-2 inset-x-2 flex gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-1 bg-white/95 backdrop-blur text-primary text-[11px] font-black py-1.5 px-2 rounded-lg shadow-lg hover:bg-primary hover:text-white transition-colors border border-primary/20"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-1 bg-primary text-white text-[11px] font-black py-1.5 px-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                Buy
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
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${
                    s <= Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : s - rating < 1
                      ? "fill-yellow-200 text-yellow-400"
                      : "fill-muted text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">{rating.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">|</span>
            <span className="text-[10px] text-muted-foreground">{sold}+ sold</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-base font-black text-primary">BDT {product.price.toLocaleString()}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                BDT {product.comparePrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Free delivery */}
          {product.price >= 500 && (
            <p className="text-[10px] text-green-600 font-bold mt-0.5">
              🚚 Free delivery
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
