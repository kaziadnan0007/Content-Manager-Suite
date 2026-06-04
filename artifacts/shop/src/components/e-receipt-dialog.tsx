import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { useRef } from "react";

interface ReceiptItem {
  productName: string;
  quantity: number;
  price: number;
}

interface ReceiptOrder {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress?: string | null;
  note?: string | null;
  paymentMethod: string;
  paymentNumber?: string | null;
  transactionId?: string | null;
  total: number;
  status: string;
  createdAt: string;
  items: ReceiptItem[];
}

interface Props {
  order: ReceiptOrder | null;
  open: boolean;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending:    { bg: "#fefce8", text: "#a16207", border: "#fde68a" },
  confirmed:  { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  processing: { bg: "#eef2ff", text: "#4338ca", border: "#c7d2fe" },
  shipped:    { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe" },
  delivered:  { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  cancelled:  { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
};

export function EReceiptDialog({ order, open, onClose }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const dateStr = new Date(order.createdAt).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const subtotal = order.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const sc = STATUS_COLORS[order.status] ?? { bg: "#f9fafb", text: "#374151", border: "#e5e7eb" };
  const refCode = `AG-${String(order.id).padStart(6, "0")}`;

  const handlePrint = () => {
    const el = receiptRef.current;
    if (!el) return;
    const printWindow = document.createElement("iframe");
    printWindow.style.position = "fixed";
    printWindow.style.top = "-9999px";
    printWindow.style.left = "-9999px";
    printWindow.style.width = "0";
    printWindow.style.height = "0";
    document.body.appendChild(printWindow);
    const doc = printWindow.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><title>Receipt #${order.id}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;padding:20px;}
  @page{margin:1cm;}
</style>
</head><body>${el.innerHTML}</body></html>`);
    doc.close();
    printWindow.contentWindow?.focus();
    printWindow.contentWindow?.print();
    setTimeout(() => document.body.removeChild(printWindow), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b flex-row items-center justify-between">
          <DialogTitle className="text-lg font-bold">E-Receipt — Order #{order.id}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {/* Print button bar */}
        <div className="px-6 py-3 border-b bg-muted/30 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Preview of the receipt below. Click Print to send to printer or save as PDF.</p>
          <Button onClick={handlePrint} className="gap-2 shrink-0 neon-glow">
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </Button>
        </div>

        {/* ── Receipt body (ref'd for printing) ── */}
        <div ref={receiptRef} className="p-6">

          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,#0a1628 0%,#0d2044 100%)", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#00D4FF", letterSpacing: -0.5 }}>AcholGatha</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 3 }}>Bangladesh's #1 Online Shop</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>E-Receipt</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>#{order.id}</div>
            </div>
          </div>

          {/* Status bar */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 8px 8px", padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>📅 {dateStr} (Dhaka)</span>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: sc.text, background: sc.bg, border: `1px solid ${sc.border}`, padding: "2px 10px", borderRadius: 999 }}>
              {order.status}
            </span>
          </div>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#94a3b8", marginBottom: 6 }}>👤 Customer</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{order.customerName}</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>📞 {order.customerPhone}</div>
              {order.customerAddress && <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>📍 {order.customerAddress}</div>}
            </div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#94a3b8", marginBottom: 6 }}>💳 Payment</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", textTransform: "uppercase" }}>{order.paymentMethod}</div>
              {order.paymentNumber && <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>Sender: {order.paymentNumber}</div>}
              {order.transactionId && <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>TrxID: {order.transactionId}</div>}
              {!order.paymentNumber && !order.transactionId && <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>Pay on delivery</div>}
            </div>
          </div>

          {order.note && (
            <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "#713f12" }}>
              <strong>📝 Note:</strong> {order.note}
            </div>
          )}

          {/* Items table */}
          <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#94a3b8", marginBottom: 8 }}>Order Items</div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8", padding: "4px 4px 8px" }}>Product</th>
                <th style={{ textAlign: "center", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8", padding: "4px 4px 8px" }}>Qty</th>
                <th style={{ textAlign: "right", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8", padding: "4px 4px 8px" }}>Unit</th>
                <th style={{ textAlign: "right", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8", padding: "4px 4px 8px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 4px", fontSize: 13, fontWeight: 600 }}>{item.productName}</td>
                  <td style={{ padding: "8px 4px", fontSize: 13, textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "8px 4px", fontSize: 13, textAlign: "right" }}>BDT {Number(item.price).toLocaleString()}</td>
                  <td style={{ padding: "8px 4px", fontSize: 13, fontWeight: 700, textAlign: "right" }}>BDT {(Number(item.price) * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569", padding: "3px 0" }}>
              <span>Subtotal ({order.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>BDT {subtotal.toLocaleString()}</span>
            </div>
            {Number(order.total) - subtotal > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569", padding: "3px 0" }}>
                <span>Delivery</span>
                <span>BDT {(Number(order.total) - subtotal).toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 900, color: "#00a8cc", borderTop: "2px dashed #e2e8f0", marginTop: 8, paddingTop: 10 }}>
              <span>Grand Total</span>
              <span>BDT {Number(order.total).toLocaleString()}</span>
            </div>
          </div>

          {/* Reference */}
          <div style={{ textAlign: "center", marginTop: 18 }}>
            <div style={{ display: "inline-block", background: "#f8fafc", border: "1px dashed #e2e8f0", borderRadius: 8, padding: "6px 20px" }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "#94a3b8", letterSpacing: "0.15em", textTransform: "uppercase" }}>Order Reference</div>
              <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 800, color: "#1e293b", letterSpacing: "0.1em" }}>{refCode}</div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: "linear-gradient(135deg,#0a1628 0%,#0d2044 100%)", borderRadius: 10, padding: "14px 20px", textAlign: "center", marginTop: 16 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
              Thank you for shopping with <strong style={{ color: "#00D4FF" }}>AcholGatha</strong>! 🎉
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
              Computer-generated receipt — valid without signature.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
