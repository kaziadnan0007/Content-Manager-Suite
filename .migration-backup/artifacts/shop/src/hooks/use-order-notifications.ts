import { useEffect, useRef, useState, useCallback } from "react";

export interface OrderNotification {
  type: "new_order";
  orderId: number;
  customerName: string;
  customerPhone: string;
  total: number;
  itemCount: number;
  paymentMethod: string;
  timestamp: string;
}

export function useOrderNotifications(enabled: boolean) {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  const dismissNotification = useCallback((orderId: number) => {
    setNotifications(prev => prev.filter(n => n.orderId !== orderId));
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      const es = new EventSource("/api/admin/notifications/stream");
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as OrderNotification;
          if (data.type === "new_order") {
            setNotifications(prev => [data, ...prev].slice(0, 20));
            setUnreadCount(c => c + 1);

            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("🛒 New Order!", {
                body: `${data.customerName} placed BDT ${data.total.toLocaleString()} order`,
                icon: "/favicon.ico",
              });
            }
          }
        } catch {}
      };

      es.onerror = () => {
        es.close();
        retryTimeout = setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      clearTimeout(retryTimeout);
      eventSourceRef.current?.close();
    };
  }, [enabled]);

  return { notifications, unreadCount, clearUnread, dismissNotification };
}
