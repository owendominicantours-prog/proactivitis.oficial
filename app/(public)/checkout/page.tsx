import { Suspense } from "react";
import CheckoutContent from "@/components/checkout/CheckoutContent";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-10 text-slate-600">Cargando detalles de la reserva…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
