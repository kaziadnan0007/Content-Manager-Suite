import { useState } from "react";
import { useLocation } from "wouter";
import { StoreLayout } from "@/components/layout/store-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone, ArrowRight, KeyRound } from "lucide-react";

export function ResetPasswordPage() {
  const [, nav] = useLocation();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const r = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!r.ok) { const d = await r.json(); setErr(d.error || "Failed to send OTP"); return; }
      toast({ title: "OTP sent!", description: `Verification code sent to ${phone}` });
      nav(`/auth/verify?phone=${encodeURIComponent(phone)}&mode=reset`);
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
            <h1 className="text-3xl font-black tracking-tight">Reset Password</h1>
            <p className="text-muted-foreground mt-1 text-sm">Enter your phone number to receive a verification code</p>
          </div>

          <div className="bg-card border rounded-2xl shadow-lg p-8">
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <Label className="font-semibold">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="tel" placeholder="01XXXXXXXXX" className="pl-9 h-11"
                    value={phone} onChange={e => setPhone(e.target.value)} required autoFocus />
                </div>
              </div>

              {err && (
                <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2.5 font-medium">
                  {err}
                </div>
              )}

              <Button type="submit" className="w-full h-12 font-bold text-base neon-glow" disabled={loading}>
                {loading ? "Sending…" : <><ArrowRight className="w-4 h-4 mr-2" /> Send Verification Code</>}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <a href="/auth/signin" className="text-primary font-bold hover:underline">Sign In</a>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
