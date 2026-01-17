import { Metadata } from "next";
import TourVariantForm from "@/components/admin/TourVariantForm";

export const metadata: Metadata = {
  title: "Nueva variante | Admin"
};

export default function NewTourVariantPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Variantes</p>
        <h1 className="text-2xl font-semibold text-slate-900">Nueva variante</h1>
      </div>
      <TourVariantForm />
    </div>
  );
}
