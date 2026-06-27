import type { ApprovedTourReview } from "@/lib/tourReviews";
import type { NuevaGeneracionLocale } from "@/lib/nuevaGeneracionTours";

type ConversionCard = {
  title: string;
  body: string;
};

const UI = {
  es: {
    includedEyebrow: "Incluido en tu reserva",
    includedTitle: "Lo importante queda claro antes de pagar",
    included: "Incluido",
    notIncluded: "No incluido",
    extra: "Extra",
    reviewsEyebrow: "Reseñas verificadas del tour",
    reviewsTitle: "Opiniones reales de esta experiencia",
    verified: "verificado",
    confidenceEyebrow: "Confianza antes de reservar",
    confidenceTitle: "Menos dudas antes de completar el pago",
    from: "Desde",
    bookNow: "Reservar ahora"
  },
  en: {
    includedEyebrow: "Included in your booking",
    includedTitle: "The important details are clear before payment",
    included: "Included",
    notIncluded: "Not included",
    extra: "Extra",
    reviewsEyebrow: "Verified tour reviews",
    reviewsTitle: "Real opinions about this experience",
    verified: "verified",
    confidenceEyebrow: "Trust before booking",
    confidenceTitle: "Fewer doubts before completing payment",
    from: "From",
    bookNow: "Book now"
  },
  fr: {
    includedEyebrow: "Inclus dans votre réservation",
    includedTitle: "Les détails importants sont clairs avant le paiement",
    included: "Inclus",
    notIncluded: "Non inclus",
    extra: "Extra",
    reviewsEyebrow: "Avis vérifiés du tour",
    reviewsTitle: "Avis réels sur cette expérience",
    verified: "vérifié",
    confidenceEyebrow: "Confiance avant de réserver",
    confidenceTitle: "Moins de doutes avant de terminer le paiement",
    from: "À partir de",
    bookNow: "Réserver"
  }
};

export function TourTrustBadges({ badges, dark = false }: { badges: string[]; dark?: boolean }) {
  const className = dark
    ? "border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-white backdrop-blur"
    : "border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-900";

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span key={badge} className={className}>
          {badge}
        </span>
      ))}
    </div>
  );
}

export function TourIncludedExcludedSection({
  includes,
  exclusions,
  locale = "es"
}: {
  includes: string[];
  exclusions: string[];
  locale?: NuevaGeneracionLocale;
}) {
  const t = UI[locale];
  return (
    <section className="border border-slate-200 bg-slate-50 p-6">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">{t.includedEyebrow}</p>
      <h2 className="mt-3 text-2xl font-black text-slate-950">{t.includedTitle}</h2>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="border border-emerald-200 bg-white p-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-800">{t.included}</h3>
          <ul className="mt-4 space-y-3">
            {includes.slice(0, 8).map((item) => (
              <li key={item} className="grid grid-cols-[78px_1fr] gap-3 text-sm leading-6 text-slate-700">
                <span className="self-start bg-emerald-100 px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-emerald-900">
                  {t.included}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-700">{t.notIncluded}</h3>
          <ul className="mt-4 space-y-3">
            {exclusions.slice(0, 6).map((item) => (
              <li key={item} className="grid grid-cols-[86px_1fr] gap-3 text-sm leading-6 text-slate-700">
                <span className="self-start bg-slate-100 px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-700">
                  {t.extra}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function TourProofSection({
  reviews,
  confidence,
  locale = "es"
}: {
  reviews: ApprovedTourReview[];
  confidence: ConversionCard[];
  locale?: NuevaGeneracionLocale;
}) {
  const t = UI[locale];
  if (reviews.length) {
    return (
      <section id="reviews" className="border border-slate-200 bg-white p-6">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">{t.reviewsEyebrow}</p>
        <h2 className="mt-3 text-2xl font-black text-slate-950">{t.reviewsTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {reviews.slice(0, 3).map((review) => {
            const rating = Math.min(5, Math.max(1, Math.round(review.rating)));
            return (
              <article key={review.id} className="border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{rating}/5 {t.verified}</p>
                {review.title ? <h3 className="mt-3 text-base font-black text-slate-950">{review.title}</h3> : null}
                <p className="mt-3 text-sm leading-6 text-slate-600">{review.body}</p>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500">{review.customerName}</p>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="border border-slate-200 bg-white p-6">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">{t.confidenceEyebrow}</p>
      <h2 className="mt-3 text-2xl font-black text-slate-950">{t.confidenceTitle}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {confidence.map((item) => (
          <article key={item.title} className="border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-950">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function TourMobileBookingBar({
  price,
  cta,
  locale = "es"
}: {
  price: number;
  cta?: string;
  locale?: NuevaGeneracionLocale;
}) {
  const t = UI[locale];
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t.from}</p>
          <p className="text-base font-black text-slate-950">${price.toFixed(0)} USD</p>
        </div>
        <a href="#reservar" className="bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300">
          {cta ?? t.bookNow}
        </a>
      </div>
    </div>
  );
}
