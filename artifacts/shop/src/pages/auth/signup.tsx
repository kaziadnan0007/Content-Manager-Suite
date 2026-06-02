import { useState } from "react";
import { Link, useLocation } from "wouter";
import { StoreLayout } from "@/components/layout/store-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Lock, Eye, EyeOff, Mail, UserPlus } from "lucide-react";

export function SignUpPage() {
  const [, nav] = useLocation();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (form.password !== form.confirm) { setErr("Passwords do not match"); return; }
    if (form.password.length < 6) { setErr("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone, email: form.email || undefined, password: form.password }),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Registration failed"); return; }

      /* Send OTP to verify phone */
      await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone }),
      });

      toast({ title: "OTP sent!", description: `Enter the code sent to ${form.phone}` });
      nav(`/auth/verify?phone=${encodeURIComponent(form.phone)}&mode=activate`);
    } catch { setErr("Network error. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <StoreLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-accent/20">
        <div className="w-full max-w-md float-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 ring-1 ring-primary/20">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Create Account</h1>
            <p className="text-muted-foreground mt-1">Join millions of shoppers on AcholGatha</p>
          </div>

          <div className="bg-card border rounded-2xl shadow-lg p-8">
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Mohammad Rahman" className="pl-9 h-11" value={form.name} onChange={set("name")} required autoFocus />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Phone Number * <span className="text-muted-foreground font-normal text-xs">(will be verified)</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="tel" placeholder="01XXXXXXXXX" className="pl-9 h-11" value={form.phone} onChange={set("phone")} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Email <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" placeholder="email@example.com" className="pl-9 h-11" value={form.email} onChange={set("email")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type={showPw ? "text" : "password"} placeholder="Min. 6 characters" className="pl-9 pr-10 h-11"
                    value={form.password} onChange={set("password")} required />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="password" placeholder="Repeat password" className="pl-9 h-11"
                    value={form.confirm} onChange={set("confirm")} required />
                </div>
              </div>

              {err && (
                <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2.5 font-medium">
                  {err}
                </div>
              )}

              <Button type="submit" className="w-full h-12 font-bold text-base neon-glow mt-1" disabled={loading}>
                {loading ? "Creating account…" : "Create Account & Verify Phone"}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-primary font-bold hover:underline">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
