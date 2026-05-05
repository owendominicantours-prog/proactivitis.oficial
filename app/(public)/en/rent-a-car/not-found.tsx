import Link from "next/link";

export default function RentCarSegmentNotFound() {
  return (
    <main className="bg-slate-50 px-4 py-16">
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">Proactivitis rent a car</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Vehicle fleet page not available</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Choose an active travel zone to see real vehicle options and final Proactivitis prices.
        </p>
        <Link
          href="/en/rent-a-car"
          className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white"
        >
          Open rent car catalog
        </Link>
      </section>
    </main>
  );
}
