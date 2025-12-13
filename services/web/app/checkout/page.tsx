import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const CheckoutPage = nextDynamic(
  () => import("../../components/checkout/CheckoutPage"),
  { ssr: false }
);

export default function Page() {
  return <CheckoutPage />;
}
