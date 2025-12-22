import BoatPage from "../../ui/Boat/BoatPage";

export default function Boat({ params }: { params: { slug: string } }) {
  return <BoatPage slug={params.slug} />;
}
