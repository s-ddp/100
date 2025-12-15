"use client";

import type { ReactNode } from "react";
import { OrderProvider } from "../contexts/OrderContext";

export function Providers({ children }: { children: ReactNode }) {
  return <OrderProvider>{children}</OrderProvider>;
}
