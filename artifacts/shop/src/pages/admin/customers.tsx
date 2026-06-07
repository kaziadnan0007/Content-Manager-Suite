import { AdminLayout } from "@/components/layout/admin-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Search, Mail, Phone, CheckCircle2, XCircle,
  Trash2, UserPlus, Eye, EyeOff,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  isVerified: boolean;
  createdAt: string;
}

function useAdminCustomers() {
  return useQuery<{ customers: Customer[]; total: number }>({
    queryKey: ["/api/admin/customers"],
    queryFn: async () => {
      const r = await fetch("/api/admin/customers");
      if (!r.ok) throw new Error("Failed to load customers");
      return r.json();
    },
    refetchInterval: 30_000,
  });
}

function AddCustomerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return toast({ title: "Name and phone required", variant: "destructive" });
    setLoading(true);
    try {
      const r = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed");
      toast({ title: "Customer added!", description: `${form.name} registered successfully.` });
      qc.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      setForm({ name: "", phone: "", email: "", password: "" });
      onClose();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" /> Add Customer
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <Input placeholder="e.g. Ahmed Rahman" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label>Phone Number *</Label>
            <Input placeholder="e.g. 01XXXXXXXXX" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label>Email (optional)</Label>
            <Input type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Password <span className="text-muted-foreground text-xs">(default: 123456)</span></Label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                placeholder="Min 6 characters"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? "Adding…" : <><UserPlus className="w-4 h-4" /> Add Customer</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminCustomers() {
  const { data, isLoading } = useAdminCustomers();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filtered = (data?.customers ?? []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const deleteCustomer = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const r = await fetch(`/api/admin/customers/${deleteId}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete");
      toast({ title: "Customer deleted" });
      qc.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      setDeleteId(null);
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const statCards = [
    { label: "Total Customers", value: data?.total ?? 0, color: "#60a5fa", bg: "rgba(37,99,235,.15)" },
    { label: "Verified", value: (data?.customers ?? []).filter(c => c.isVerified).length, color: "#4ade80", bg: "rgba(34,197,94,.15)" },
    { label: "With Email", value: (data?.customers ?? []).filter(c => !!c.email).length, color: "#06b6d4", bg: "rgba(6,182,212,.15)" },
    { label: "Unverified", value: (data?.customers ?? []).filter(c => !c.isVerified).length, color: "#fbbf24", bg: "rgba(234,179,8,.15)" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" /> Customers
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {data?.total ?? 0} total registered customers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search name, phone, email…"
                className="pl-9 h-10 w-64"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setAddOpen(true)} className="gap-2 h-10 font-bold"
              style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
              <UserPlus className="w-4 h-4" /> Add Customer
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map(s => (
            <div key={s.label} className="rounded-xl p-4 border"
              style={{ background: s.bg, borderColor: s.color + "30" }}>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table — scrollable on mobile */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "rgba(255,255,255,.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b"
                  style={{ background: "rgba(255,255,255,.04)", borderColor: "rgba(255,255,255,.07)" }}>
                  <th className="px-4 py-3 text-left w-14">ID</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-4 py-3 text-right w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,.05)" }}>
                {isLoading && Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse w-3/4" style={{ background: "rgba(255,255,255,.08)" }} />
                      </td>
                    ))}
                  </tr>
                ))}

                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-muted-foreground">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">{search ? "No customers match your search." : "No customers registered yet."}</p>
                    </td>
                  </tr>
                )}

                {filtered.map(c => (
                  <tr
                    key={c.id}
                    className="text-sm transition-colors"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.03)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{c.id}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-xs"
                          style={{ background: "linear-gradient(135deg, #2563eb, #06b6d4)" }}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-foreground truncate max-w-[140px]">{c.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="font-mono text-sm">{c.phone}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {c.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <span className="text-blue-400 truncate text-xs max-w-[160px]">{c.email}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No email</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {c.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(34,197,94,.15)", color: "#4ade80" }}>
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(234,179,8,.15)", color: "#fbbf24" }}>
                          <XCircle className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {c.createdAt ? format(new Date(c.createdAt), "MMM d, yyyy") : "—"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all ml-auto"
                        style={{ color: "rgba(255,255,255,.25)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,.15)"; (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.25)"; }}
                        title="Delete customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add modal */}
      <AddCustomerModal open={addOpen} onClose={() => setAddOpen(false)} />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer account and all their session data. Orders will remain in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCustomer}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {deleteLoading ? "Deleting…" : <><Trash2 className="w-4 h-4" /> Delete</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
