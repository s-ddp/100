import dynamic from 'next/dynamic';

const OrdersPage = dynamic(() => import('../../components/admin/OrdersPage'), {
  ssr: false,
});

export default function AdminOrders() {
  return <OrdersPage />;
}
