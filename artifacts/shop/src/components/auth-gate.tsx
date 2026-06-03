import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "./auth-context";
import { Link } from "wouter";
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  Loader2,
  UserPlus,
  LogIn,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────── */

interface AuthGateCtx {
  requireAuth: (action: () => void) => void;
}

const AuthGateContext = createContext<AuthGateCtx | null>(null);

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const { customer, login } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const pendingRef = useRef<(() => void) | null>(null);

  const requireAuth = useCallback(
    (action: () => void) => {
      if (customer) {
        action();
      } else {
        pendingRef.current = action;
        setTab("signin");
        setOpen(true);
      }
    },
    [customer]
  );

  const onSuccess = (token: string, cust: Parameters<typeof login>[1]) => {
    login(token, cust);
    setOpen(false);
    if (pendingRef.current) {
      const fn = pendingRef.current;
      pendingRef.current = null;
      setTimeout(fn, 50);
    }
  };

  return (
    <AuthGateContext.Provider value={{ requireAuth }}>
      {children}
      <AuthGateModal
        open={open}
        tab={tab}
        setTab={setTab}
        onClose={() => setOpen(false)}
        onSuccess={onSuccess}
      />
    </AuthGateContext.Provider>
  );
}

export function useAuthGate() {
  const ctx = useContext(AuthGateContext);
  if (!ctx) throw new Error("useAuthGate outside AuthGateProvider");
  return ctx;
}

/* ─── Modal ──────────────────────────────────────────────────────────────── */

function AuthGateModal({
  open,
  tab,
  setTab,
  onClose,
  onSuccess,
}: {
  open: boolean;
  tab: "signin" | "signup";
  setTab: (t: "signin" | "signup") => void;
  onClose: () => void;
  onSuccess: (token: string, customer: Parameters<ReturnType<typeof useAuth>["login"]>[1]) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <DialogTitle className="sr-only">Sign in to continue</DialogTitle>

        {/* Header */}
        <div className="store-header-main px-6 py-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">AcholGatha</span>
          </div>
          <p className="text-white/80 text-sm font-medium">
            Sign in to add items to your cart &amp; place orders
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b">
          <button
            onClick={() => setTab("signin")}
            className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-1.5 ${
              tab === "signin"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-1.5 ${
              tab === "signup"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="w-4 h-4" /> Create Account
          </button>
        </div>

        <div className="p-6">
          {tab === "signin" ? (
            <SignInForm onSuccess={onSuccess} />
          ) : (
            <SignUpRedirect onClose={onClose} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Inline Sign-In Form ────────────────────────────────────────────────── */

function SignInForm({
  onSuccess,
}: {
  onSuccess: (token: string, customer: Parameters<ReturnType<typeof useAuth>["login"]>[1]) => void;
}) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), password }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error || "Invalid phone or password");
        return;
      }
      onSuccess(d.token, d.customer);
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label className="font-semibold text-sm">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="tel"
            placeholder="01XXXXXXXXX"
            className="pl-9 h-11"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoFocus
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-semibold text-sm">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type={showPw ? "text" : "password"}
            placeholder="Your password"
            className="pl-9 pr-10 h-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {err && (
        <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2.5 font-medium">
          {err}
        </div>
      )}

      <Button type="submit" className="w-full h-12 font-bold text-base neon-glow" disabled={loading}>
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in…</>
        ) : (
          "Sign In & Continue"
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <Link href="/auth/reset-password" className="text-primary hover:underline font-medium">
          Forgot password?
        </Link>
      </div>
    </form>
  );
}

/* ─── Sign-Up redirect note ──────────────────────────────────────────────── */

function SignUpRedirect({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
        <UserPlus className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h3 className="font-black text-lg">New to AcholGatha?</h3>
        <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
          Create a free account to shop, track orders, and get exclusive deals.
        </p>
      </div>
      <Button asChild size="lg" className="w-full h-12 font-bold neon-glow" onClick={onClose}>
        <Link href="/auth/signup">Create Account →</Link>
      </Button>
      <p className="text-xs text-muted-foreground">
        Already have an account?{" "}
        <button
          onClick={() => {}}
          className="text-primary font-medium hover:underline"
          type="button"
        >
          Sign in above
        </button>
      </p>
    </div>
  );
}
