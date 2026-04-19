import Image from "next/image";
import Link from "next/link";
import StructuredData from "@/components/schema/StructuredData";
import {
  DEFAULT_IMAGE,
  buildBayahibeBuggySchemaGraph,
  getBayahibeBuggyData,
  sharedBayahibeBusiness,
  type BayahibeBuggyLandingContent
} from "@/lib/bayahibeBuggyLanding";

type BayahibeBuggyLandingPageProps = {
  content: BayahibeBuggyLandingContent;
};

export default async function BayahibeBuggyLandingPage({ content }: BayahibeBuggyLandingPageProps) {
  const localePrefix = content.locale === "es" ? "" : `/${content.locale}`;
  const data = await getBayahibeBuggyData(localePrefix);
  const visibleGallery =
    data.galleryImages.length > 0
      ? data.galleryImages
      : [DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE];
  const schemaGraph = buildBayahibeBuggySchemaGraph(content, data);

  return (
    <div className="min-h-screen bg-[#0b0f0c] text-white">
      <StructuredData data={schemaGraph} />

      <header className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src={data.heroImage}
            alt={content.pageName}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.72)_52%,rgba(11,15,12,0.98)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,114,28,0.35),transparent_34%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[90svh] max-w-7xl flex-col px-5 pb-16 pt-7 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href={content.localeLinks.home} className="text-sm font-black uppercase tracking-[0.34em] text-white">
              Proactivitis
            </Link>
            <Link
              href={data.bookingHref}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#0d100e]"
            >
              {content.navAvailability}
            </Link>
          </div>

          <div className="grid flex-1 items-end gap-10 py-12 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-[#d8721c]/40 bg-[#d8721c]/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-[#ffd5a5]">
                {content.heroBadge}
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-7xl">
                {content.pageName}
              </h1>
              <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-[#d9f0bd] sm:text-2xl">{content.subheadline}</p>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">{content.intro}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={data.reserveHref}
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#d8721c] px-8 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-[#e48a3f]"
                >
                  {content.primaryCta}
                </Link>
                <Link
                  href={data.bookingHref}
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-[#0d100e]"
                >
                  {content.secondaryCta}
                </Link>
              </div>

              <div className="mt-8 grid gap-3 text-sm font-semibold text-white/90 sm:grid-cols-3">
                {content.microBenefits.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur">
                    <span className="text-[#b9df72]">+</span> {item}
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[30px] border border-white/10 bg-[rgba(12,16,13,0.8)] p-6 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-[#d9f0bd]">{content.quickFacts}</p>
              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/55">{content.priceFrom}</p>
                  <p className="mt-2 text-3xl font-black text-white">${data.lowestPrice} USD</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/55">{content.durationLabel}</p>
                  <p className="mt-2 text-xl font-black text-white">{content.keyInfoItems[0]?.value}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/55">{content.areaLabel}</p>
                  <p className="mt-2 text-base font-semibold text-white">{content.areaValue}</p>
                </div>
                <Link
                  href={sharedBayahibeBusiness.whatsappLink}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#25d366]/40 bg-[#25d366]/15 px-5 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#25d366] hover:text-[#0b0f0c]"
                >
                  {content.whatsappCta}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-white/10 bg-[#121712]">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.34em] text-[#d9f0bd]">{content.seoEyebrow}</p>
                <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">{content.seoHeading}</h2>
                {content.seoParagraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-base leading-8 text-white/78">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="grid gap-4">
                {content.seoCards.map((item) => (
                  <div key={item} className="rounded-[26px] border border-[#d8721c]/20 bg-[#1a211b] p-5">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#d8721c]">{content.seoCardEyebrow}</h3>
                    <p className="mt-3 text-base leading-8 text-white/78">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-black text-white sm:text-4xl">{content.experienceHeading}</h2>
            {content.experienceParagraphs.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-base leading-8 text-white/78">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {content.experienceCards.map((item) => (
              <article key={item} className="rounded-[28px] border border-white/10 bg-[#171d18] p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d8721c] text-lg font-black text-white">
                  +
                </span>
                <p className="mt-4 text-lg font-semibold text-white">{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#101511]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white sm:text-4xl">{content.itineraryHeading}</h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-4">
              {content.itinerary.map((item) => (
                <article key={item.title} className="rounded-[28px] border border-white/10 bg-[#1a211b] p-6">
                  <h3 className="text-xl font-black text-white">{item.title}</h3>
                  <p className="mt-3 text-base leading-8 text-white/75">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
            <div>
              <h2 className="text-3xl font-black text-white sm:text-4xl">{content.includesHeading}</h2>
              <div className="mt-8 grid gap-4">
                {content.includesItems.map((item) => (
                  <div key={item} className="rounded-[26px] border border-white/10 bg-[#171d18] p-5 text-base font-semibold text-white">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-black text-white sm:text-4xl">{content.keyInfoHeading}</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {content.keyInfoItems.map((item) => (
                  <div key={item.label} className="rounded-[26px] border border-[#d8721c]/20 bg-[#1a211b] p-5">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[#d9f0bd]">{item.label}</p>
                    <p className="mt-3 text-xl font-black text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#101511]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white sm:text-4xl">{content.whyHeading}</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {content.whyItems.map((item) => (
                <article key={item} className="rounded-[28px] border border-white/10 bg-[#171d18] p-6">
                  <p className="text-lg font-semibold text-white">{item}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.34em] text-[#d9f0bd]">{content.galleryEyebrow}</p>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">{content.galleryHeading}</h2>
            </div>
            <Link
              href={data.reserveHref}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-white transition hover:border-[#d8721c] hover:bg-[#d8721c]"
            >
              {content.primaryCta}
            </Link>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {visibleGallery.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className={`relative overflow-hidden rounded-[26px] border border-white/10 bg-[#1a211b] ${
                  index === 0 ? "md:col-span-2 md:min-h-[420px]" : "min-h-[220px]"
                }`}
              >
                <Image
                  src={image}
                  alt={`${content.pageName} ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-4 text-sm font-semibold text-white">
                  {content.galleryCaptions[index] ?? content.pageName}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#101511]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white sm:text-4xl">{content.travelerHeading}</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {content.travelerCards.map((item) => (
                <article key={item.title} className="rounded-[28px] border border-white/10 bg-[#171d18] p-6">
                  <h3 className="text-xl font-black text-white">{item.title}</h3>
                  <p className="mt-4 text-base leading-8 text-white/75">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white sm:text-4xl">{content.faqHeading}</h2>
          <div className="mt-8 space-y-4">
            {content.faqItems.map((item) => (
              <article key={item.q} className="rounded-[26px] border border-white/10 bg-[#171d18] p-6">
                <h3 className="text-xl font-black text-white">{item.q}</h3>
                <p className="mt-3 text-base leading-8 text-white/75">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#0f1410]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white sm:text-4xl">{content.finalHeading}</h2>
            <div className="mt-8 overflow-hidden rounded-[36px] border border-[#d8721c]/30 bg-[linear-gradient(135deg,#d8721c_0%,#7b4d1f_100%)] p-8 shadow-[0_30px_80px_rgba(216,114,28,0.22)] sm:p-12">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-white/78">{content.finalEyebrow}</p>
              <p className="mt-4 max-w-4xl text-3xl font-black leading-tight text-white sm:text-5xl">{content.finalHeading}</p>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/88 sm:text-lg">{content.finalBody}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={data.reserveHref}
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#0f1210] px-8 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-black"
                >
                  {content.primaryCta}
                </Link>
                <Link
                  href={data.bookingHref}
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-8 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-[#111214]"
                >
                  {content.secondaryCta}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#0b0f0c]">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.34em] text-[#d9f0bd]">{content.trustEyebrow}</p>
                <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">{content.trustHeading}</h2>
                {content.trustParagraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-base leading-8 text-white/78">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="rounded-[30px] border border-white/10 bg-[#171d18] p-7">
                <p className="text-xs font-black uppercase tracking-[0.34em] text-[#d9f0bd]">{content.visibleDataHeading}</p>
                <div className="mt-5 space-y-4 text-base text-white/82">
                  <p>
                    <span className="font-black text-white">{content.brandLabel}:</span> Proactivitis
                  </p>
                  <p>
                    <span className="font-black text-white">{content.emailLabel}:</span> {sharedBayahibeBusiness.email}
                  </p>
                  <p>
                    <span className="font-black text-white">{content.phoneLabel}:</span> {sharedBayahibeBusiness.phone}
                  </p>
                  <p>
                    <span className="font-black text-white">{content.whatsappLabel}:</span>{" "}
                    <Link href={sharedBayahibeBusiness.whatsappLink} className="text-[#ffd5a5] underline underline-offset-4">
                      {content.directContactLabel}
                    </Link>
                  </p>
                  <p>
                    <span className="font-black text-white">{content.usefulLinksLabel}:</span>{" "}
                    <Link href={content.localeLinks.tours} className="text-[#ffd5a5] underline underline-offset-4">
                      {content.allToursLabel}
                    </Link>{" "}
                    {" | "}
                    <Link href={content.localeLinks.contact} className="text-[#ffd5a5] underline underline-offset-4">
                      {content.contactLabel}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/35 px-5 py-10 text-center sm:px-6 lg:px-8">
        <p className="text-lg font-black uppercase tracking-[0.24em] text-white">Proactivitis</p>
        <p className="mt-3 text-sm text-white/60">{content.footer}</p>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0b0f0c]/95 p-3 backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={data.reserveHref}
            className="flex min-h-14 items-center justify-center rounded-2xl bg-[#d8721c] text-sm font-black uppercase tracking-[0.2em] text-white"
          >
            {content.primaryCta}
          </Link>
          <Link
            href={data.bookingHref}
            className="flex min-h-14 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-sm font-black uppercase tracking-[0.2em] text-white"
          >
            {content.secondaryCta}
          </Link>
        </div>
      </div>
    </div>
  );
}
