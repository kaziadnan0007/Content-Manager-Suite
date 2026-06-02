import { StoreLayout } from "@/components/layout/store-layout";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { useSearch, useLocation, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/product-card";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  ChevronRight,
  Package,
} from "lucide-react";

type SortKey = "default" | "price_asc" | "price_desc" | "name_asc";

function sortProducts(products: any[], sort: SortKey) {
  const arr = [...products];
  switch (sort) {
    case "price_asc": return arr.sort((a, b) => a.price - b.price);
    case "price_desc": return arr.sort((a, b) => b.price - a.price);
    case "name_asc": return arr.sort((a, b) => a.name.localeCompare(b.name));
    default: return arr;
  }
}

function FilterPanel({
  search, setSearch,
  categoryId, setCategoryId,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  categories, onClear, activeCount,
}: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-sm uppercase tracking-wide mb-3">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setSearch("")}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm uppercase tracking-wide mb-3">Category</h3>
        <div className="space-y-1">
          <button
            onClick={() => setCategoryId(null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${categoryId === null ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"}`}
          >
            <span>All Categories</span>
          </button>
          {categories?.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setCategoryId(cat.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${categoryId === cat.id ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"}`}
            >
              <span>{cat.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${categoryId === cat.id ? "bg-white/20" : "bg-muted text-muted-foreground"}`}>
                {cat.productCount}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm uppercase tracking-wide mb-3">Price Range (৳)</h3>
        <div className="flex gap-2 items-center">
          <Input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full" min={0} />
          <span className="text-muted-foreground flex-shrink-0">—</span>
          <Input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full" min={0} />
        </div>
      </div>

      {activeCount > 0 && (
        <Button variant="outline" className="w-full gap-2" onClick={onClear} size="sm">
          <X className="w-4 h-4" /> Clear all filters ({activeCount})
        </Button>
      )}
    </div>
  );
}

export function ProductsPage() {
  const searchString = useSearch();
  const [, navigate] = useLocation();

  // Parse URL params every render so navigation always syncs
  const searchParams = new URLSearchParams(searchString);
  const urlCategory = searchParams.get("category");
  const urlSearch = searchParams.get("q") || "";
  const urlFeatured = searchParams.get("featured") === "true";

  const [categoryId, setCategoryIdState] = useState<number | null>(urlCategory ? Number(urlCategory) : null);
  const [search, setSearch] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortKey>("default");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync category from URL whenever it changes (fixes tab navigation bug)
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const cat = params.get("category");
    setCategoryIdState(cat ? Number(cat) : null);
    const q = params.get("q") || "";
    setSearch(q);
    setDebouncedSearch(q);
  }, [searchString]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Update category and push to URL
  const setCategoryId = useCallback((id: number | null) => {
    setCategoryIdState(id);
    const params = new URLSearchParams();
    if (id !== null) params.set("category", String(id));
    if (debouncedSearch) params.set("q", debouncedSearch);
    navigate(`/products${params.toString() ? "?" + params.toString() : ""}`);
  }, [debouncedSearch, navigate]);

  const { data: productsData, isLoading } = useListProducts({
    categoryId,
    search: debouncedSearch || undefined,
    featured: urlFeatured || undefined,
    limit: 100,
  });

  const { data: categories } = useListCategories();

  const allProducts = productsData?.products || [];
  const filteredProducts = sortProducts(
    allProducts.filter((p) => {
      if (minPrice && p.price < Number(minPrice)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      return true;
    }),
    sort
  );

  const activeFilterCount =
    (categoryId !== null ? 1 : 0) +
    (debouncedSearch ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0);

  const clearAll = useCallback(() => {
    setCategoryIdState(null);
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    navigate("/products");
  }, [navigate]);

  const selectedCategory = categories?.find((c) => c.id === categoryId);

  return (
    <StoreLayout>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          {selectedCategory ? (
            <>
              <Link href="/products" className="hover:text-primary transition-colors">All Products</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-medium">{selectedCategory.name}</span>
            </>
          ) : (
            <span className="text-foreground font-medium">All Products</span>
          )}
        </nav>
      </div>

      <div className="container mx-auto px-4 pb-12 flex flex-col md:flex-row gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-60 lg:w-64 flex-shrink-0">
          <div className="sticky top-32 bg-card border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-sm uppercase tracking-wide">Filters</h2>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">{activeFilterCount} active</Badge>
              )}
            </div>
            <FilterPanel
              search={search} setSearch={setSearch}
              categoryId={categoryId} setCategoryId={setCategoryId}
              minPrice={minPrice} setMinPrice={setMinPrice}
              maxPrice={maxPrice} setMaxPrice={setMaxPrice}
              categories={categories} onClear={clearAll} activeCount={activeFilterCount}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {/* Mobile filter */}
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden gap-2 font-bold">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="h-4 w-4 p-0 text-[10px] flex items-center justify-center">{activeFilterCount}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-xl">
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-left font-black">Filters</SheetTitle>
                </SheetHeader>
                <FilterPanel
                  search={search} setSearch={setSearch}
                  categoryId={categoryId}
                  setCategoryId={(id: any) => { setCategoryId(id); setMobileFilterOpen(false); }}
                  minPrice={minPrice} setMinPrice={setMinPrice}
                  maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                  categories={categories}
                  onClear={() => { clearAll(); setMobileFilterOpen(false); }}
                  activeCount={activeFilterCount}
                />
              </SheetContent>
            </Sheet>

            <span className="text-sm text-muted-foreground mr-auto">
              <span className="font-black text-foreground">{filteredProducts.length}</span> products found
              {selectedCategory && <span> in <span className="font-semibold text-primary">{selectedCategory.name}</span></span>}
              {urlFeatured && <span> — <span className="font-semibold text-primary">Featured Deals</span></span>}
            </span>

            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-44 h-8 text-xs font-medium">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="name_asc">Name A–Z</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`px-2.5 py-1.5 transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-2.5 py-1.5 transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {debouncedSearch && (
                <Badge variant="secondary" className="gap-1 pr-1 text-xs">
                  🔍 {debouncedSearch}
                  <button onClick={() => setSearch("")} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1 pr-1 text-xs">
                  📦 {selectedCategory.name}
                  <button onClick={() => setCategoryId(null)} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {minPrice && (
                <Badge variant="secondary" className="gap-1 pr-1 text-xs">
                  Min ৳{minPrice}
                  <button onClick={() => setMinPrice("")} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {maxPrice && (
                <Badge variant="secondary" className="gap-1 pr-1 text-xs">
                  Max ৳{maxPrice}
                  <button onClick={() => setMaxPrice("")} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
                </Badge>
              )}
              <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive underline">
                Clear all
              </button>
            </div>
          )}

          {/* Products Grid / List */}
          {isLoading ? (
            <div className={view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            view === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <div className="flex gap-4 p-4 border rounded-xl bg-card hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-muted-foreground" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">{product.categoryName}</p>
                        <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2 mt-0.5">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-lg font-black text-primary">৳{product.price.toLocaleString()}</span>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <span className="text-sm text-muted-foreground line-through">৳{product.comparePrice.toLocaleString()}</span>
                          )}
                          {product.stock <= 0 && <Badge variant="destructive" className="text-xs">Out of Stock</Badge>}
                          {product.badge && product.stock > 0 && <Badge className="text-[10px]">{product.badge}</Badge>}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-muted/10">
              <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-black mb-2">No products found</h3>
              <p className="text-muted-foreground text-sm mb-6">Try adjusting your filters or search query.</p>
              <Button onClick={clearAll} variant="outline" className="rounded-full font-bold">
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}
