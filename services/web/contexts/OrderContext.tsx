"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

export type OrderSummary = {
  id: number | string;
  paymentUrl?: string;
  status?: string;
  total?: number;
};

const OrderContext = createContext<
  | {
      order: OrderSummary | null;
      setOrder: (value: OrderSummary | null) => void;
    }
  | undefined
>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [order, setOrder] = useState<OrderSummary | null>(null);

  return (
    <OrderContext.Provider value={{ order, setOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return ctx;
}
