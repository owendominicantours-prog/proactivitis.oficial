import { redirect } from "next/navigation";

export default function LegacyCustomerReservationsRedirect() {
  redirect("/dashboard/customer");
}
