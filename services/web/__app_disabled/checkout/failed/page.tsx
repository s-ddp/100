import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const FailedPage = nextDynamic(
  () => import("../../../components/checkout/FailedPage"),
  { ssr: false }
);

export default function Page() {
  return <FailedPage />;
}
