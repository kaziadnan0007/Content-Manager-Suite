import { StoreLayout } from "@/components/layout/store-layout";
import { useWishlist } from "@/hooks/use-wishlist";
import { useListProducts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Heart, ShoppingBag, Trash2, ShoppingCart, Zap, Package, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/components/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

function fakeRating(id: number) { return 3.5 + (id % 5) * 0.3; }
function fakeSold(id: number) { return 50 + (id * 43) % 950; }

export function WishlistPage() {
  const { wishlistIds, clear, remove } = useWishlist();
  const { data, isLoading } = useListProducts({ limit: 100 });
  const { addItem } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const allProducts = data?.products ?? [];
  const wishlistProducts = wishlistIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as any[];

  const handleMoveToCart = (product: any) => {
    addItem(product, 1);
    remove(product.id);
    toast({ title: "Moved to cart! 🛒", description: product.name });
  };

  const handleBuyNow = (product: any) => {
    addItem(product, 1);
    remove(product.id);
    setLocation("/checkout");
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center ring-1 ring-red-200 dark:ring-red-800">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black leading-tight">My Wishlist</h1>
              <p className="text-sm text-muted-foreground">
                {wishlistIds.length} saved item{wishlistIds.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {wishlistProducts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-bold"
                onClick={() => {
                  wishlistProducts.forEach((p) => addItem(p, 1));
                  clear();
                  toast({ title: "All items moved to cart! 🛒" });
                }}
              >
                <ShoppingCart className="w-4 h-4" /> Add All to Cart
              </Button>
            )}
            {wishlistIds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={clear}
              >
                <Trash2 className="w-4 h-4" /> Clear all
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {wishlistProducts.map((product) => {
              const discount = product.comparePrice && product.comparePrice > product.price
                ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                : null;
              const rating = fakeRating(product.id);
              const sold = fakeSold(product.id);

              return (
                <div key={product.id} className="group bg-card border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-200 flex flex-col">
                  {/* Image */}
                  <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-muted">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}
                    {discount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow">
                        -{discount}%
                      </span>
                    )}
                    {product.badge && (
                      <span className="absolute top-2 right-2 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow">
                        {product.badge}
                      </span>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white text-black text-[11px] font-black px-3 py-1 rounded-full">Out of Stock</span>
                      </div>
                    )}
                    {/* Remove from wishlist */}
                    <button
                      onClick={(e) => { e.preventDefault(); remove(product.id); toast({ title: "Removed from wishlist" }); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remove from wishlist"
                    >
                      <Heart className="w-3.5 h-3.5 fill-white" />
                    </button>
                  </Link>

                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{product.categoryName}</p>
                    <Link href={`/products/${product.id}`}>
                      <h3 className="text-xs font-bold line-clamp-2 mt-0.5 mb-2 hover:text-primary transition-colors min-h-[2.5rem]">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{sold}+</span>
                    </div>

                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className="text-sm font-black text-primary">BDT {product.price.toLocaleString()}</span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-[11px] text-muted-foreground line-through">BDT {product.comparePrice.toLocaleString()}</span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-auto space-y-1.5">
                      {product.stock > 0 ? (
                        <>
                          <Button
                            size="sm"
                            className="w-full h-8 text-xs gap-1.5 font-bold neon-glow"
                            onClick={() => handleBuyNow(product)}
                          >
                            <Zap className="w-3 h-3" /> Buy Now
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-8 text-xs gap-1.5 font-bold"
                            onClick={() => handleMoveToCart(product)}
                          >
                            <ShoppingCart className="w-3 h-3" /> Move to Cart
                          </Button>
                        </>
                      ) : (
                        <Badge variant="secondary" className="w-full justify-center text-xs py-1">Out of Stock</Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-border rounded-2xl bg-muted/10">
            <Heart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-xl font-black mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto">
              Tap the ♡ heart icon on any product to save it here for later.
            </p>
            <Button asChild className="rounded-full font-bold gap-2 neon-glow">
              <Link href="/products">
                <ShoppingBag className="w-4 h-4" />
                Browse Products
              </Link>
            </Button>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
