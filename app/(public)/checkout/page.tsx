import CheckoutFlow from '@/components/checkout/CheckoutFlow';

export default function CheckoutPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return <CheckoutFlow params={searchParams} />;
}
