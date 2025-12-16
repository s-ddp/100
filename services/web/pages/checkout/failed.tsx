import dynamic from 'next/dynamic';

const FailedPage = dynamic(() => import('../../components/checkout/FailedPage'), {
  ssr: false,
});

export default function CheckoutFailed() {
  return <FailedPage />;
}
