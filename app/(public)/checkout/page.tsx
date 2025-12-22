import CheckoutSummary from '@/components/checkout/CheckoutSummary';

export default function CheckoutPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return <CheckoutSummary params={searchParams} />;
}
