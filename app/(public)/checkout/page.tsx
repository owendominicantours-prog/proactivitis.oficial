import CheckoutFlow, { type CheckoutPageParams } from "@/components/checkout/CheckoutFlow";

const normalizeParam = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value ?? undefined;
};

export default function CheckoutPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const params: CheckoutPageParams = {
    tourId: normalizeParam(searchParams.tourId),
    tourTitle: normalizeParam(searchParams.tourTitle),
    tourImage: normalizeParam(searchParams.tourImage),
    tourPrice: normalizeParam(searchParams.tourPrice),
    date: normalizeParam(searchParams.date),
    time: normalizeParam(searchParams.time),
    adults: normalizeParam(searchParams.adults),
    youth: normalizeParam(searchParams.youth),
    child: normalizeParam(searchParams.child)
  };

  return <CheckoutFlow initialParams={params} />;
}
