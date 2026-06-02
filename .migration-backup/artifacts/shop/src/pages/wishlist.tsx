import { StoreLayout } from "@/components/layout/store-layout";
import { useWishlist } from "@/hooks/use-wishlist";
import { useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function WishlistPage() {
  const { wishlistIds, clear } = useWishlist();
  const { data, isLoading } = useListProducts({ limit: 100 });

  const allProducts = data?.products ?? [];
  const wishlistProducts = wishlistIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as any[];

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black leading-tight">My Wishlist</h1>
              <p className="text-sm text-muted-foreground">
                {wishlistIds.length} saved item{wishlistIds.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {wishlistIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={clear}
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-border rounded-2xl bg-muted/10">
            <Heart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-xl font-black mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto">
              Tap the ♡ on any product to save it here for later.
            </p>
            <Button asChild className="rounded-full font-bold gap-2">
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
