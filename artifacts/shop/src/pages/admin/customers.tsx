import { AdminLayout } from "@/components/layout/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Mail, Phone, CheckCircle2, XCircle } from "lucide-react";
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

export function AdminCustomers() {
  const { data, isLoading } = useAdminCustomers();
  const [search, setSearch] = useState("");

  const filtered = (data?.customers ?? []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" />
              Customers
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {data?.total ?? 0} total registered customers
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name, phone, email…"
              className="pl-9 h-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Customers", value: data?.total ?? 0, color: "text-primary" },
            { label: "Verified", value: (data?.customers ?? []).filter(c => c.isVerified).length, color: "text-green-600" },
            { label: "With Email", value: (data?.customers ?? []).filter(c => !!c.email).length, color: "text-blue-600" },
            { label: "Unverified", value: (data?.customers ?? []).filter(c => !c.isVerified).length, color: "text-amber-600" },
          ].map(s => (
            <div key={s.label} className="bg-card border rounded-xl p-4">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-14">ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}

              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    {search ? "No customers match your search." : "No customers registered yet."}
                  </TableCell>
                </TableRow>
              )}

              {filtered.map(c => (
                <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">#{c.id}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-black text-xs">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-semibold text-sm">{c.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="font-mono">{c.phone}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {c.email ? (
                      <div className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate max-w-[180px]">{c.email}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No email</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {c.isVerified ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1 font-semibold">
                        <XCircle className="w-3 h-3" /> Pending
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {c.createdAt ? format(new Date(c.createdAt), "MMM d, yyyy HH:mm") : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
