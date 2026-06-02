import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { StoreLayout } from "@/components/layout/store-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";

export function VerifyCodePage() {
  const { login } = useAuth();
  const [location, nav] = useLocation();
  const { toast } = useToast();

  const params = new URLSearchParams(location.split("?")[1] || "");
  const phone = params.get("phone") || "";
  const mode  = params.get("mode") || "activate"; /* activate | reset */

  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [demoCode, setDemoCode] = useState("");
  const [countdown, setCountdown] = useState(60);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const resend = async () => {
    setResending(true); setErr("");
    try {
      const r = await fetch("/api/otp/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
      const d = await r.json();
      if (d.demoMode && d.demoCode) setDemoCode(d.demoCode);
      setCountdown(60);
      toast({ title: "OTP resent!", description: `New code sent to ${phone}` });
    } finally { setResending(false); }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) { setErr("Enter the 6-digit code"); return; }
    setLoading(true); setErr("");
    try {
      /* Step 1: verify OTP */
      const vr = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const vd = await vr.json();
      if (!vr.ok) { setErr(vd.error || "Invalid code"); return; }

      if (mode === "activate") {
        /* Step 2a: activate customer account */
        const ar = await fetch("/api/customers/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });
        const ad = await ar.json();
        if (!ar.ok) { setErr(ad.error || "Activation failed"); return; }
        login(ad.token, ad.customer);
        toast({ title: "Account verified! 🎉", description: `Welcome, ${ad.customer.name}!` });
        nav("/profile");
      } else {
        /* Step 2b: redirect to new password page */
        toast({ title: "Phone verified!", description: "Now set your new password." });
        nav(`/auth/new-password?phone=${encodeURIComponent(phone)}`);
      }
    } catch { setErr("Network error. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <StoreLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-accent/20">
        <div className="w-full max-w-sm float-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 ring-1 ring-primary/20">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Verify Code</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              We sent a 6-digit code to<br />
              <strong className="text-foreground">{phone}</strong>
            </p>
          </div>

          <div className="bg-card border rounded-2xl shadow-lg p-8">
            {demoCode && (
              <div className="mb-5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Demo mode — your code:</p>
                <p className="text-2xl font-black tracking-[0.3em] font-mono text-amber-800 dark:text-amber-300 mt-1">{demoCode}</p>
              </div>
            )}

            <form onSubmit={verify} className="space-y-5">
              <div className="space-y-2">
                <Input
                  ref={inputRef}
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={e => { setCode(e.target.value.replace(/\D/g, "")); setErr(""); }}
                  className="h-14 text-center text-3xl font-black tracking-[0.4em] font-mono"
                  inputMode="numeric"
                />
              </div>

              {err && (
                <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2.5 font-medium text-center">
                  {err}
                </div>
              )}

              <Button type="submit" className="w-full h-12 font-bold text-base neon-glow" disabled={loading || code.length !== 6}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying…</> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Verify Code</>}
              </Button>
            </form>

            <div className="mt-5 text-center">
              {countdown > 0 ? (
                <p className="text-sm text-muted-foreground">Resend code in <span className="font-bold text-foreground">{countdown}s</span></p>
              ) : (
                <button onClick={resend} disabled={resending}
                  className="text-sm text-primary font-bold hover:underline flex items-center gap-1 mx-auto">
                  {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Resend code
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
