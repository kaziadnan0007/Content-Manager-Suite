import { Link, useLocation } from "wouter";
import { useCart } from "../cart-context";
import { useGetSettings, useListCategories } from "@workspace/api-client-react";
import {
  ShoppingCart, Menu, Search, Sun, Moon, Phone, Package,
  Minus, Plus, Trash2, Heart, MapPin, User, LogIn, ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTheme } from "../ThemeProvider";
import { useState } from "react";
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

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) setLocation(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
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

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex shadow-sm">
              <div className="relative w-full flex rounded-xl overflow-hidden border-2 border-primary/50 hover:border-primary focus-within:border-primary transition-colors shadow-sm">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, categories…"
                  className="w-full h-12 pl-4 pr-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none text-sm transition-colors"
                />
                <button type="submit"
                  className="h-12 px-6 bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-sm font-bold flex-shrink-0">
                  <Search className="w-4 h-4" />
                  <span className="hidden lg:inline">Search</span>
                </button>
              </div>
            </form>

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
                      {totalPrice >= 500 ? (
                        <p className="text-xs text-green-600 font-bold text-center bg-green-50 dark:bg-green-950/30 rounded-xl py-2 border border-green-200 dark:border-green-900/30">
                          🎉 Eligible for free delivery!
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center bg-muted/50 rounded-xl py-2">
                          Add BDT {(500 - totalPrice).toLocaleString()} more for free delivery
                        </p>
                      )}
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

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="mt-auto" style={{ background: "hsl(218 65% 7%)" }}>

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
