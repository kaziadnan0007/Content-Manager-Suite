import { Link, useLocation } from "wouter";
import { useCart } from "../cart-context";
import { useGetSettings, useListCategories } from "@workspace/api-client-react";
import {
  ShoppingCart,
  Menu,
  Search,
  Sun,
  Moon,
  Phone,
  Package,
  Minus,
  Plus,
  Trash2,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useTheme } from "../ThemeProvider";
import { useState } from "react";
import { useWishlist } from "@/hooks/use-wishlist";

function AcholGathaLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { text: "text-lg", sub: "text-[8px]" },
    md: { text: "text-xl", sub: "text-[9px]" },
    lg: { text: "text-2xl", sub: "text-[10px]" },
  };
  return (
    <div className="flex items-center gap-1.5 select-none">
      <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm flex-shrink-0">
        <span className="text-white font-black text-sm leading-none">AG</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-black text-primary tracking-tight ${sizes[size].text}`}>
          AcholGatha
        </span>
        <span className={`text-muted-foreground font-medium tracking-wide uppercase ${sizes[size].sub}`}>
          Your Favourite Shop
        </span>
      </div>
    </div>
  );
}

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const { totalItems, totalPrice, items, removeItem, updateQuantity } = useCart();
  const { data: settings } = useGetSettings();
  const { data: categories } = useListCategories();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { wishlistIds } = useWishlist();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const siteName = settings?.siteName || "AcholGatha";

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Announcement Bar */}
      {settings?.showAnnouncement && settings.announcementText && (
        <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-xs font-bold tracking-wide">
          {settings.announcementText}
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center gap-2 md:gap-4">
          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden flex-shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="p-4 border-b bg-primary/5">
                <SheetTitle className="text-left">
                  <AcholGathaLogo size="sm" />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-2">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 text-sm font-bold hover:text-primary transition-colors"
                >
                  🏠 Home
                </Link>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 text-sm font-bold hover:text-primary transition-colors"
                >
                  🛍️ All Products
                </Link>
                {categories?.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary/5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span>{cat.name}</span>
                    {cat.productCount > 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                        {cat.productCount}
                      </span>
                    )}
                  </Link>
                ))}
                <div className="h-px bg-border my-2" />
                <Link
                  href="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 text-sm font-bold hover:text-primary transition-colors"
                >
                  📦 Track Order
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary/5 text-sm font-bold hover:text-primary transition-colors"
                >
                  <span>♡ My Wishlist</span>
                  {wishlistIds.length > 0 && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-black">
                      {wishlistIds.length}
                    </span>
                  )}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={siteName}
                className="h-8 max-w-[140px] object-contain"
              />
            ) : (
              <AcholGathaLogo />
            )}
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
            <div className="relative w-full flex">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, categories..."
                className="w-full h-11 pl-4 pr-12 rounded-l-xl border-2 border-r-0 border-border bg-muted/40 focus:outline-none focus:ring-0 focus:border-primary text-sm transition-colors"
              />
              <button
                type="submit"
                className="h-11 px-5 bg-primary text-primary-foreground rounded-r-xl hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-sm font-bold flex-shrink-0"
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline">Search</span>
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="hidden md:flex"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Link href="/track-order" className="hidden md:flex">
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 font-medium">
                <Package className="w-4 h-4" />
                Track
              </Button>
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist" className="hidden md:flex">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className={`h-5 w-5 transition-colors ${wishlistIds.length > 0 ? "fill-red-500 text-red-500" : ""}`} />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm">
                    {wishlistIds.length > 9 ? "9+" : wishlistIds.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-sm">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-96 p-0 flex flex-col">
                <SheetHeader className="p-4 border-b flex-shrink-0 bg-primary/5">
                  <SheetTitle className="flex items-center gap-2 text-base font-black">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShoppingCart className="w-10 h-10 text-primary/40" />
                      </div>
                      <div>
                        <p className="font-black text-lg">Your cart is empty</p>
                        <p className="text-muted-foreground text-sm mt-1">Add some products to get started</p>
                      </div>
                      <Button asChild onClick={() => setCartOpen(false)} className="rounded-full font-bold">
                        <Link href="/products">Browse Products</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {items.map(({ product, quantity }) => (
                        <div key={product.id} className="p-4 flex gap-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold line-clamp-2 leading-snug">{product.name}</p>
                            <p className="text-sm font-black text-primary mt-1">BDT {product.price.toLocaleString()}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center border-2 border-border rounded-lg h-7 overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(product.id, quantity - 1)}
                                  className="px-2 hover:bg-primary/10 transition-colors h-full text-primary"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-sm font-black w-8 text-center">{quantity}</span>
                                <button
                                  onClick={() => updateQuantity(product.id, quantity + 1)}
                                  className="px-2 hover:bg-primary/10 transition-colors h-full text-primary"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(product.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors ml-auto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {items.length > 0 && (
                  <div className="border-t p-4 flex-shrink-0 space-y-3 bg-background">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Total</span>
                      <span className="text-xl font-black text-primary">BDT {totalPrice.toLocaleString()}</span>
                    </div>
                    {totalPrice >= 500 && (
                      <p className="text-xs text-green-600 font-bold text-center bg-green-50 dark:bg-green-950/30 rounded-xl py-2">
                        🎉 You qualify for FREE delivery!
                      </p>
                    )}
                    <Button
                      className="w-full h-12 font-black text-base rounded-xl shadow-md"
                      asChild
                      onClick={() => setCartOpen(false)}
                    >
                      <Link href="/checkout">Proceed to Checkout →</Link>
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-3 pb-2.5">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 h-10 pl-3 pr-2 rounded-l-xl border-2 border-r-0 border-border bg-muted/40 focus:outline-none focus:border-primary text-sm transition-colors"
            />
            <button
              type="submit"
              className="h-10 px-4 bg-primary text-primary-foreground rounded-r-xl hover:bg-primary/90 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Categories Nav Bar */}
        {categories && categories.length > 0 && (
          <nav className="border-t overflow-x-auto scrollbar-none bg-muted/20">
            <div className="container mx-auto px-4 flex items-center gap-1 h-10 min-w-max">
              <Link href="/products" className="flex-shrink-0 text-xs font-black px-4 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-all whitespace-nowrap">
                🛒 All Products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all whitespace-nowrap"
                >
                  {cat.name}
                  {cat.productCount > 0 && (
                    <span className="ml-1 opacity-60">({cat.productCount})</span>
                  )}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-foreground/5 mt-auto">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <AcholGathaLogo size="md" />
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                {settings?.tagline || "Your favourite online shop. Best products at best prices."}
              </p>
              <div className="flex gap-3 mt-4">
                {settings?.facebookUrl && (
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-xs font-bold">
                    Facebook
                  </a>
                )}
                {settings?.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-xs font-bold">
                    Instagram
                  </a>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-black mb-3 text-sm">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
                {categories?.slice(0, 5).map(cat => (
                  <li key={cat.id}>
                    <Link href={`/products?category=${cat.id}`} className="hover:text-primary transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-3 text-sm">Help</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/track-order" className="hover:text-primary transition-colors">Track Order</Link></li>
                <li><Link href="/checkout" className="hover:text-primary transition-colors">Cart & Checkout</Link></li>
                {settings?.whatsappNumber && (
                  <li>
                    <a
                      href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      WhatsApp Support
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-3 text-sm">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {settings?.bkashNumber && (
                  <li className="flex items-center gap-2">
                    <span className="text-pink-500 font-black">bKash:</span>
                    {settings.bkashNumber}
                  </li>
                )}
                {settings?.rocketNumber && (
                  <li className="flex items-center gap-2">
                    <span className="text-violet-500 font-black">Rocket:</span>
                    {settings.rocketNumber}
                  </li>
                )}
                {settings?.whatsappNumber && (
                  <li className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {settings.whatsappNumber}
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🚚", title: "Free Delivery", desc: "On orders over BDT 500" },
              { icon: "🔄", title: "Easy Returns", desc: "7-day return policy" },
              { icon: "💳", title: "bKash / Rocket", desc: "Secure payments" },
              { icon: "🛡️", title: "100% Genuine", desc: "Quality guaranteed" },
            ].map((b) => (
              <div key={b.title} className="flex items-center gap-3">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <p className="text-xs font-black">{b.title}</p>
                  <p className="text-[11px] text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{settings?.footerText || `© ${new Date().getFullYear()} AcholGatha. All rights reserved.`}</span>
            <Link href="/admin/login" className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
              Admin Panel
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      {settings?.whatsappNumber && (
        <a
          href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-40"
          title="Chat on WhatsApp"
        >
          <Phone className="w-6 h-6" />
        </a>
      )}
    </div>
  );
}
