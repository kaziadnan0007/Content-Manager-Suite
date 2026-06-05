interface ReceiptItem {
  productName: string;
  productImage?: string | null;
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

export function printReceipt(order: ReceiptOrder, siteName = "AcholGatha") {
  const dateStr = new Date(order.createdAt).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const STATUS_STYLES: Record<string, { color: string; bg: string; border: string }> = {
    pending:    { color: "#b45309", bg: "#fffbeb", border: "#fcd34d" },
    confirmed:  { color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7" },
    processing: { color: "#1e40af", bg: "#eff6ff", border: "#93c5fd" },
    shipped:    { color: "#5b21b6", bg: "#f5f3ff", border: "#c4b5fd" },
    delivered:  { color: "#14532d", bg: "#f0fdf4", border: "#86efac" },
    cancelled:  { color: "#991b1b", bg: "#fef2f2", border: "#fca5a5" },
  };
  const ss = STATUS_STYLES[order.status] ?? { color: "#374151", bg: "#f9fafb", border: "#e5e7eb" };
  const refCode = `AG-${String(order.id).padStart(6, "0")}`;

  const subtotal = order.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const deliveryNote = order.note ?? "";
  const isInsideDhaka = deliveryNote.includes("Inside Dhaka");
  const isOutsideDhaka = deliveryNote.includes("Outside Dhaka");
  const deliveryCharge = isInsideDhaka ? 60 : isOutsideDhaka ? 120 : Number(order.total) - subtotal;
  const showDeliveryLine = isInsideDhaka || isOutsideDhaka || deliveryCharge > 0;

  const itemRows = order.items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#f9fafb"};">
      <td style="padding:9px 8px 9px 10px;font-weight:600;font-size:13px;color:#1e293b;">${item.productName}</td>
      <td style="padding:9px 8px;text-align:center;font-size:13px;color:#475569;">${item.quantity}</td>
      <td style="padding:9px 8px;text-align:right;font-size:13px;color:#475569;">BDT ${Number(item.price).toLocaleString()}</td>
      <td style="padding:9px 10px 9px 8px;text-align:right;font-weight:700;font-size:13px;color:#0f172a;">BDT ${(Number(item.price) * item.quantity).toLocaleString()}</td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${refCode} — ${siteName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; color: #1a1a2e; }
    .page { max-width: 680px; margin: 28px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.13); }

    /* Header */
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f2a4a 100%);
      padding: 26px 32px 22px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .brand-name { font-size: 24px; font-weight: 900; color: #00D4FF; letter-spacing: -0.5px; line-height: 1; }
    .brand-sub { font-size: 9px; color: rgba(255,255,255,0.4); font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; margin-top: 5px; }
    .receipt-label { font-size: 9px; color: rgba(255,255,255,0.4); font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; text-align: right; }
    .receipt-id { font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -1px; line-height: 1.1; text-align: right; }
    .receipt-ref { font-size: 10px; color: rgba(0,212,255,0.7); font-weight: 600; margin-top: 2px; letter-spacing: 0.05em; text-align: right; }

    /* Status bar */
    .status-bar {
      background: #f8fafc; border-bottom: 1px solid #e2e8f0;
      padding: 10px 32px; display: flex; align-items: center; justify-content: space-between; font-size: 11px;
    }
    .date-text { color: #64748b; font-weight: 500; }
    .status-pill {
      display: inline-block; padding: 3px 13px; border-radius: 999px;
      font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;
      color: ${ss.color}; background: ${ss.bg}; border: 1.5px solid ${ss.border};
    }

    /* Body */
    .body { padding: 26px 32px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 13px 15px; }
    .info-box.customer { border-left: 3px solid #00D4FF; }
    .info-box.payment  { border-left: 3px solid #10b981; }
    .info-box h4 { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 7px; }
    .info-row { font-size: 13px; line-height: 1.65; }
    .info-row strong { font-weight: 700; color: #0f172a; }
    .info-row span { color: #475569; font-size: 12px; }

    .section-title { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.18em; color: #94a3b8; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; }
    thead { background: #f1f5f9; }
    thead th { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; padding: 7px 8px; }
    thead th:first-child { text-align: left; padding-left: 10px; }
    thead th:nth-child(2) { text-align: center; }
    thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
    thead th:last-child { padding-right: 10px; }

    .totals { margin-top: 12px; border-top: 2px solid #e2e8f0; padding-top: 12px; }
    .total-row { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; color: #64748b; }
    .grand-total {
      display: flex; justify-content: space-between;
      background: linear-gradient(135deg, #065f46, #047857);
      color: #fff; font-size: 18px; font-weight: 900;
      border-radius: 10px; padding: 11px 16px; margin-top: 10px;
    }

    .order-ref { text-align: center; margin-top: 20px; }
    .order-ref-box {
      display: inline-block; background: #f8fafc;
      border: 2px dashed #cbd5e1; border-radius: 10px; padding: 8px 28px;
    }
    .order-ref-label { font-family: monospace; font-size: 9px; color: #94a3b8; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 3px; }
    .order-ref-code { font-family: monospace; font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: 0.12em; }

    .footer {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
      padding: 18px 32px; text-align: center;
    }
    .footer p { font-size: 12px; color: rgba(255,255,255,0.55); line-height: 1.7; }
    .footer strong { color: #00D4FF; }

    .no-print { text-align: center; padding: 16px 0 4px; }
    .btn-print {
      background: linear-gradient(135deg, #00D4FF, #0099cc);
      color: #0f172a; font-weight: 800; font-size: 14px;
      padding: 10px 32px; border: none; border-radius: 8px; cursor: pointer; margin-right: 8px;
    }
    .btn-close {
      background: #f1f5f9; color: #475569; font-weight: 700; font-size: 14px;
      padding: 10px 24px; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;
    }

    @media print {
      body { background: #fff; }
      .page { margin: 0; border-radius: 0; box-shadow: none; max-width: 100%; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

<div class="no-print">
  <button class="btn-print" onclick="window.print()">🖨️ Print Receipt</button>
  <button class="btn-close" onclick="window.close()">Close</button>
</div>

<div class="page">
  <div class="header">
    <div>
      <div class="brand-name">${siteName}</div>
      <div class="brand-sub">Bangladesh's #1 Online Shop</div>
    </div>
    <div>
      <div class="receipt-label">E-Receipt</div>
      <div class="receipt-id">#${order.id}</div>
      <div class="receipt-ref">${refCode}</div>
    </div>
  </div>

  <div class="status-bar">
    <span class="date-text">📅 ${dateStr} (Dhaka)</span>
    <span class="status-pill">${order.status.toUpperCase()}</span>
  </div>

  <div class="body">
    <div class="info-grid">
      <div class="info-box customer">
        <h4>👤 Customer</h4>
        <div class="info-row"><strong>${order.customerName}</strong></div>
        <div class="info-row"><span>📞 ${order.customerPhone}</span></div>
        ${order.customerAddress ? `<div class="info-row"><span>📍 ${order.customerAddress}</span></div>` : ""}
      </div>
      <div class="info-box payment">
        <h4>💳 Payment</h4>
        <div class="info-row"><strong>${order.paymentMethod.toUpperCase()}</strong></div>
        ${order.paymentNumber ? `<div class="info-row"><span>Sender: ${order.paymentNumber}</span></div>` : ""}
        ${order.transactionId ? `<div class="info-row"><span>TrxID: ${order.transactionId}</span></div>` : ""}
        ${!order.paymentNumber && !order.transactionId ? `<div class="info-row"><span>Cash on Delivery</span></div>` : ""}
      </div>
    </div>

    ${order.note ? `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;margin-bottom:18px;font-size:12px;color:#713f12;"><strong>📝 Note:</strong> ${order.note}</div>` : ""}

    <div class="section-title">Order Items</div>
    <table>
      <thead>
        <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal (${order.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
        <span>BDT ${subtotal.toLocaleString()}</span>
      </div>
      ${showDeliveryLine && deliveryCharge > 0 ? `<div class="total-row"><span>Delivery</span><span>BDT ${deliveryCharge.toLocaleString()}</span></div>` : ""}
      <div class="grand-total">
        <span>Grand Total</span>
        <span>BDT ${Number(order.total).toLocaleString()}</span>
      </div>
    </div>

    <div class="order-ref">
      <div class="order-ref-box">
        <div class="order-ref-label">Order Reference</div>
        <div class="order-ref-code">${refCode}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for shopping with <strong>${siteName}</strong>! 🎉</p>
    <p>For support, contact us via our website or social media.</p>
    <p style="margin-top:6px;font-size:10px;opacity:0.4;">Computer-generated receipt · Valid without signature</p>
  </div>
</div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=760,height=920,scrollbars=yes");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
