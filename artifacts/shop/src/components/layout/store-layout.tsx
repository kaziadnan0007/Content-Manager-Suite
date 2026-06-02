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
  Zap,
  MapPin,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useTheme } from "../ThemeProvider";
import { useState } from "react";
import { useWishlist } from "@/hooks/use-wishlist";

/* ─── Rakuten-inspired AcholGatha Logo ─────────────────────────────────── */
function AcholGathaLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sz = { sm: { box: 30, font: 11, word: "text-lg", tag: "text-[8px]" },
               md: { box: 34, font: 13, word: "text-xl", tag: "text-[9px]" },
               lg: { box: 40, font: 15, word: "text-2xl", tag: "text-[10px]" } }[size];
  return (
    <div className="flex items-center gap-2 select-none group">
      {/* Badge mark — gradient square with "AG" monogram */}
      <div
        style={{ width: sz.box, height: sz.box }}
        className="rounded-[8px] logo-badge flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-primary/20 group-hover:ring-primary/50 transition-all"
      >
        <svg width={sz.box * 0.72} height={sz.box * 0.72} viewBox="0 0 24 24" fill="none">
          {/* Stylised lightning bolt inside mark */}
          <path d="M13 2L4.5 13.5H11L11 22L19.5 10.5H13L13 2Z"
            fill="hsl(192 100% 50%)" stroke="none"/>
        </svg>
      </div>
      {/* Wordmark */}
      <div className="flex flex-col leading-none gap-0.5">
        <span className={`font-black tracking-tight text-foreground ${sz.word} leading-none`}>
          Achol<span className="text-primary">Gatha</span>
        </span>
        <span className={`text-muted-foreground font-semibold tracking-widest uppercase ${sz.tag} leading-none`}>
          Bangladesh's #1 Store
        </span>
      </div>
    </div>
  );
}

/* ─── Category icons ─────────────────────────────────────────────────────── */
const CAT_EMOJI: Record<string, string> = {
  electronics: "📱", clothing: "👗", beauty: "💄", "home-appliances": "🏠",
  sports: "⚽", bags: "👜", shoes: "👟", watches: "⌚", kids: "🧒", books: "📚",
  furniture: "🛋️", grocery: "🛒", health: "💊", automotive: "🚗",
};
function getCatEmoji(name: string) {
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(CAT_EMOJI)) if (lower.includes(k)) return v;
  return "📦";
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
    if (searchQuery.trim()) setLocation(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const siteName = settings?.siteName || "AcholGatha";

  return (
    <div className="min-h-[100dvh] flex flex-col">

      {/* ── Announcement ticker ──────────────────────────── */}
      {settings?.showAnnouncement && settings.announcementText && (
        <div className="announcement-bg text-white py-2 overflow-hidden relative">
          <div className="flex items-center gap-2 whitespace-nowrap ticker-anim px-4">
            <Zap className="w-3.5 h-3.5 text-primary fill-primary flex-shrink-0" />
            <span className="text-xs font-bold tracking-wide">{settings.announcementText}</span>
            <span className="mx-8 opacity-40">|</span>
            <Zap className="w-3.5 h-3.5 text-primary fill-primary flex-shrink-0" />
            <span className="text-xs font-bold tracking-wide">{settings.announcementText}</span>
          </div>
        </div>
      )}

      {/* ── Top utility bar (desktop) ────────────────────── */}
      <div className="hidden md:block bg-background border-b border-border/50">
        <div className="container mx-auto px-4 h-8 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Deliver to: Bangladesh</span>
            <span>Free shipping on orders over BDT 500</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/track-order" className="hover:text-primary transition-colors font-medium">Track Order</Link>
            <span>|</span>
            <Link href="/wishlist" className="hover:text-primary transition-colors font-medium">Wishlist</Link>
            <span>|</span>
            <Link href="/admin/login" className="hover:text-primary transition-colors">Admin</Link>
          </div>
        </div>
      </div>

      {/* ── Main Header ──────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/90 shadow-sm">
        <div className="container mx-auto px-3 md:px-4 h-16 md:h-[68px] flex items-center gap-2 md:gap-4">

          {/* Mobile menu button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden flex-shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
              <SheetHeader className="p-4 border-b bg-gradient-to-r from-background to-primary/5">
                <SheetTitle className="text-left">
                  <AcholGathaLogo size="sm" />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-2 flex-1 overflow-y-auto">
                {[
                  { href: "/", label: "🏠 Home" },
                  { href: "/products", label: "🛍️ All Products" },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/8 text-sm font-bold hover:text-primary transition-colors">
                    {label}
                  </Link>
                ))}
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">
                  Categories
                </div>
                {categories?.map((cat) => (
                  <Link key={cat.id} href={`/products?category=${cat.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary/8 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <span>{getCatEmoji(cat.name)} {cat.name}</span>
                    {cat.productCount > 0 && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                        {cat.productCount}
                      </span>
                    )}
                  </Link>
                ))}
                <div className="h-px bg-border my-2" />
                <Link href="/track-order" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/8 text-sm font-bold hover:text-primary transition-colors">
                  📦 Track Order
                </Link>
                <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary/8 text-sm font-bold hover:text-primary transition-colors">
                  <span>♡ My Wishlist</span>
                  {wishlistIds.length > 0 && (
                    <span className="text-xs bg-destructive text-white px-2 py-0.5 rounded-full font-black">{wishlistIds.length}</span>
                  )}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={siteName} className="h-9 max-w-[160px] object-contain" />
            ) : (
              <AcholGathaLogo />
            )}
          </Link>

          {/* Search Bar — Amazon-style with category dropdown feel */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex shadow-sm">
            <div className="relative w-full flex rounded-xl overflow-hidden border-2 border-primary/60 hover:border-primary focus-within:border-primary transition-colors">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full h-11 pl-4 pr-3 bg-muted/30 focus:outline-none focus:bg-background text-sm transition-colors"
              />
              <button
                type="submit"
                className="h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-sm font-bold flex-shrink-0"
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline">Search</span>
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-0.5 ml-auto">
            <Button variant="ghost" size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="hidden md:flex">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Link href="/track-order" className="hidden md:flex">
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 font-semibold h-9 px-3">
                <Package className="w-4 h-4" />
                <span className="hidden lg:inline">Track</span>
              </Button>
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist" className="hidden md:flex">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Heart className={`h-5 w-5 transition-colors ${wishlistIds.length > 0 ? "fill-red-500 text-red-500" : ""}`} />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white shadow-sm">
                    {wishlistIds.length > 9 ? "9+" : wishlistIds.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground shadow-sm">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b flex-shrink-0 bg-gradient-to-r from-background to-primary/5">
                  <SheetTitle className="flex items-center gap-2 text-base font-black">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    Cart
                    <span className="text-muted-foreground font-normal text-sm">({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShoppingCart className="w-10 h-10 text-primary/30" />
                      </div>
                      <div>
                        <p className="font-black text-lg">Your cart is empty</p>
                        <p className="text-muted-foreground text-sm mt-1">Discover amazing products and add them here!</p>
                      </div>
                      <Button asChild onClick={() => setCartOpen(false)} className="rounded-full font-bold neon-glow">
                        <Link href="/products">Explore Products</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {items.map(({ product, quantity }) => (
                        <div key={product.id} className="p-4 flex gap-3 hover:bg-primary/3 transition-colors">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 border">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold line-clamp-2 leading-snug">{product.name}</p>
                            <p className="text-sm font-black text-primary mt-1">BDT {product.price.toLocaleString()}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center border-2 border-border rounded-lg h-7 overflow-hidden">
                                <button onClick={() => updateQuantity(product.id, quantity - 1)}
                                  className="px-2 hover:bg-primary/10 transition-colors h-full text-primary">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-sm font-black w-8 text-center">{quantity}</span>
                                <button onClick={() => updateQuantity(product.id, quantity + 1)}
                                  className="px-2 hover:bg-primary/10 transition-colors h-full text-primary">
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <button onClick={() => removeItem(product.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors ml-auto">
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
                      <span className="font-bold text-sm">Subtotal ({totalItems} items)</span>
                      <span className="text-xl font-black text-primary">BDT {totalPrice.toLocaleString()}</span>
                    </div>
                    {totalPrice >= 500 ? (
                      <p className="text-xs text-green-600 font-bold text-center bg-green-50 dark:bg-green-950/30 rounded-xl py-2 border border-green-200 dark:border-green-900/30">
                        🎉 Free delivery applied!
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center bg-muted/50 rounded-xl py-2">
                        Add BDT {(500 - totalPrice).toLocaleString()} more for free delivery
                      </p>
                    )}
                    <Button className="w-full h-12 font-black text-base rounded-xl neon-glow" asChild
                      onClick={() => setCartOpen(false)}>
                      <Link href="/checkout">Proceed to Checkout →</Link>
                    </Button>
                    <Button variant="outline" className="w-full h-9 text-sm rounded-xl" asChild
                      onClick={() => setCartOpen(false)}>
                      <Link href="/products">Continue Shopping</Link>
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-3 pb-2.5">
          <form onSubmit={handleSearch} className="flex rounded-xl overflow-hidden border-2 border-primary/50 focus-within:border-primary transition-colors">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 h-10 pl-3 pr-2 bg-muted/30 focus:outline-none text-sm"
            />
            <button type="submit"
              className="h-10 px-4 bg-primary text-primary-foreground transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Category Nav Bar */}
        {categories && categories.length > 0 && (
          <nav className="border-t overflow-x-auto scrollbar-none bg-muted/20">
            <div className="container mx-auto px-4 flex items-center gap-1 h-10 min-w-max">
              <Link href="/products"
                className="flex-shrink-0 text-xs font-black px-4 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-all whitespace-nowrap text-muted-foreground">
                🛒 All
              </Link>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/products?category=${cat.id}`}
                  className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all whitespace-nowrap">
                  {getCatEmoji(cat.name)} {cat.name}
                  {cat.productCount > 0 && <span className="ml-1 opacity-50">({cat.productCount})</span>}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 mt-auto">
        {/* Trust strip */}
        <div className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 divide-x divide-primary-foreground/20">
            {[
              { icon: "🚚", t: "Free Delivery", s: "On orders BDT 500+" },
              { icon: "🔄", t: "Easy Returns", s: "7-day hassle-free" },
              { icon: "💳", t: "bKash / Rocket", s: "Secure payment" },
              { icon: "🛡️", t: "100% Genuine", s: "Quality guaranteed" },
            ].map((b) => (
              <div key={b.t} className="flex items-center gap-3 py-3 px-4">
                <span className="text-xl">{b.icon}</span>
                <div>
                  <p className="text-xs font-black">{b.t}</p>
                  <p className="text-[10px] opacity-75">{b.s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <AcholGathaLogo size="md" />
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                {settings?.tagline || "Bangladesh's #1 online shopping platform. Best products at best prices."}
              </p>
              <div className="flex gap-3 mt-4 flex-wrap">
                {settings?.facebookUrl && (
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors">
                    Facebook
                  </a>
                )}
                {settings?.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-bold px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 transition-colors">
                    Instagram
                  </a>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-black mb-3 text-sm uppercase tracking-wide">Quick Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
                {categories?.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/products?category=${cat.id}`} className="hover:text-primary transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-3 text-sm uppercase tracking-wide">Help & Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/track-order" className="hover:text-primary transition-colors">Track My Order</Link></li>
                <li><Link href="/checkout" className="hover:text-primary transition-colors">Cart & Checkout</Link></li>
                <li><Link href="/wishlist" className="hover:text-primary transition-colors">My Wishlist</Link></li>
                {settings?.whatsappNumber && (
                  <li>
                    <a href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="hover:text-primary transition-colors">
                      WhatsApp Support
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-3 text-sm uppercase tracking-wide">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {settings?.bkashNumber && (
                  <li className="flex items-center gap-2">
                    <span className="text-pink-500 font-black text-xs">bKash:</span>
                    <span>{settings.bkashNumber}</span>
                  </li>
                )}
                {settings?.rocketNumber && (
                  <li className="flex items-center gap-2">
                    <span className="text-violet-500 font-black text-xs">Rocket:</span>
                    <span>{settings.rocketNumber}</span>
                  </li>
                )}
                {settings?.whatsappNumber && (
                  <li className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-green-500" />
                    <span>{settings.whatsappNumber}</span>
                  </li>
                )}
                <li className="text-[11px] mt-2 bg-primary/8 rounded-lg p-2 text-primary font-medium">
                  24/7 Customer Support
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{settings?.footerText || `© ${new Date().getFullYear()} AcholGatha. All rights reserved.`}</span>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Use</span>
              <Link href="/admin/login" className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp CTA */}
      {settings?.whatsappNumber && (
        <a
          href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
          target="_blank" rel="noopener noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-40 ring-4 ring-[#25D366]/20"
          title="Chat on WhatsApp"
        >
          <Phone className="w-6 h-6" />
        </a>
      )}
    </div>
  );
}
