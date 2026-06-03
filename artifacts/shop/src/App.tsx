import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartProvider } from "@/components/cart-context";
import { AuthProvider } from "@/components/auth-context";
import { AuthGateProvider } from "@/components/auth-gate";
import NotFound from "@/pages/not-found";
import { Home } from "@/pages/home";
import { ProductsPage } from "@/pages/products";
import { ProductDetailPage } from "@/pages/product-detail";
import { CheckoutPage } from "@/pages/checkout";
import { OrderSuccessPage } from "@/pages/order-success";
import { TrackOrderPage } from "@/pages/track-order";
import { AdminLoginPage } from "@/pages/admin/login";
import { AdminDashboard } from "@/pages/admin/index";
import { AdminProducts } from "@/pages/admin/products";
import { AdminCategories } from "@/pages/admin/categories";
import { AdminOrders } from "@/pages/admin/orders";
import { AdminBanners } from "@/pages/admin/banners";
import { AdminSettings } from "@/pages/admin/settings";
import { WishlistPage } from "@/pages/wishlist";
import { SignInPage } from "@/pages/auth/signin";
import { SignUpPage } from "@/pages/auth/signup";
import { VerifyCodePage } from "@/pages/auth/verify";
import { NewPasswordPage } from "@/pages/auth/new-password";
import { ResetPasswordPage } from "@/pages/auth/reset-password";
import { ProfilePage } from "@/pages/profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:id" component={ProductDetailPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/order-success" component={OrderSuccessPage} />
      <Route path="/track-order" component={TrackOrderPage} />
      <Route path="/wishlist" component={WishlistPage} />
      <Route path="/auth/signin" component={SignInPage} />
      <Route path="/auth/signup" component={SignUpPage} />
      <Route path="/auth/verify" component={VerifyCodePage} />
      <Route path="/auth/new-password" component={NewPasswordPage} />
      <Route path="/auth/reset-password" component={ResetPasswordPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/banners" component={AdminBanners} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="shopbd-theme">
        <AuthProvider>
          <CartProvider>
            <AuthGateProvider>
              <TooltipProvider>
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <Router />
                </WouterRouter>
                <Toaster />
              </TooltipProvider>
            </AuthGateProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
