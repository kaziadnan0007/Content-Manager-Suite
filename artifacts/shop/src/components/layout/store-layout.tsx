import { Link, useLocation } from "wouter";
import { useCart } from "../cart-context";
import { useGetSettings, useListCategories, useListProducts } from "@workspace/api-client-react";
import {
  ShoppingCart, Menu, Search, Sun, Moon, Phone, Package,
  Minus, Plus, Trash2, Heart, MapPin, User, LogIn, ChevronDown,
  Sparkles, X, ArrowUp, MessageCircle, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTheme } from "../ThemeProvider";
import { useState, useEffect, useRef } from "react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/components/auth-context";

/* ─── AcholGatha Logo ────────────────────────────────────────────────────── */
function AcholGathaLogo({ size = "md", onDark = false }: { size?: "sm" | "md" | "lg"; onDark?: boolean }) {
  const h = { sm: "h-10", md: "h-14", lg: "h-16" }[size];
  return (
    <img
      src="/acholgatha-logo-transparent.png"
      alt="AcholGatha"
      className={`${h} w-auto object-contain select-none drop-shadow-md ${
        onDark
          ? "brightness-0 invert"
          : "[filter:brightness(0)_saturate(100%)_invert(62%)_sepia(98%)_saturate(700%)_hue-rotate(158deg)_brightness(105%)_contrast(102%)]"
      }`}
    />
  );
}

/* ─── Brand wordmark (shown alongside logo) ──────────────────────────────── */
function BrandWordmark({ onDark = false }: { onDark?: boolean }) {
  return (
    <div className="hidden sm:flex flex-col leading-none ml-0.5">
      <span
        className={`font-black text-[1.1rem] tracking-tight leading-none ${
          onDark
            ? "text-white"
            : "[background:linear-gradient(135deg,hsl(192_100%_38%),hsl(217_91%_58%))] bg-clip-text text-transparent"
        }`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        AcholGatha
      </span>
      <span className={`text-[8px] font-bold tracking-[0.15em] uppercase mt-0.5 ${onDark ? "text-white/50" : "text-primary/60"}`}>
        Bangladesh #1 Shop
      </span>
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
  const { customer, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { wishlistIds } = useWishlist();

  const [searchFocused, setSearchFocused] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: searchResults } = useListProducts({
    search: debouncedSearch.length >= 2 ? debouncedSearch : undefined,
    limit: 6,
  });
  const suggestions = (searchResults?.products || []).slice(0, 6);
  const showDropdown = searchFocused && debouncedSearch.length >= 2 && suggestions.length > 0;

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSearchFocused(false);
    if (searchQuery.trim()) setLocation(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const goToProduct = (id: number) => {
    setSearchFocused(false);
    setSearchQuery("");
    setLocation(`/products/${id}`);
  };

  const siteName = settings?.siteName || "AcholGatha";

  return (
    <div className="min-h-[100dvh] flex flex-col">

      {/* ── Announcement ticker ──────────────────────────── */}
      {settings?.showAnnouncement && settings.announcementText && (
        <div className="announcement-bg text-white/80 py-1.5 overflow-hidden relative">
          <div className="flex items-center gap-2 whitespace-nowrap ticker-anim px-4">
            <span className="text-[11px] font-semibold tracking-wide">{settings.announcementText}</span>
            <span className="mx-10 opacity-30">|</span>
            <span className="text-[11px] font-semibold tracking-wide">{settings.announcementText}</span>
          </div>
        </div>
      )}

      {/* ── Top utility bar ──────────────────────────────── */}
      <div className="store-header-top hidden md:block">
        <div className="container mx-auto px-4 h-8 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-4 text-white/60">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Deliver to: Bangladesh</span>
            <span className="text-white/40">|</span>
            <span className="text-green-400 font-medium">Free shipping on orders over BDT 500</span>
          </div>
          <div className="flex items-center gap-4 text-white/60">
            <Link href="/track-order" className="hover:text-white transition-colors font-medium">Track Order</Link>
            <span className="text-white/30">|</span>
            <Link href="/wishlist" className="hover:text-white transition-colors font-medium">Wishlist</Link>
            {customer && (
              <>
                <span className="text-white/30">|</span>
                <Link href="/profile" className="hover:text-white transition-colors font-medium">Hi, {customer.name.split(" ")[0]}</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Header ──────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full shadow-2xl">
        <div className="store-header-main">
          <div className="container mx-auto px-3 md:px-4 h-[72px] md:h-[84px] flex items-center gap-2 md:gap-4">

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10 flex-shrink-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b store-header-main">
                  <SheetTitle className="text-left">
                    <div className="flex items-center gap-2">
                      <AcholGathaLogo size="sm" onDark />
                      <BrandWordmark onDark />
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-2 flex-1 overflow-y-auto">
                  {customer ? (
                    <div className="px-3 py-2.5 mb-2 bg-primary/5 rounded-xl border border-primary/10">
                      <p className="text-xs text-muted-foreground">Signed in as</p>
                      <p className="font-bold truncate">{customer.name}</p>
                    </div>
                  ) : (
                    <div className="flex gap-2 px-1 mb-3">
                      <Button asChild size="sm" className="flex-1 h-9 neon-glow" onClick={() => setMobileMenuOpen(false)}>
                        <Link href="/auth/signin">Sign In</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1 h-9" onClick={() => setMobileMenuOpen(false)}>
                        <Link href="/auth/signup">Register</Link>
                      </Button>
                    </div>
                  )}
                  {[
                    { href: "/", label: "🏠 Home" },
                    { href: "/products", label: "🛍️ All Products" },
                  ].map(({ href, label }) => (
                    <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/8 text-sm font-bold hover:text-primary transition-colors">
                      {label}
                    </Link>
                  ))}
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Categories</div>
                  {categories?.map((cat) => (
                    <Link key={cat.id} href={`/products?category=${cat.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary/8 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <span>{getCatEmoji(cat.name)} {cat.name}</span>
                      {cat.productCount > 0 && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">{cat.productCount}</span>
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
                    <span>♡ Wishlist</span>
                    {wishlistIds.length > 0 && (
                      <span className="text-xs bg-destructive text-white px-2 py-0.5 rounded-full font-black">{wishlistIds.length}</span>
                    )}
                  </Link>
                  {customer && (
                    <button onClick={async () => { await logout(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-destructive/8 text-sm font-bold text-destructive transition-colors w-full text-left mt-2">
                      Sign Out
                    </button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={siteName}
                  className="h-12 md:h-14 max-w-[200px] object-contain drop-shadow-md"
                />
              ) : (
                <AcholGathaLogo onDark />
              )}
            </Link>

            {/* Search with autocomplete */}
            <div ref={searchRef} className="flex-1 max-w-2xl hidden md:flex relative">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative w-full flex rounded-xl overflow-hidden border-2 border-primary/50 hover:border-primary focus-within:border-primary transition-colors shadow-sm">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    placeholder="Search products, brands, categories…"
                    className="w-full h-12 pl-4 pr-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none text-sm transition-colors"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery("")}
                      className="absolute right-[76px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button type="submit"
                    className="h-12 px-5 bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-sm font-bold flex-shrink-0">
                    <Search className="w-4 h-4" />
                    <span className="hidden lg:inline">Search</span>
                  </button>
                </div>
              </form>

              {/* Autocomplete dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-card border rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-3 py-1.5 border-b bg-muted/30">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Suggestions</p>
                  </div>
                  {suggestions.map((product) => {
                    const discount = product.comparePrice && product.comparePrice > product.price
                      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                      : null;
                    return (
                      <button
                        key={product.id}
                        onClick={() => goToProduct(product.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary/5 transition-colors text-left border-b last:border-0"
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 m-2.5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.categoryName}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-black text-primary">BDT {product.price.toLocaleString()}</p>
                          {discount && <p className="text-[10px] text-green-600 font-bold">-{discount}%</p>}
                        </div>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleSearch()}
                    className="w-full px-3 py-2 bg-primary/5 hover:bg-primary/10 transition-colors text-center text-sm font-bold text-primary flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" /> See all results for "{debouncedSearch}"
                  </button>
                </div>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-0.5 ml-auto">
              <Button variant="ghost" size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="hidden md:flex text-white hover:bg-white/10 h-9 w-9">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {/* Auth button */}
              <div className="hidden md:flex">
                {customer ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-white hover:bg-white/10 h-10 px-3 gap-1.5 text-sm font-semibold">
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-black text-white ring-2 ring-white/30">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="hidden lg:inline max-w-[100px] truncate">{customer.name.split(" ")[0]}</span>
                        <ChevronDown className="w-3 h-3 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl">
                      <div className="px-3 py-2.5 border-b">
                        <p className="font-bold text-sm truncate">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.phone}</p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer rounded-lg"><User className="w-4 h-4 mr-2" /> My Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/track-order" className="cursor-pointer rounded-lg"><Package className="w-4 h-4 mr-2" /> My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/wishlist" className="cursor-pointer rounded-lg"><Heart className="w-4 h-4 mr-2" /> Wishlist</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer rounded-lg">Sign Out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/auth/signin">
                    <Button variant="ghost" className="text-white hover:bg-white/10 h-10 px-3 gap-1.5 text-sm font-semibold border border-white/20 rounded-xl hover:border-white/40 transition-all">
                      <LogIn className="w-4 h-4" />
                      <span className="hidden lg:inline">Sign In</span>
                    </Button>
                  </Link>
                )}
              </div>

              <Link href="/track-order" className="hidden md:flex">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 text-xs gap-1.5 font-semibold h-9 px-2">
                  <Package className="w-4 h-4" />
                </Button>
              </Link>

              {/* Wishlist */}
              <Link href="/wishlist" className="hidden md:flex">
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 h-10 w-10">
                  <Heart className={`h-5 w-5 transition-colors ${wishlistIds.length > 0 ? "fill-red-400 text-red-400" : ""}`} />
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
                  <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 h-10 w-10">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-[9px] font-black text-white shadow-sm animate-pulse">
                        {totalItems > 9 ? "9+" : totalItems}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col">
                  <SheetHeader className="p-4 border-b flex-shrink-0 store-header-main">
                    <SheetTitle className="flex items-center gap-2 text-base font-black text-white">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      My Cart
                      <span className="text-white/60 font-normal text-sm">({totalItems} items)</span>
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
                          <p className="text-muted-foreground text-sm mt-1">Add items to get started!</p>
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
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold line-clamp-2 leading-snug">{product.name}</p>
                              <p className="text-sm font-black text-primary mt-1">BDT {product.price.toLocaleString()}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center border-2 border-border rounded-lg h-7 overflow-hidden">
                                  <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2 hover:bg-primary/10 transition-colors h-full text-primary">
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-2 text-sm font-black w-8 text-center">{quantity}</span>
                                  <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2 hover:bg-primary/10 transition-colors h-full text-primary">
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <button onClick={() => removeItem(product.id)} className="text-muted-foreground hover:text-destructive transition-colors ml-auto">
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
                      {/* Free shipping progress bar */}
                      <div className="rounded-xl overflow-hidden bg-muted/50 border border-border/40 px-3 py-2.5">
                        {totalPrice >= 500 ? (
                          <p className="text-xs text-green-600 font-black text-center flex items-center justify-center gap-1.5">
                            🎉 You get <span className="underline">free delivery!</span>
                          </p>
                        ) : (
                          <>
                            <div className="flex justify-between text-[10px] text-muted-foreground font-medium mb-1.5">
                              <span>🚚 BDT {totalPrice.toLocaleString()} / BDT 500</span>
                              <span className="text-primary font-bold">BDT {(500 - totalPrice).toLocaleString()} to go</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500"
                                style={{ width: `${Math.min(100, (totalPrice / 500) * 100)}%` }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <Button className="w-full h-12 font-black text-base rounded-xl neon-glow" asChild onClick={() => setCartOpen(false)}>
                        <Link href="/checkout">Proceed to Checkout →</Link>
                      </Button>
                      <Button variant="outline" className="w-full h-9 text-sm rounded-xl" asChild onClick={() => setCartOpen(false)}>
                        <Link href="/products">Continue Shopping</Link>
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden px-3 pb-3">
            <form onSubmit={handleSearch} className="flex rounded-xl overflow-hidden border-2 border-primary/40 focus-within:border-primary transition-colors">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 h-10 pl-3 pr-2 bg-white text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
              />
              <button type="submit" className="h-10 px-4 bg-primary text-white transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Category Nav Bar */}
        {categories && categories.length > 0 && (
          <nav className="store-header-cats overflow-x-auto scrollbar-none">
            <div className="container mx-auto px-4 flex items-center gap-0.5 h-9 min-w-max">
              <Link href="/products"
                className="flex-shrink-0 text-xs font-black px-3 py-1 rounded-full hover:bg-white/15 text-white/70 hover:text-white transition-all whitespace-nowrap">
                <Sparkles className="w-3 h-3 inline mr-1" />All
              </Link>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/products?category=${cat.id}`}
                  className="flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full text-white/60 hover:bg-white/15 hover:text-white transition-all whitespace-nowrap">
                  {getCatEmoji(cat.name)} {cat.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* ── FLOATING CONTACT BUTTON ──────────────────────────────────────── */}
      {settings?.contactPhone && (
        <div className="fab-float pointer-events-none">
          <a
            href={`https://wa.me/88${settings.contactPhone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            className="pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center shadow-2xl text-white text-2xl transition-all hover:scale-110 bounce-up border-2 border-white/20"
            style={{ background: "linear-gradient(135deg,#25D366,#128C7E)" }}
          >
            💬
          </a>
          <a
            href={`tel:${settings.contactPhone}`}
            title="Call us"
            className="pointer-events-auto w-11 h-11 rounded-full flex items-center justify-center shadow-xl text-white text-lg transition-all hover:scale-110 border-2 border-white/20"
            style={{ background: "linear-gradient(135deg,hsl(218 62% 20%),hsl(192 80% 28%))" }}
          >
            📞
          </a>
        </div>
      )}

      {/* ── BACK TO TOP ─────────────────────────────────────────────────── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-24 right-5 z-50 w-11 h-11 rounded-full bg-primary text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-primary/90 hover:scale-110 ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        title="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* ── WHATSAPP CHAT WIDGET ──────────────────────────────────────── */}
      {settings?.contactPhone && (
        <a
          href={`https://wa.me/88${settings.contactPhone.replace(/\D/g, "")}?text=Hello!%20I%20need%20help%20with%20my%20order.`}
          target="_blank"
          rel="noopener noreferrer"
          className={`fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full bg-green-500 text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:bg-green-600 hover:scale-110 group`}
          title="Chat on WhatsApp"
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="absolute right-16 bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat with us 💬
          </span>
        </a>
      )}

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="mt-auto" style={{ background: "hsl(218 65% 7%)" }}>

        {/* Newsletter strip */}
        <div style={{ background: "linear-gradient(135deg, hsl(192 100% 15%), hsl(218 62% 14%))", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              <div>
                <h3 className="text-xl font-black text-white mb-1">🎁 Get Exclusive Deals in Your Inbox</h3>
                <p className="text-sm text-white/55">Subscribe for flash sales, new arrivals & promo codes. Unsubscribe anytime.</p>
              </div>
              {!newsletterDone ? (
                <form
                  className="flex gap-2 w-full md:w-auto"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsletterEmail.trim()) { setNewsletterDone(true); }
                  }}
                >
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 md:w-64 h-11 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/60 text-sm"
                  />
                  <button type="submit" className="h-11 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm flex items-center gap-2 transition-colors flex-shrink-0">
                    <Send className="w-4 h-4" /> Subscribe
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-3 bg-white/10 rounded-xl px-5 py-3 border border-white/20">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-white font-bold text-sm">You're subscribed!</p>
                    <p className="text-white/55 text-xs">Check your inbox for a welcome code.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div style={{ background: "hsl(218 62% 11%)", borderTop: "1px solid rgba(255,255,255,.06)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8">
              {[
                { icon: "🚚", t: "Free Delivery", s: "Orders above BDT 500" },
                { icon: "🔒", t: "Secure Checkout", s: "SSL encrypted & safe" },
                { icon: "💳", t: "bKash • Nagad • COD", s: "Flexible payment" },
                { icon: "🔄", t: "7-Day Returns", s: "Hassle-free policy" },
              ].map((b) => (
                <div key={b.t} className="flex items-center gap-3 py-3.5 px-4 hover:bg-white/3 transition-colors">
                  <span className="text-xl flex-shrink-0">{b.icon}</span>
                  <div>
                    <p className="text-xs font-black text-white/90">{b.t}</p>
                    <p className="text-[10px] text-white/45">{b.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <AcholGathaLogo size="sm" onDark />
                <div className="flex flex-col leading-none">
                  <span className="font-black text-base tracking-tight text-white">AcholGatha</span>
                  <span className="text-[9px] font-bold tracking-widest uppercase text-white/40 mt-0.5">Bangladesh #1 Shop</span>
                </div>
              </div>
              <p className="text-sm text-white/50 leading-relaxed mb-5">
                {settings?.tagline || "Bangladesh's most trusted online shopping destination. Fast delivery. Genuine products. Real support."}
              </p>
              {/* Social links */}
              <div className="flex gap-2">
                {settings?.facebookUrl ? (
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all text-sm font-black border border-white/10 hover:border-primary/50 hover:bg-primary/10"
                    title="Facebook">
                    f
                  </a>
                ) : null}
                {settings?.contactPhone && (
                  <a href={`https://wa.me/88${settings.contactPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all text-sm border border-white/10 hover:border-green-500/50 hover:bg-green-500/10"
                    title="WhatsApp">
                    💬
                  </a>
                )}
              </div>
              {settings?.contactPhone && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <a href={`tel:${settings.contactPhone}`} className="text-white/60 hover:text-white transition-colors font-medium">
                    {settings.contactPhone}
                  </a>
                </div>
              )}
            </div>

            {/* Shop links */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white/35 mb-4">Shop</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="footer-link">All Products</Link></li>
                <li><Link href="/products?featured=true" className="footer-link">Flash Deals</Link></li>
                {categories?.slice(0, 5).map(cat => (
                  <li key={cat.id}>
                    <Link href={`/products?category=${cat.id}`} className="footer-link">{cat.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer service */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white/35 mb-4">Customer Service</h4>
              <ul className="space-y-2">
                <li><Link href="/track-order" className="footer-link">Track My Order</Link></li>
                <li><Link href="/profile" className="footer-link">My Orders</Link></li>
                <li><Link href="/wishlist" className="footer-link">My Wishlist</Link></li>
                <li><a href="#" className="footer-link">Return Policy</a></li>
                <li><a href="#" className="footer-link">Shipping Info</a></li>
                <li><a href="#" className="footer-link">FAQ</a></li>
              </ul>
            </div>

            {/* Account + payments */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white/35 mb-4">My Account</h4>
              <ul className="space-y-2 mb-6">
                <li><Link href="/auth/signin" className="footer-link">Sign In</Link></li>
                <li><Link href="/auth/signup" className="footer-link">Create Account</Link></li>
                <li><Link href="/profile" className="footer-link">Profile Settings</Link></li>
                <li><Link href="/checkout" className="footer-link">Checkout</Link></li>
              </ul>
              <h4 className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">We Accept</h4>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { l: "bKash", c: "#E2136E" },
                  { l: "Nagad", c: "#F7941D" },
                  { l: "Rocket", c: "#8B2FC9" },
                  { l: "COD", c: "#16a34a" },
                  { l: "VISA", c: "#1A1F71" },
                ].map((p) => (
                  <span key={p.l}
                    className="text-[10px] font-black px-2 py-1 rounded-lg border"
                    style={{ color: p.c, borderColor: p.c + "40", background: p.c + "15" }}>
                    {p.l}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Divider + copyright */}
          <div className="mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3"
            style={{ borderTop: "1px solid rgba(255,255,255,.07)" }}>
            <p className="text-xs text-white/30 text-center sm:text-left">
              © {new Date().getFullYear()} AcholGatha — Bangladesh's #1 Online Shop. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-white/25">
              <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
              <span>·</span>
              <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
              <span>·</span>
              <span>🇧🇩 Made in Bangladesh</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
