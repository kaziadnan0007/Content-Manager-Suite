import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { StoreLayout } from "@/components/layout/store-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  User, Phone, Mail, MapPin, Building2, Package, Heart, LogOut,
  CheckCircle2, Pencil, ChevronRight, Shield, Star, Gift, Zap,
  Trophy, TrendingUp, BadgeCheck, Copy, Share2, Clock,
} from "lucide-react";
import { BD_DISTRICTS } from "@/lib/bd-districts";
import { Badge } from "@/components/ui/badge";

function fakeLoyaltyPoints(phone: string) {
  let hash = 0;
  for (let i = 0; i < phone.length; i++) hash = (hash * 31 + phone.charCodeAt(i)) & 0xfffffff;
  return 120 + (hash % 880);
}
function fakeTotalOrders(phone: string) {
  let hash = 0;
  for (let i = 0; i < phone.length; i++) hash = (hash * 17 + phone.charCodeAt(i)) & 0xfffffff;
  return 2 + (hash % 14);
}
function getLoyaltyTier(points: number): { label: string; color: string; icon: string; next: number; nextLabel: string } {
  if (points >= 1000) return { label: "Diamond", color: "from-cyan-400 to-blue-500", icon: "💎", next: Infinity, nextLabel: "Max tier reached!" };
  if (points >= 500) return { label: "Gold", color: "from-yellow-400 to-amber-500", icon: "🥇", next: 1000, nextLabel: "Diamond" };
  if (points >= 200) return { label: "Silver", color: "from-gray-300 to-gray-400", icon: "🥈", next: 500, nextLabel: "Gold" };
  return { label: "Bronze", color: "from-orange-300 to-amber-400", icon: "🥉", next: 200, nextLabel: "Silver" };
}

export function ProfilePage() {
  const { customer, token, logout, updateCustomer } = useAuth();
  const [, nav] = useLocation();
  const { toast } = useToast();

  const [editing, setEditing] = useState(!customer?.address);
  const [form, setForm] = useState({ name: customer?.name || "", email: customer?.email || "", address: customer?.address || "", city: customer?.city || "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [referralCopied, setReferralCopied] = useState(false);

  useEffect(() => {
    if (customer) setForm({ name: customer.name, email: customer.email || "", address: customer.address || "", city: customer.city || "" });
    if (!customer?.address) setEditing(true);
  }, [customer]);

  if (!customer) {
    return (
      <StoreLayout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-black mb-2">Sign in to your account</h2>
            <p className="text-muted-foreground mb-6">Track orders, manage your profile and save your addresses.</p>
            <div className="flex gap-3 justify-center">
              <Button asChild className="neon-glow"><Link href="/auth/signin">Sign In</Link></Button>
              <Button variant="outline" asChild><Link href="/auth/signup">Create Account</Link></Button>
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  const points = fakeLoyaltyPoints(customer.phone);
  const totalOrders = fakeTotalOrders(customer.phone);
  const tier = getLoyaltyTier(points);
  const tierProgress = tier.next === Infinity ? 100 : Math.round((points / tier.next) * 100);
  const referralCode = `AG${customer.phone.slice(-4).toUpperCase()}`;
  const memberSince = "Jun 2025";

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setSaving(true);
    try {
      const r = await fetch("/api/customers/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Save failed"); return; }
      updateCustomer(d.customer);
      setEditing(false);
      toast({ title: "Profile updated! ✅" });
    } catch { setErr("Network error. Try again."); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => {
    await logout();
    nav("/");
    toast({ title: "Signed out successfully" });
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
    toast({ title: "Referral code copied! 🎁" });
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-10 max-w-4xl">

        {/* ── Hero profile card ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border rounded-2xl p-6 mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="flex items-start gap-5 flex-wrap">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-3xl font-black text-primary border-2 border-primary/30 shadow-lg">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-2 -right-2 text-xl">{tier.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h1 className="text-2xl font-black">{customer.name}</h1>
                <Badge className="text-[10px] font-black uppercase bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30">
                  {tier.label} Member
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-0.5">
                <Phone className="w-3.5 h-3.5" /> {customer.phone}
                <span className="ml-1 inline-flex items-center gap-0.5 text-green-600 font-medium text-xs">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </p>
              {customer.email && <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {customer.email}</p>}
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Member since {memberSince}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="flex-shrink-0">
              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
            </Button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Package, label: "Total Orders", value: totalOrders, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
            { icon: Star, label: "Loyalty Points", value: points.toLocaleString(), color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/20" },
            { icon: Trophy, label: "Tier Status", value: tier.label, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20" },
            { icon: TrendingUp, label: "Total Saved", value: `BDT ${(points * 2).toLocaleString()}`, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`${bg} border rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
              </div>
              <p className={`text-xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* ── Left column ── */}
          <div className="md:col-span-3 space-y-5">

            {/* Profile form */}
            <div className="bg-card border rounded-2xl p-6">
              <h2 className="font-black text-lg mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Profile Details
              </h2>
              {editing ? (
                <form onSubmit={save} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm">Full Name *</Label>
                    <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm">Email</Label>
                    <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="h-10" placeholder="optional" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm">Delivery Address</Label>
                    <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="h-10" placeholder="House, Road, Area" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm">District</Label>
                    <select
                      value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">— Select District —</option>
                      {BD_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  {err && <p className="text-sm text-destructive bg-destructive/8 rounded-lg px-3 py-2">{err}</p>}
                  <div className="flex gap-3 pt-1">
                    <Button type="submit" className="flex-1 neon-glow" disabled={saving}>{saving ? "Saving…" : "Save Profile"}</Button>
                    {customer.address && <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>}
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {[
                    { icon: User, label: "Name", value: customer.name },
                    { icon: Phone, label: "Phone", value: customer.phone },
                    { icon: Mail, label: "Email", value: customer.email || "Not set" },
                    { icon: MapPin, label: "Address", value: customer.address || "Not set" },
                    { icon: Building2, label: "City", value: customer.city || "Not set" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">{label}</p>
                        <p className={`font-semibold text-sm truncate ${!customer.address && label === "Address" ? "text-muted-foreground italic" : ""}`}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Loyalty Points Card */}
            <div className="bg-card border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" /> Loyalty Points
                </h2>
                <span className="text-2xl font-black text-yellow-500">{points.toLocaleString()} pts</span>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-xl p-4 border border-yellow-200/50 dark:border-yellow-800/30 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{tier.icon}</span>
                  <div>
                    <p className="font-black text-base">{tier.label} Tier</p>
                    {tier.next !== Infinity ? (
                      <p className="text-xs text-muted-foreground">{tier.next - points} pts to {tier.nextLabel}</p>
                    ) : (
                      <p className="text-xs text-primary font-bold">Highest tier — Congratulations! 🎉</p>
                    )}
                  </div>
                </div>
                {tier.next !== Infinity && (
                  <div>
                    <div className="h-2 w-full bg-white/60 dark:bg-black/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${tier.color} transition-all duration-700`}
                        style={{ width: `${tierProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>{points} pts</span>
                      <span>{tier.next} pts</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[
                  { label: "Earn 1 pt", desc: "per BDT 10 spent" },
                  { label: "Redeem", desc: "BDT 1 per 10 pts" },
                  { label: "Expires", desc: "Never (active)" },
                ].map((item) => (
                  <div key={item.label} className="bg-muted/50 rounded-lg p-2.5">
                    <p className="font-black text-foreground">{item.label}</p>
                    <p className="text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Right column ── */}
          <div className="md:col-span-2 space-y-4">

            {/* Quick links */}
            <div className="bg-card border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30">
                <p className="font-black text-sm">My Account</p>
              </div>
              {[
                { href: "/track-order", icon: Package, label: "My Orders", desc: "Track & view orders", badge: `${totalOrders} orders` },
                { href: "/wishlist", icon: Heart, label: "My Wishlist", desc: "Saved products" },
              ].map(({ href, icon: Icon, label, desc, badge }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b last:border-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  {badge && <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">{badge}</span>}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </div>

            {/* Referral card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-4 h-4 text-primary" />
                <span className="font-black text-sm">Refer & Earn</span>
                <Badge className="text-[9px] ml-auto">BDT 100 reward</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Share your code with friends. You both get BDT 100 when they place their first order!
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-background border rounded-lg px-3 py-2 flex items-center">
                  <span className="font-black text-sm text-primary tracking-widest font-mono">{referralCode}</span>
                </div>
                <button
                  onClick={copyReferral}
                  className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1"
                >
                  {referralCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {referralCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Security */}
            <div className="bg-card border rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-black text-sm">Security</span>
              </div>
              <Link href="/auth/reset-password"
                className="block w-full text-sm text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors font-medium text-muted-foreground hover:text-foreground">
                Change Password
              </Link>
              <button onClick={handleLogout}
                className="w-full text-sm text-left px-3 py-2 rounded-lg hover:bg-destructive/8 transition-colors font-medium text-destructive flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
