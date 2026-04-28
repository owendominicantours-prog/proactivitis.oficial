import type { Metadata } from "next";
import Link from "next/link";
import { requestAccountDeletionAction } from "@/app/(public)/account-deletion/actions";

export const metadata: Metadata = {
  title: "Delete Proactivitis App Account | Proactivitis",
  description:
    "Request deletion of a Proactivitis app customer account and associated app data from the official Proactivitis website."
};

type Props = {
  searchParams?: Promise<{
    submitted?: string;
    error?: string;
  }>;
};

export default async function AccountDeletionPage({ searchParams }: Props) {
  const params = await searchParams;
  const submitted = params?.submitted === "1";
  const hasEmailError = params?.error === "email";

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">Proactivitis App</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
            Delete your Proactivitis app account
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            This page is the official web path to request deletion of a Proactivitis customer account created in the mobile app.
            You can also start deletion inside the app from <strong>Profile &gt; Account and data</strong>.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Request account deletion</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter the email used in the Proactivitis app. For security, we may verify ownership before processing the request.
          </p>

          {submitted ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              Request received. Check your email and our team will process the request.
            </div>
          ) : null}
          {hasEmailError ? (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
              Enter a valid email address.
            </div>
          ) : null}

          <form action={requestAccountDeletionAction} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Email used in the app
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Name, optional
              <input
                name="name"
                type="text"
                autoComplete="name"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Details, optional
              <textarea
                name="details"
                rows={4}
                placeholder="Tell us if you also need help with an active booking."
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Request deletion
            </button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">What is deleted</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
              <li>App login access and active sessions.</li>
              <li>Saved payment method references stored in Proactivitis.</li>
              <li>Customer preferences, profile identity, and OAuth links.</li>
              <li>Review account links are anonymized.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Data we may retain</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Proactivitis may retain limited reservation, payment, fraud-prevention, tax, security, or dispute records when required to complete a service or meet legal and operational obligations.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">More information</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm font-semibold text-sky-700">
              <Link href="/legal/privacy">Privacy policy</Link>
              <Link href="/legal/terms">Terms and conditions</Link>
              <Link href="/contact">Contact Proactivitis</Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
