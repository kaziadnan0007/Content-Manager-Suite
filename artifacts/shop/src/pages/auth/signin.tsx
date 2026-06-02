import { useState } from "react";
import { Link, useLocation } from "wouter";
import { StoreLayout } from "@/components/layout/store-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Phone, Lock, Eye, EyeOff, LogIn, ShoppingBag } from "lucide-react";

export function SignInPage() {
  const { login } = useAuth();
  const [, nav] = useLocation();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const r = await fetch("/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const d = await r.json();
      if (!r.ok) {
        if (d.needsVerification) {
          toast({ title: "Phone not verified", description: "Please verify your phone first." });
          nav(`/auth/verify?phone=${encodeURIComponent(phone)}&mode=activate`);
          return;
        }
        setErr(d.error || "Login failed");
        return;
      }
      login(d.token, d.customer);
      toast({ title: `Welcome back, ${d.customer.name}! 👋` });
      nav("/profile");
    } catch { setErr("Network error. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <StoreLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-accent/20">
        <div className="w-full max-w-md float-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 ring-1 ring-primary/20">
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground mt-1">Sign in to your AcholGatha account</p>
          </div>

          <div className="bg-card border rounded-2xl shadow-lg p-8">
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="phone" type="tel" placeholder="01XXXXXXXXX" className="pl-9 h-11"
                    value={phone} onChange={e => setPhone(e.target.value)} required autoFocus />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pw" className="font-semibold">Password</Label>
                  <Link href="/auth/reset-password" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="pw" type={showPw ? "text" : "password"} placeholder="Your password" className="pl-9 pr-10 h-11"
                    value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
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
                {loading ? "Signing in…" : <><LogIn className="w-4 h-4 mr-2" /> Sign In</>}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t text-center text-sm text-muted-foreground">
              New to AcholGatha?{" "}
              <Link href="/auth/signup" className="text-primary font-bold hover:underline">Create free account</Link>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            🔒 Your data is protected with end-to-end encryption
          </p>
        </div>
      </div>
    </StoreLayout>
  );
}
