import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { allLandings } from "@/data/transfer-landings";
import { getDynamicTransferLandingCombos } from "@/lib/transfer-landing-utils";
import PublicServiceReviewForm from "@/components/public/PublicServiceReviewForm";

type SearchParams = Record<string, string | string[] | undefined>;

type PageLocale = "es" | "en" | "fr";

const readParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const dict: Record<
  PageLocale,
  {
    title: string;
    description: string;
    heading: string;
    subheading: string;
    backHome: string;
    myHistory: string;
    toursDone: string;
    transfersDone: string;
    localeName: string;
  }
> = {
  es: {
    title: "Dejar resena | Proactivitis",
    description: "Comparte tu experiencia de tour o transfer en Proactivitis.",
    heading: "Comparte tu experiencia",
    subheading: "Si iniciaste sesion, detectamos automaticamente tus tours y traslados.",
    backHome: "Volver al inicio",
    myHistory: "Servicios detectados en tu cuenta",
    toursDone: "Tours",
    transfersDone: "Traslados",
    localeName: "Espanol"
  },
  en: {
    title: "Leave a review | Proactivitis",
    description: "Share your tour or transfer experience with Proactivitis.",
    heading: "Share your experience",
    subheading: "If you are logged in, we auto-detect your completed tours and transfers.",
    backHome: "Back to home",
    myHistory: "Services detected in your account",
    toursDone: "Tours",
    transfersDone: "Transfers",
    localeName: "English"
  },
  fr: {
    title: "Laisser un avis | Proactivitis",
    description: "Partagez votre experience tour ou transfert avec Proactivitis.",
    heading: "Partagez votre experience",
    subheading: "Si vous etes connecte, nous detectons automatiquement vos tours et transferts.",
    backHome: "Retour a l'accueil",
    myHistory: "Services detectes dans votre compte",
    toursDone: "Tours",
    transfersDone: "Transferts",
    localeName: "Francais"
  }
};

export const metadata = {
  title: "Dejar resena | Proactivitis",
  description: "Comparte tu experiencia de tour o transfer en Proactivitis."
};

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeZone: "America/Santo_Domingo"
  }).format(value);

export default async function PublicReviewPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearch = (await searchParams) ?? {};
  const requestedLocale = readParam(resolvedSearch.lang);
  const locale: PageLocale = requestedLocale === "en" || requestedLocale === "fr" ? requestedLocale : "es";
  const t = dict[locale];

  const session = await getServerSession(authOptions);
  const initialTypeParam = readParam(resolvedSearch.type);
  const initialType = initialTypeParam === "transfer" ? "transfer" : "tour";
  const initialTourId = readParam(resolvedSearch.tourId) ?? undefined;
  const initialTransferSlug = readParam(resolvedSearch.transferSlug) ?? undefined;

  const [tours, bookings] = await Promise.all([
    prisma.tour.findMany({
      where: { status: "published" },
      select: { id: true, title: true },
      orderBy: { title: "asc" }
    }),
    session?.user?.email
      ? prisma.booking.findMany({
          where: {
            OR: [{ customerEmail: session.user.email }, { userId: session.user.id ?? undefined }]
          },
          select: {
            id: true,
            flowType: true,
            travelDate: true,
            hotel: true,
            pickup: true,
            originAirport: true,
            customerName: true,
            customerEmail: true,
            Tour: { select: { id: true, title: true } }
          },
          orderBy: { travelDate: "desc" },
          take: 150
        })
      : Promise.resolve([])
  ]);

  const customerTourMap = new Map<string, { id: string; title: string }>();
  const customerTransferMap = new Map<string, { slug: string; label: string }>();
  bookings.forEach((booking) => {
    const isTransfer = (booking.flowType ?? "").toLowerCase() === "transfer";
    if (isTransfer) {
      const destination = booking.hotel || booking.pickup || booking.Tour.title || "Transfer privado";
      const origin = booking.originAirport || "PUJ";
      const label = `${origin} -> ${destination} (${formatDate(booking.travelDate)})`;
      customerTransferMap.set(`booking:${booking.id}`, {
        slug: `booking:${booking.id}`,
        label
      });
      return;
    }
    if (!booking.Tour?.id) return;
    if (!customerTourMap.has(booking.Tour.id)) {
      customerTourMap.set(booking.Tour.id, {
        id: booking.Tour.id,
        title: booking.Tour.title
      });
    }
  });

  const staticTransfers = allLandings().map((item) => ({
    slug: item.landingSlug,
    label: `${item.hotelName} (${item.landingSlug})`
  }));

  let dynamicTransfers: { slug: string; label: string }[] = [];
  try {
    const combos = await getDynamicTransferLandingCombos();
    dynamicTransfers = combos.map((item) => ({
      slug: item.landingSlug,
      label: `${item.originName} -> ${item.destinationName}`
    }));
  } catch {
    dynamicTransfers = [];
  }

  const transferMap = new Map<string, string>();
  [...Array.from(customerTransferMap.values()), ...dynamicTransfers, ...staticTransfers].forEach((item) => {
    if (!transferMap.has(item.slug)) transferMap.set(item.slug, item.label);
  });
  if (!transferMap.size) {
    transferMap.set("transfer-general", "Traslado privado Proactivitis");
  }
  const transferOptions = Array.from(transferMap.entries())
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

  const tourOptions =
    customerTourMap.size > 0
      ? Array.from(customerTourMap.values())
      : tours.map((tour) => ({ id: tour.id, title: tour.title }));

  const detectedName = bookings[0]?.customerName ?? session?.user?.name ?? "";
  const detectedEmail = bookings[0]?.customerEmail ?? session?.user?.email ?? "";

  const localeHref = (target: PageLocale) => {
    const params = new URLSearchParams();
    params.set("lang", target);
    if (initialType) params.set("type", initialType);
    if (initialTourId) params.set("tourId", initialTourId);
    if (initialTransferSlug) params.set("transferSlug", initialTransferSlug);
    return `/review?${params.toString()}`;
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Proactivitis" width={170} height={48} className="h-10 w-auto" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Proactivitis Reviews</p>
                <h1 className="text-2xl font-semibold text-slate-900">{t.heading}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(["es", "en", "fr"] as PageLocale[]).map((item) => (
                <Link
                  key={item}
                  href={localeHref(item)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                    locale === item ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700"
                  }`}
                >
                  {dict[item].localeName}
                </Link>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600">{t.subheading}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700"
            >
              {t.backHome}
            </Link>
          </div>
        </section>

        {session?.user?.email ? (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-700">{t.myHistory}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-emerald-900">
              <span className="rounded-full bg-white px-3 py-1 font-semibold">
                {t.toursDone}: {tourOptions.length}
              </span>
              <span className="rounded-full bg-white px-3 py-1 font-semibold">
                {t.transfersDone}: {customerTransferMap.size}
              </span>
            </div>
          </section>
        ) : null}

        <PublicServiceReviewForm
          locale={locale}
          tours={tourOptions}
          transferOptions={transferOptions}
          initialType={initialType}
          initialTourId={initialTourId}
          initialTransferSlug={initialTransferSlug}
          initialName={detectedName}
          initialEmail={detectedEmail}
          preferHistory={customerTourMap.size > 0 || customerTransferMap.size > 0}
        />
      </div>
    </main>
  );
}
