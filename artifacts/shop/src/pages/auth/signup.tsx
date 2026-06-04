import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { StoreLayout } from "@/components/layout/store-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Lock, Eye, EyeOff, Mail, UserPlus, ShieldCheck, CheckCircle2, Loader2, RefreshCw, ArrowLeft } from "lucide-react";

type Step = "form" | "otp" | "done";

export function SignUpPage() {
  const [, nav] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // OTP step state
  const [otp, setOtp] = useState("");
  const [otpErr, setOtpErr] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [demoCode, setDemoCode] = useState("");
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  function startCountdown() {
    setCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(countdownRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  // Step 1: validate form → send OTP
  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (form.password !== form.confirm) { setErr("Passwords do not match"); return; }
    if (form.password.length < 6) { setErr("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, email: form.email || undefined }),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Failed to send OTP"); return; }
      if (d.demoMode && d.demoCode) setDemoCode(d.demoCode);
      startCountdown();
      setStep("otp");
      toast({
        title: "OTP Sent!",
        description: d.emailSent
          ? `6-digit code sent to your email (${form.email})`
          : d.smsSent
          ? `Code sent via SMS to ${form.phone}`
          : `Demo mode — see the code below`,
      });
    } catch { setErr("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const resend = async () => {
    setResending(true); setOtpErr(""); setDemoCode("");
    try {
      const r = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, email: form.email || undefined }),
      });
      const d = await r.json();
      if (d.demoMode && d.demoCode) setDemoCode(d.demoCode);
      startCountdown();
      toast({ title: "OTP resent!" });
    } finally { setResending(false); }
  };

  // Step 2: verify OTP → register → login
  const verifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setOtpErr("Enter the 6-digit code"); return; }
    setOtpLoading(true); setOtpErr("");
    try {
      // 1. Verify OTP
      const vr = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, code: otp }),
      });
      const vd = await vr.json();
      if (!vr.ok) { setOtpErr(vd.error || "Incorrect code"); return; }

      // 2. Register account (OTP already verified — safe to create account now)
      const rr = await fetch("/api/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          password: form.password,
        }),
      });
      const rd = await rr.json();
      if (!rr.ok) { setOtpErr(rd.error || "Registration failed"); return; }

      // 3. Auto-login
      login(rd.token, rd.customer);
      toast({ title: "Account created! 🎉", description: `Welcome to AcholGatha, ${rd.customer.name}!` });
      nav("/profile");
    } catch { setOtpErr("Network error. Try again."); }
    finally { setOtpLoading(false); }
  };

  return (
    <StoreLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-accent/20">
        <div className="w-full max-w-md float-in">

          {/* ── Step indicator ── */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {[
              { n: 1, label: "Fill Form", active: step === "form", done: step !== "form" },
              { n: 2, label: "Verify OTP", active: step === "otp", done: step === "done" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-3">
                {i > 0 && <div className={`h-0.5 w-8 rounded-full transition-colors ${s.done || s.active ? "bg-primary" : "bg-muted"}`} />}
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all
                    ${s.done ? "bg-green-500 text-white" : s.active ? "bg-primary text-white shadow-[0_0_12px_rgba(0,212,255,0.5)]" : "bg-muted text-muted-foreground"}`}>
                    {s.done ? <CheckCircle2 className="w-4 h-4" /> : s.n}
                  </div>
                  <span className={`text-xs font-semibold ${s.active ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Step 1: Form ── */}
          {step === "form" && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3 ring-1 ring-primary/20">
                  <UserPlus className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl font-black tracking-tight">Create Account</h1>
                <p className="text-muted-foreground mt-1 text-sm">Join AcholGatha — Bangladesh's #1 Shop</p>
              </div>

              <div className="bg-card border rounded-2xl shadow-lg p-7">
                <form onSubmit={sendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-sm">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Mohammad Rahman" className="pl-9 h-11" value={form.name} onChange={set("name")} required autoFocus />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-semibold text-sm">Phone Number * <span className="text-muted-foreground font-normal">(OTP will be sent here)</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="tel" placeholder="01XXXXXXXXX" className="pl-9 h-11" value={form.phone} onChange={set("phone")} required />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-semibold text-sm">Email <span className="text-muted-foreground font-normal">(optional — OTP sent to email if provided)</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="email" placeholder="email@example.com" className="pl-9 h-11" value={form.email} onChange={set("email")} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-semibold text-sm">Password *</Label>
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

                  <div className="space-y-1.5">
                    <Label className="font-semibold text-sm">Confirm Password *</Label>
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

                  <Button type="submit" className="w-full h-12 font-bold text-base neon-glow" disabled={loading}>
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending OTP…</> : "Send OTP & Continue →"}
                  </Button>
                </form>

                <div className="mt-5 pt-4 border-t text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="text-primary font-bold hover:underline">Sign In</Link>
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: OTP Verify ── */}
          {step === "otp" && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3 ring-1 ring-primary/20">
                  <ShieldCheck className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl font-black tracking-tight">Enter OTP</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Code sent to{" "}
                  <strong className="text-foreground">
                    {form.email || form.phone}
                  </strong>
                </p>
              </div>

              <div className="bg-card border rounded-2xl shadow-lg p-7">
                {demoCode && (
                  <div className="mb-5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-xl text-center">
                    <p className="text-xs text-amber-700 font-medium">Demo mode — your code:</p>
                    <p className="text-2xl font-black tracking-[0.3em] font-mono text-amber-800 mt-1">{demoCode}</p>
                  </div>
                )}

                <form onSubmit={verifyAndRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm">6-Digit Code</Label>
                    <Input
                      placeholder="000000"
                      maxLength={6}
                      value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, "")); setOtpErr(""); }}
                      className="h-14 text-center text-3xl font-black tracking-[0.4em] font-mono"
                      inputMode="numeric"
                      autoFocus
                    />
                  </div>

                  {otpErr && (
                    <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2.5 font-medium text-center">
                      {otpErr}
                    </div>
                  )}

                  <Button type="submit" className="w-full h-12 font-bold text-base neon-glow" disabled={otpLoading || otp.length !== 6}>
                    {otpLoading
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Account…</>
                      : <><CheckCircle2 className="w-4 h-4 mr-2" />Verify & Create Account</>}
                  </Button>
                </form>

                <div className="mt-4 flex flex-col items-center gap-3 text-sm">
                  {countdown > 0 ? (
                    <p className="text-muted-foreground">Resend code in <strong className="text-foreground">{countdown}s</strong></p>
                  ) : (
                    <button onClick={resend} disabled={resending}
                      className="text-primary font-bold hover:underline flex items-center gap-1">
                      {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      Resend code
                    </button>
                  )}
                  <button onClick={() => { setStep("form"); setOtp(""); setOtpErr(""); }}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs">
                    <ArrowLeft className="w-3 h-3" /> Back to form
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}
