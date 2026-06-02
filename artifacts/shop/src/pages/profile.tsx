import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { StoreLayout } from "@/components/layout/store-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Mail, MapPin, Building2, Package, Heart, LogOut, CheckCircle2, Pencil, ChevronRight, Shield } from "lucide-react";
import { BD_DISTRICTS } from "@/lib/bd-districts";

export function ProfilePage() {
  const { customer, token, logout, updateCustomer } = useAuth();
  const [, nav] = useLocation();
  const { toast } = useToast();

  const [editing, setEditing] = useState(!customer?.address);
  const [form, setForm] = useState({ name: customer?.name || "", email: customer?.email || "", address: customer?.address || "", city: customer?.city || "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

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

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Header card */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/30 border rounded-2xl p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-black text-primary border-2 border-primary/30 flex-shrink-0">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black truncate">{customer.name}</h1>
            <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> {customer.phone}
              <span className="ml-1 inline-flex items-center gap-0.5 text-green-600 font-medium text-xs">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            </p>
            {customer.email && <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5"><Mail className="w-3.5 h-3.5" /> {customer.email}</p>}
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="flex-shrink-0">
            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
          </Button>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Profile form */}
          <div className="md:col-span-3">
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
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
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
                    { icon: Mail, label: "Email", value: customer.email || "—" },
                    { icon: MapPin, label: "Address", value: customer.address || "—" },
                    { icon: Building2, label: "City", value: customer.city || "—" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">{label}</p>
                        <p className="font-semibold text-sm truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-2 space-y-3">
            <div className="bg-card border rounded-2xl overflow-hidden">
              {[
                { href: "/track-order", icon: Package, label: "My Orders", desc: "Track & view orders" },
                { href: "/wishlist", icon: Heart, label: "My Wishlist", desc: "Saved products" },
              ].map(({ href, icon: Icon, label, desc }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b last:border-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </div>

            <div className="bg-card border rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm">Security</span>
              </div>
              <Link href={`/auth/reset-password`}
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
