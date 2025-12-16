import type { GetServerSideProps, NextPage } from 'next';
import { Seatmap } from '../../components/Seatmap';

type Props = {
  eventId: number | null;
};

const EventPage: NextPage<Props> = ({ eventId }) => {
  if (!eventId) {
    return <div className="max-w-4xl mx-auto py-8">Некорректный идентификатор события</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Выбор мест для события #{eventId}</h1>
      <Seatmap eventId={eventId} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const idParam = params?.id;
  const numericId = typeof idParam === 'string' ? Number(idParam) : null;
  if (!numericId || !Number.isInteger(numericId)) {
    return { props: { eventId: null } };
  }

  return { props: { eventId: numericId } };
};

export default EventPage;
