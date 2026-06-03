import { Link, useLocation } from "wouter";
import { useCart } from "../cart-context";
import { useGetSettings, useListCategories } from "@workspace/api-client-react";
import {
  ShoppingCart, Menu, Search, Sun, Moon, Phone, Package,
  Minus, Plus, Trash2, Heart, MapPin, User, LogIn, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTheme } from "../ThemeProvider";
import { useState } from "react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/components/auth-context";

/* ─── AcholGatha Logo Image ──────────────────────────────────────────────── */
function AcholGathaLogo({ size = "md", onDark = false }: { size?: "sm" | "md" | "lg"; onDark?: boolean }) {
  const h = { sm: "h-7", md: "h-9", lg: "h-11" }[size];
  return (
    <img
      src="/acholgatha-logo-transparent.png"
      alt="AcholGatha"
      className={`${h} w-auto object-contain select-none drop-shadow-sm ${
        onDark
          ? "brightness-0 invert"
          : "[filter:brightness(0)_saturate(100%)_invert(62%)_sepia(98%)_saturate(700%)_hue-rotate(158deg)_brightness(105%)_contrast(102%)]"
      }`}
    />
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
      <header className="sticky top-0 z-50 w-full shadow-lg">
        <div className="store-header-main">
          <div className="container mx-auto px-3 md:px-4 h-16 md:h-[68px] flex items-center gap-2 md:gap-4">

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
                    <AcholGathaLogo size="sm" onDark />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-2 flex-1 overflow-y-auto">
                  {/* Auth section */}
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
                      {cat.productCount > 0 && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">{cat.productCount}</span>}
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
                    {wishlistIds.length > 0 && <span className="text-xs bg-destructive text-white px-2 py-0.5 rounded-full font-black">{wishlistIds.length}</span>}
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
                <img src={settings.logoUrl} alt={siteName} className="h-9 max-w-[160px] object-contain" />
              ) : (
                <AcholGathaLogo onDark />
              )}
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex shadow-sm">
              <div className="relative w-full flex rounded-lg overflow-hidden border-2 border-primary/50 hover:border-primary focus-within:border-primary transition-colors">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, categories…"
                  className="w-full h-11 pl-4 pr-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none text-sm transition-colors"
                />
                <button type="submit"
                  className="h-11 px-6 bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-sm font-bold flex-shrink-0">
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
                      <Button variant="ghost" className="text-white hover:bg-white/10 h-9 px-3 gap-1.5 text-sm font-semibold">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-black text-white/90">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="hidden lg:inline max-w-[100px] truncate">{customer.name.split(" ")[0]}</span>
                        <ChevronDown className="w-3 h-3 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-3 py-2 border-b">
                        <p className="font-bold text-sm truncate">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.phone}</p>
                      </div>
                      <DropdownMenuItem asChild><Link href="/profile" className="cursor-pointer"><User className="w-4 h-4 mr-2" /> My Profile</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href="/track-order" className="cursor-pointer"><Package className="w-4 h-4 mr-2" /> My Orders</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href="/wishlist" className="cursor-pointer"><Heart className="w-4 h-4 mr-2" /> Wishlist</Link></DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer">Sign Out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/auth/signin">
                    <Button variant="ghost" className="text-white hover:bg-white/10 h-9 px-3 gap-1.5 text-sm font-semibold">
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
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 h-9 w-9">
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
                  <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 h-9 w-9">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-[9px] font-black text-white shadow-sm">
                        {totalItems > 9 ? "9+" : totalItems}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
                  <SheetHeader className="p-4 border-b flex-shrink-0 store-header-main">
                    <SheetTitle className="flex items-center gap-2 text-base font-black text-white">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      Cart
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
                                  <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2 hover:bg-primary/10 transition-colors h-full text-primary"><Minus className="w-3 h-3" /></button>
                                  <span className="px-2 text-sm font-black w-8 text-center">{quantity}</span>
                                  <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2 hover:bg-primary/10 transition-colors h-full text-primary"><Plus className="w-3 h-3" /></button>
                                </div>
                                <button onClick={() => removeItem(product.id)} className="text-muted-foreground hover:text-destructive transition-colors ml-auto"><Trash2 className="w-4 h-4" /></button>
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
          <div className="md:hidden px-3 pb-2.5">
            <form onSubmit={handleSearch} className="flex rounded-lg overflow-hidden border-2 border-primary/40 focus-within:border-primary transition-colors">
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
                🛒 All
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

      {/* Footer */}
      <footer className="border-t bg-muted/20 mt-auto">
        {/* Trust strip */}
        <div className="store-header-main">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {[
              { icon: "🚚", t: "Inside Dhaka", s: "Delivery BDT 60" },
              { icon: "📦", t: "Outside Dhaka", s: "Delivery BDT 120" },
              { icon: "💳", t: "bKash / Rocket", s: "Secure payment" },
              { icon: "🛡️", t: "100% Genuine", s: "Quality guaranteed" },
            ].map((b) => (
              <div key={b.t} className="flex items-center gap-3 py-3 px-4">
                <span className="text-xl">{b.icon}</span>
                <div>
                  <p className="text-xs font-black text-white">{b.t}</p>
                  <p className="text-[10px] text-white/60">{b.s}</p>
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
                {settings?.tagline || "Bangladesh's #1 online shopping platform."}
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
                  <li key={cat.id}><Link href={`/products?category=${cat.id}`} className="hover:text-primary transition-colors">{cat.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-3 text-sm uppercase tracking-wide">My Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/auth/signin" className="hover:text-primary transition-colors">Sign In</Link></li>
                <li><Link href="/auth/signup" className="hover:text-primary transition-colors">Create Account</Link></li>
                <li><Link href="/track-order" className="hover:text-primary transition-colors">Track My Order</Link></li>
                <li><Link href="/wishlist" className="hover:text-primary transition-colors">My Wishlist</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-3 text-sm uppercase tracking-wide">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {settings?.phone && (
                  <li className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />
                    <a href={`tel:${settings.phone}`} className="hover:text-primary transition-colors">{settings.phone}</a>
                  </li>
                )}
                {settings?.whatsappNumber && (
                  <li>
                    <a href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
                      target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp Support</a>
                  </li>
                )}
                {settings?.email && (
                  <li><a href={`mailto:${settings.email}`} className="hover:text-primary transition-colors">{settings.email}</a></li>
                )}
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} AcholGatha. All rights reserved.</p>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-1 bg-muted rounded text-[10px] font-bold">bKash</span>
              <span className="px-2 py-1 bg-muted rounded text-[10px] font-bold">Rocket</span>
              <span className="px-2 py-1 bg-muted rounded text-[10px] font-bold">Cash on Delivery</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      {settings?.whatsappNumber && (
        <a href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
          target="_blank" rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all pulse-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
      )}
    </div>
  );
}
