import { EventEmitter } from "events";
import type { Response } from "express";

interface OrderNotification {
  type: "new_order";
  orderId: number;
  customerName: string;
  customerPhone: string;
  total: number;
  itemCount: number;
  paymentMethod: string;
  timestamp: string;
}

class SSENotifier extends EventEmitter {
  private clients: Set<Response> = new Set();

  addClient(res: Response): void {
    this.clients.add(res);
    res.on("close", () => this.removeClient(res));
  }

  removeClient(res: Response): void {
    this.clients.delete(res);
  }

  broadcast(notification: OrderNotification): void {
    const data = `data: ${JSON.stringify(notification)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(data);
      } catch {
        this.removeClient(client);
      }
    }
  }

  get clientCount(): number {
    return this.clients.size;
  }
}

export const notifier = new SSENotifier();
export type { OrderNotification };
