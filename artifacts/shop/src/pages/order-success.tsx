import { StoreLayout } from "@/components/layout/store-layout";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, ShoppingBag, PackageSearch } from "lucide-react";

export function OrderSuccessPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const orderId = params.get("id");

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Order Placed Successfully!</h1>
        
        <div className="bg-card border rounded-xl p-6 mb-8 max-w-md w-full mx-auto shadow-sm">
          <p className="text-muted-foreground mb-2">Your order reference number is</p>
          <div className="text-2xl font-mono font-bold tracking-wider text-primary">#{orderId?.padStart(6, '0')}</div>
          <p className="text-sm text-muted-foreground mt-4">
            We've received your order and will contact you shortly to confirm delivery details.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/products">
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href={`/track-order?orderId=${orderId}`}>
              <PackageSearch className="w-5 h-5" />
              Track My Order
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="gap-2">
            <Link href="/">
              Return to Home <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </StoreLayout>
  );
}
