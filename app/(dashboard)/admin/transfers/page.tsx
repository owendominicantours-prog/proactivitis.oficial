export const metadata = {
  title: "Transferencias"
};

import { getTransferConfig, getTransferCountryList, ensureDefaultTransferConfig } from "@/lib/transfers";
import TransferConsole from "@/components/admin/transfers/TransferConsole";

type TransferPageSearchParams = { country?: string };
type TransferPageProps = {
  searchParams?: Promise<TransferPageSearchParams>;
};

export default async function AdminTransferPage({ searchParams }: TransferPageProps) {
  await ensureDefaultTransferConfig();
  const countries = await getTransferCountryList();
  const fallbackCountry = countries[0]?.code ?? "RD";
  const resolvedSearchParams = (await Promise.resolve(searchParams)) ?? {};
  const countryCode = resolvedSearchParams.country ?? fallbackCountry;
  const config = await getTransferConfig(countryCode);

  return (
    <section className="space-y-8">
      <TransferConsole countries={countries} activeCountryCode={countryCode} config={config} />
    </section>
  );
}
