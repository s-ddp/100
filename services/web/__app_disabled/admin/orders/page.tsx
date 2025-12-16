import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const OrdersPage = nextDynamic(
  () => import("../../../components/admin/OrdersPage"),
  { ssr: false }
);

export default function Page() {
  return <OrdersPage />;
}
