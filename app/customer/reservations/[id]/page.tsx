import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id?: string }>;
};

export default async function LegacyCustomerReservationDetailRedirect({ params }: Props) {
  const { id } = await params;
  redirect(id ? `/dashboard/customer/reservas/${id}` : "/dashboard/customer");
}
