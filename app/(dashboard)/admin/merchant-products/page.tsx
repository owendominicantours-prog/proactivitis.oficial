import { MerchantProductsClient } from "@/components/admin/merchant/MerchantProductsClient";
import { getMerchantProductsPageData } from "@/lib/merchantCenter";

export const dynamic = "force-dynamic";

export default async function AdminMerchantProductsPage() {
  const data = await getMerchantProductsPageData();

  return (
    <div className="space-y-8 pb-10">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Merchants</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Productos por API</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          Envia el catalogo publicado de Proactivitis a Google Merchant Center usando Merchant API.
        </p>
      </header>

      <MerchantProductsClient {...data} />
    </div>
  );
}
