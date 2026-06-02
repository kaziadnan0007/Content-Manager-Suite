import { useState } from "react";
import { useLocation } from "wouter";
import { StoreLayout } from "@/components/layout/store-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";

export function NewPasswordPage() {
  const { login } = useAuth();
  const [location, nav] = useLocation();
  const { toast } = useToast();

  const params = new URLSearchParams(location.split("?")[1] || "");
  const phone = params.get("phone") || "";

  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (pw.length < 6) { setErr("Password must be at least 6 characters"); return; }
    if (pw !== confirm) { setErr("Passwords do not match"); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/customers/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, newPassword: pw }),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Reset failed"); return; }
      login(d.token, d.customer);
      toast({ title: "Password updated! ✅", description: "You're now signed in." });
      nav("/profile");
    } catch { setErr("Network error. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <StoreLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-accent/20">
        <div className="w-full max-w-sm float-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 ring-1 ring-primary/20">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">New Password</h1>
            <p className="text-muted-foreground mt-1 text-sm">Set a new password for <strong>{phone}</strong></p>
          </div>

          <div className="bg-card border rounded-2xl shadow-lg p-8">
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <Label className="font-semibold">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type={showPw ? "text" : "password"} placeholder="Min. 6 characters" className="pl-9 pr-10 h-11"
                    value={pw} onChange={e => setPw(e.target.value)} required autoFocus />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="password" placeholder="Repeat password" className="pl-9 h-11"
                    value={confirm} onChange={e => setConfirm(e.target.value)} required />
                </div>
              </div>

              {err && (
                <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2.5 font-medium">
                  {err}
                </div>
              )}

              <Button type="submit" className="w-full h-12 font-bold text-base neon-glow" disabled={loading}>
                {loading ? "Saving…" : "Save New Password"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
