import { Link } from "wouter";
import { Star, Clock } from "lucide-react";
import { useListProducts } from "@workspace/api-client-react";
import { useCart } from "@/components/cart-context";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart } from "lucide-react";

function fakeRating(id: number) {
  return 3.5 + (id % 5) * 0.3;
}
function fakeSold(id: number) {
  return 50 + (id * 43) % 950;
}

function MiniCard({ product }: { product: any }) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const rating = fakeRating(product.id);
  const sold = fakeSold(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast({ title: "Added to cart!", description: product.name });
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group flex-shrink-0 w-40 sm:w-44 bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
          )}
          {discount && (
            <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
              -{discount}%
            </span>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-full">Out of Stock</span>
            </div>
          )}
          {product.stock > 0 && (
            <button
              onClick={handleAdd}
              className="absolute bottom-1.5 right-1.5 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200 hover:bg-primary/90"
              title="Add to cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-2.5 space-y-1">
          <h4 className="text-xs font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[2rem]">
            {product.name}
          </h4>
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-2.5 h-2.5 ${
                    s <= Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">{sold}+</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-primary">৳{product.price.toLocaleString()}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-[10px] text-muted-foreground line-through">৳{product.comparePrice.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

interface RecentlyViewedRowProps {
  recentIds: number[];
}

export function RecentlyViewedRow({ recentIds }: RecentlyViewedRowProps) {
  const { data } = useListProducts({ limit: 100 });

  if (!recentIds.length) return null;

  const allProducts = data?.products ?? [];
  const viewed = recentIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as any[];

  if (!viewed.length) return null;

  return (
    <div className="mt-16">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Clock className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold leading-tight">Recently Viewed</h2>
          <p className="text-xs text-muted-foreground">Your browsing history</p>
        </div>
        <span className="ml-auto text-xs text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-full">
          {viewed.length} item{viewed.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Horizontal scroll */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none">
          {viewed.map((product) => (
            <MiniCard key={product.id} product={product} />
          ))}
        </div>
        {/* Fade right edge hint */}
        {viewed.length > 5 && (
          <div className="absolute right-0 top-0 bottom-3 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
}
