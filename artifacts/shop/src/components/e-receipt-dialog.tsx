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

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pending:    { bg: "#fffbeb", text: "#b45309", border: "#fcd34d", label: "PENDING" },
  confirmed:  { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7", label: "CONFIRMED" },
  processing: { bg: "#eff6ff", text: "#1e40af", border: "#93c5fd", label: "PROCESSING" },
  shipped:    { bg: "#f5f3ff", text: "#5b21b6", border: "#c4b5fd", label: "SHIPPED" },
  delivered:  { bg: "#f0fdf4", text: "#14532d", border: "#86efac", label: "DELIVERED" },
  cancelled:  { bg: "#fef2f2", text: "#991b1b", border: "#fca5a5", label: "CANCELLED" },
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
  const delivery = Number(order.total) - subtotal;
  const ss = STATUS_STYLES[order.status] ?? { bg: "#f9fafb", text: "#374151", border: "#e5e7eb", label: order.status.toUpperCase() };
  const refCode = `AG-${String(order.id).padStart(6, "0")}`;

  const handlePrint = () => {
    const el = receiptRef.current;
    if (!el) return;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:0;height:0;";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><title>Receipt ${refCode}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;background:#fff;}@page{margin:1cm;}</style>
</head><body>${el.innerHTML}</body></html>`);
    doc.close();
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b flex-row items-center justify-between">
          <DialogTitle className="text-lg font-bold tracking-tight">E-Receipt — {refCode}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="px-6 py-3 border-b bg-muted/20 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Preview receipt below. Print or save as PDF.</p>
          <Button onClick={handlePrint} className="gap-2 shrink-0 neon-glow">
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </Button>
        </div>

        {/* Receipt Body */}
        <div ref={receiptRef} style={{ padding: "24px", background: "#fff", fontFamily: "'Segoe UI', Arial, sans-serif" }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f2a4a 100%)",
            borderRadius: "14px 14px 0 0",
            padding: "22px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#00D4FF", letterSpacing: "-0.5px", lineHeight: 1 }}>AcholGatha</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", marginTop: 5 }}>Bangladesh's #1 Online Shop</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>E-RECEIPT</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#ffffff", letterSpacing: "-1px", lineHeight: 1.1 }}>#{order.id}</div>
              <div style={{ fontSize: 10, color: "rgba(0,212,255,0.7)", fontWeight: 600, marginTop: 2, letterSpacing: "0.05em" }}>{refCode}</div>
            </div>
          </div>

          {/* Status & Date Bar */}
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderTop: "none",
            borderRadius: "0 0 10px 10px",
            padding: "9px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}>
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>📅 {dateStr} (Dhaka)</span>
            <span style={{
              fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em",
              color: ss.text, background: ss.bg,
              border: `1.5px solid ${ss.border}`,
              padding: "3px 12px", borderRadius: 999,
            }}>{ss.label}</span>
          </div>

          {/* Info Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            {/* Customer */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "3px solid #00D4FF", borderRadius: 10, padding: "13px 15px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#94a3b8", marginBottom: 7 }}>👤 Customer</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{order.customerName}</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>📞 {order.customerPhone}</div>
              {order.customerAddress && <div style={{ fontSize: 11, color: "#64748b", marginTop: 3, lineHeight: 1.5 }}>📍 {order.customerAddress}</div>}
            </div>
            {/* Payment */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "3px solid #10b981", borderRadius: 10, padding: "13px 15px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#94a3b8", marginBottom: 7 }}>💳 Payment</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", textTransform: "uppercase" }}>{order.paymentMethod}</div>
              {order.paymentNumber && <div style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>Sender: {order.paymentNumber}</div>}
              {order.transactionId && <div style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>TrxID: {order.transactionId}</div>}
              {!order.paymentNumber && !order.transactionId && <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>Cash on Delivery</div>}
            </div>
          </div>

          {order.note && (
            <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 8, padding: "9px 13px", marginBottom: 16, fontSize: 12, color: "#713f12" }}>
              <strong>📝 Note:</strong> {order.note}
            </div>
          )}

          {/* Items Table */}
          <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "#94a3b8", marginBottom: 9 }}>Order Items</div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 4 }}>
            <thead>
              <tr style={{ background: "#f1f5f9", borderRadius: 6 }}>
                <th style={{ textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", padding: "7px 8px 7px 10px", borderRadius: "6px 0 0 6px" }}>Product</th>
                <th style={{ textAlign: "center", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", padding: "7px 8px" }}>Qty</th>
                <th style={{ textAlign: "right", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", padding: "7px 8px" }}>Unit</th>
                <th style={{ textAlign: "right", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", padding: "7px 10px 7px 8px", borderRadius: "0 6px 6px 0" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "9px 8px 9px 10px", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{item.productName}</td>
                  <td style={{ padding: "9px 8px", fontSize: 13, textAlign: "center", color: "#475569" }}>{item.quantity}</td>
                  <td style={{ padding: "9px 8px", fontSize: 13, textAlign: "right", color: "#475569" }}>BDT {Number(item.price).toLocaleString()}</td>
                  <td style={{ padding: "9px 10px 9px 8px", fontSize: 13, fontWeight: 700, textAlign: "right", color: "#0f172a" }}>BDT {(Number(item.price) * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: 12, marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", padding: "3px 0" }}>
              <span>Subtotal ({order.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>BDT {subtotal.toLocaleString()}</span>
            </div>
            {delivery > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", padding: "3px 0" }}>
                <span>Delivery</span>
                <span>BDT {delivery.toLocaleString()}</span>
              </div>
            )}
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 18, fontWeight: 900,
              background: "linear-gradient(135deg, #065f46, #047857)",
              color: "#ffffff",
              borderRadius: 10,
              padding: "10px 16px",
              marginTop: 10,
            }}>
              <span>Grand Total</span>
              <span>BDT {Number(order.total).toLocaleString()}</span>
            </div>
          </div>

          {/* Order Reference */}
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <div style={{
              display: "inline-block",
              background: "#f8fafc",
              border: "2px dashed #cbd5e1",
              borderRadius: 10,
              padding: "8px 28px",
            }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, color: "#94a3b8", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 3 }}>Order Reference</div>
              <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 900, color: "#0f172a", letterSpacing: "0.12em" }}>{refCode}</div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
            borderRadius: 12,
            padding: "16px 24px",
            textAlign: "center",
            marginTop: 18,
          }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
              Thank you for shopping with <strong style={{ color: "#00D4FF" }}>AcholGatha</strong>! 🎉
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
              Computer-generated receipt · Valid without signature
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
