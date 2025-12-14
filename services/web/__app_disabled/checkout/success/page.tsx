import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const SuccessPage = nextDynamic(
  () => import("../../../components/checkout/SuccessPage"),
  { ssr: false }
);

export default function Page() {
  return <SuccessPage />;
}
