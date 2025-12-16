export const dynamic = "force-dynamic";

import { Seatmap } from '../../../components/Seatmap';

interface Props {
  params: { id: string };
}

export default function EventPage({ params }: Props) {
  const eventId = Number(params.id);

  if (!Number.isInteger(eventId)) {
    return <div className="max-w-4xl mx-auto py-8">Некорректный идентификатор события</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Выбор мест для события #{eventId}</h1>
      <Seatmap eventId={eventId} />
    </div>
  );
}
