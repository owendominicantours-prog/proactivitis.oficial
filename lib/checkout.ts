export const recommendedReservation = {
  tourName: 'Tour guiado de lujo en Punta Cana',
  date: '12 de enero, 2026',
  time: '09:00 AM',
  adults: 2,
  children: 1,
  price: 598,
  imageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c3?auto=format&fit=crop&w=600&q=80'
};

const parsePositive = (raw: string | string[] | undefined, fallback: number) => {
  const valueRaw = Array.isArray(raw) ? raw[0] : raw;
  if (!valueRaw) return fallback;
  const value = parseInt(valueRaw, 10);
  if (Number.isNaN(value)) return fallback;
  return Math.max(fallback, value);
};

export interface CheckoutSummary {
  tourName: string;
  date: string;
  time: string;
  adults: number;
  children: number;
}

export const buildSummaryFromParams = (params: {
  [key: string]: string | string[] | undefined;
}): CheckoutSummary => {
  const adults = parsePositive(params.adults, 1);
  const youth = parsePositive(params.youth, 0);
  const child = parsePositive(params.child, 0);
  return {
    tourName: recommendedReservation.tourName,
    date: (params.date as string) ?? recommendedReservation.date,
    time: (params.time as string) ?? recommendedReservation.time,
    adults,
    children: youth + child
  };
};
