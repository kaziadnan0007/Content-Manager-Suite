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

  const statusColors: Record<string, string> = {
    pending:    "#d97706",
    confirmed:  "#2563eb",
    processing: "#4f46e5",
    shipped:    "#7c3aed",
    delivered:  "#16a34a",
    cancelled:  "#dc2626",
  };
  const statusColor = statusColors[order.status] ?? "#6b7280";

  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:8px 4px;border-bottom:1px solid #f3f4f6;">
        <div style="font-weight:600;font-size:13px;">${item.productName}</div>
      </td>
      <td style="padding:8px 4px;border-bottom:1px solid #f3f4f6;text-align:center;font-size:13px;">${item.quantity}</td>
      <td style="padding:8px 4px;border-bottom:1px solid #f3f4f6;text-align:right;font-size:13px;">BDT ${Number(item.price).toLocaleString()}</td>
      <td style="padding:8px 4px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:700;font-size:13px;">BDT ${(Number(item.price) * item.quantity).toLocaleString()}</td>
    </tr>
  `).join("");

  const subtotal = order.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const deliveryNote = order.note || "";
  const isInsideDhaka = deliveryNote.includes("Inside Dhaka");
  const isOutsideDhaka = deliveryNote.includes("Outside Dhaka");
  const deliveryCharge = isInsideDhaka ? 60 : isOutsideDhaka ? 120 : Number(order.total) - subtotal;
  const showDeliveryLine = isInsideDhaka || isOutsideDhaka;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Receipt #${order.id} — ${siteName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      padding: 0;
    }
    .page {
      max-width: 680px;
      margin: 32px auto;
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 32px rgba(0,0,0,.10);
    }

    /* ── Header ── */
    .header {
      background: linear-gradient(135deg, #0a1628 0%, #0d2044 100%);
      padding: 28px 32px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand { display: flex; flex-direction: column; }
    .brand-name {
      font-size: 22px;
      font-weight: 900;
      color: #00D4FF;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 9px;
      color: rgba(255,255,255,0.45);
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .receipt-badge {
      text-align: right;
    }
    .receipt-label {
      font-size: 10px;
      color: rgba(255,255,255,0.45);
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    .receipt-id {
      font-size: 26px;
      font-weight: 900;
      color: #fff;
      letter-spacing: -1px;
    }

    /* ── Status bar ── */
    .status-bar {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 10px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
    }
    .status-pill {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 999px;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: ${statusColor};
      background: ${statusColor}18;
      border: 1px solid ${statusColor}40;
    }
    .date-text { color: #64748b; font-weight: 500; }

    /* ── Body ── */
    .body { padding: 28px 32px; }

    /* ── 2-column info ── */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 16px;
    }
    .info-box h4 {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #94a3b8;
      margin-bottom: 8px;
    }
    .info-row { font-size: 13px; line-height: 1.7; }
    .info-row strong { font-weight: 700; color: #1e293b; }
    .info-row span { color: #475569; }

    /* ── Items table ── */
    .section-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #94a3b8;
      margin-bottom: 10px;
    }
    table { width: 100%; border-collapse: collapse; }
    thead th {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
      padding: 6px 4px 8px;
      border-bottom: 2px solid #e2e8f0;
    }
    thead th:nth-child(1) { text-align: left; }
    thead th:nth-child(2) { text-align: center; }
    thead th:nth-child(3),
    thead th:nth-child(4) { text-align: right; }

    /* ── Totals ── */
    .totals {
      margin-top: 12px;
      border-top: 2px solid #e2e8f0;
      padding-top: 12px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 4px 0;
      color: #475569;
    }
    .total-row.grand {
      font-size: 17px;
      font-weight: 900;
      color: #00a8cc;
      border-top: 2px dashed #e2e8f0;
      margin-top: 8px;
      padding-top: 10px;
    }

    /* ── Footer ── */
    .footer {
      background: linear-gradient(135deg, #0a1628 0%, #0d2044 100%);
      padding: 18px 32px;
      text-align: center;
    }
    .footer p {
      font-size: 12px;
      color: rgba(255,255,255,0.55);
      line-height: 1.6;
    }
    .footer strong { color: #00D4FF; }

    /* ── Divider ── */
    .divider {
      border: none;
      border-top: 1px dashed #e2e8f0;
      margin: 20px 0;
    }

    @media print {
      body { background: #fff; padding: 0; }
      .page { margin: 0; border-radius: 0; box-shadow: none; max-width: 100%; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

<!-- Print button (hidden on print) -->
<div class="no-print" style="text-align:center;padding:16px 0 0;">
  <button onclick="window.print()"
    style="background:#00D4FF;color:#0a1628;font-weight:800;font-size:14px;padding:10px 32px;border:none;border-radius:8px;cursor:pointer;margin-right:8px;">
    🖨️ Print Receipt
  </button>
  <button onclick="window.close()"
    style="background:#f1f5f9;color:#475569;font-weight:700;font-size:14px;padding:10px 24px;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;">
    Close
  </button>
</div>

<div class="page">
  <!-- Header -->
  <div class="header">
    <div class="brand">
      <div class="brand-name">${siteName}</div>
      <div class="brand-sub">Bangladesh's #1 Online Shop</div>
    </div>
    <div class="receipt-badge">
      <div class="receipt-label">E-Receipt</div>
      <div class="receipt-id">#${order.id}</div>
    </div>
  </div>

  <!-- Status bar -->
  <div class="status-bar">
    <span class="date-text">📅 ${dateStr} (Dhaka)</span>
    <span class="status-pill">${order.status.toUpperCase()}</span>
  </div>

  <!-- Body -->
  <div class="body">

    <!-- Info grid -->
    <div class="info-grid">
      <div class="info-box">
        <h4>👤 Customer</h4>
        <div class="info-row"><strong>${order.customerName}</strong></div>
        <div class="info-row"><span>📞 ${order.customerPhone}</span></div>
        ${order.customerAddress ? `<div class="info-row"><span>📍 ${order.customerAddress}</span></div>` : ""}
      </div>
      <div class="info-box">
        <h4>💳 Payment</h4>
        <div class="info-row"><strong>${order.paymentMethod.toUpperCase()}</strong></div>
        ${order.paymentNumber ? `<div class="info-row"><span>Sender: ${order.paymentNumber}</span></div>` : ""}
        ${order.transactionId ? `<div class="info-row"><span>TrxID: ${order.transactionId}</span></div>` : ""}
        ${!order.paymentNumber && !order.transactionId ? `<div class="info-row"><span>Pay on delivery</span></div>` : ""}
      </div>
    </div>

    ${order.note ? `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;margin-bottom:20px;font-size:12px;color:#713f12;">
      <strong>📝 Note:</strong> ${order.note}
    </div>` : ""}

    <!-- Items -->
    <div class="section-title">Order Items</div>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="total-row">
        <span>Subtotal (${order.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
        <span>BDT ${subtotal.toLocaleString()}</span>
      </div>
      ${showDeliveryLine ? `
      <div class="total-row">
        <span>Delivery (${isInsideDhaka ? "Inside Dhaka" : "Outside Dhaka"})</span>
        <span>BDT ${deliveryCharge}</span>
      </div>` : ""}
      <div class="total-row grand">
        <span>Grand Total</span>
        <span>BDT ${Number(order.total).toLocaleString()}</span>
      </div>
    </div>

    <!-- Barcode-style order ref -->
    <div style="margin-top:24px;text-align:center;">
      <div style="display:inline-block;background:#f8fafc;border:1px dashed #e2e8f0;border-radius:8px;padding:8px 24px;">
        <div style="font-family:monospace;font-size:11px;color:#94a3b8;letter-spacing:0.15em;">ORDER REFERENCE</div>
        <div style="font-family:monospace;font-size:16px;font-weight:800;color:#1e293b;letter-spacing:0.1em;">AG-${String(order.id).padStart(6, "0")}</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>Thank you for shopping with <strong>${siteName}</strong>! 🎉</p>
    <p>For support: contact us via our website or social media.</p>
    <p style="margin-top:6px;font-size:10px;opacity:0.5;">This is a computer-generated receipt and is valid without a signature.</p>
  </div>
</div>

<script>
  // Auto-close the print dialog and refresh parent on close
  window.onafterprint = function() {};
</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=760,height=900,scrollbars=yes");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
