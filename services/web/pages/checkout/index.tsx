import dynamic from 'next/dynamic';

const CheckoutPage = dynamic(() => import('../../components/checkout/CheckoutPage'), {
  ssr: false,
});

export default function Checkout() {
  return <CheckoutPage />;
}
