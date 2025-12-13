import dynamic from 'next/dynamic';
import type { GetServerSideProps, NextPage } from 'next';

const OrderDetailsPage = dynamic(
  () => import('../../../components/admin/OrderDetailsPage'),
  { ssr: false }
);

type Props = {
  orderId: string | null;
};

const Page: NextPage<Props> = ({ orderId }) => {
  if (!orderId) return <div style={{ padding: 24 }}>Некорректный идентификатор заказа</div>;
  return <OrderDetailsPage orderId={orderId} />;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const id = params?.id;
  if (typeof id !== 'string' || !id) {
    return { props: { orderId: null } };
  }
  return { props: { orderId: id } };
};

export default Page;
