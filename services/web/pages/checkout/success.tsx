import dynamic from 'next/dynamic';

const SuccessPage = dynamic(() => import('../../components/checkout/SuccessPage'), {
  ssr: false,
});

export default function CheckoutSuccess() {
  return <SuccessPage />;
}
