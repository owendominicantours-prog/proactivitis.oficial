import CheckoutWithStripe from '@/components/checkout/CheckoutWithStripe';

export default function CheckoutPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return <CheckoutWithStripe searchParams={searchParams} />;
}
