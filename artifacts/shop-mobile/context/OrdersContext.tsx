import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface SavedOrder {
  orderId: number;
  phone: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
}

interface OrdersContextType {
  orders: SavedOrder[];
  addOrder: (o: SavedOrder) => void;
  updateOrderStatus: (orderId: number, status: string) => void;
}

const OrdersContext = createContext<OrdersContextType>({
  orders: [],
  addOrder: () => {},
  updateOrderStatus: () => {},
});

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<SavedOrder[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("ag_orders").then((s) => {
      if (s) try { setOrders(JSON.parse(s)); } catch {}
    });
  }, []);

  const persist = (next: SavedOrder[]) => {
    setOrders(next);
    AsyncStorage.setItem("ag_orders", JSON.stringify(next));
  };

  const addOrder = (o: SavedOrder) => {
    persist([o, ...orders]);
  };

  const updateOrderStatus = (orderId: number, status: string) => {
    persist(orders.map((o) => (o.orderId === orderId ? { ...o, status } : o)));
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrdersContext);
}
