import { MerchantPoiClient } from "@/components/admin/merchant-poi/MerchantPoiClient";
import { getTourPoiAdminRows } from "@/lib/tourPoi";

export const dynamic = "force-dynamic";

const feedUrl = "https://proactivitis.com/merchant-center/tours.json";

export default async function AdminMerchantPoiPage() {
  const rows = await getTourPoiAdminRows();
  const readyCount = rows.filter((row) => row.poiReady && row.eligible).length;
  const eligibleCount = rows.filter((row) => row.eligible).length;

  return (
    <div className="space-y-8 pb-10">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Google Maps</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">POI de tours</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          Asigna el Google Place ID de cada tour para el feed JSON de experiencias de Proactivitis.
        </p>
      </header>

      <MerchantPoiClient rows={rows} readyCount={readyCount} eligibleCount={eligibleCount} feedUrl={feedUrl} />
    </div>
  );
}
