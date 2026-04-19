import Image from "next/image";
import Link from "next/link";
import StructuredData from "@/components/schema/StructuredData";
import {
  DEFAULT_IMAGE,
  buildBuggySchemaGraph,
  getBuggyLandingData,
  sharedBuggyContact,
  type BuggyLandingContent
} from "@/lib/buggyLanding";

type BuggyLandingPageProps = {
  content: BuggyLandingContent;
};

export default async function BuggyLandingPage({ content }: BuggyLandingPageProps) {
  const localePrefix = content.locale === "es" ? "" : `/${content.locale}`;
  const data = await getBuggyLandingData(localePrefix);
  const schemaGraph = buildBuggySchemaGraph(content, data);
  const visibleGallery =
    data.galleryImages.length > 0
      ? data.galleryImages
      : [DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE];

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white">
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
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.72)_52%,rgba(13,13,15,0.98)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,125,20,0.42),transparent_34%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[92svh] max-w-7xl flex-col px-5 pb-16 pt-7 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href={content.localeLinks.home} className="text-sm font-black uppercase tracking-[0.34em] text-white">
              Proactivitis
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href={content.localeLinks.contact}
                className="hidden rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#101113] sm:inline-flex"
              >
                {content.navbarContact}
              </Link>
              <Link
                href={data.bookingHref}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#101113]"
              >
                {content.navbarAvailability}
              </Link>
            </div>
          </div>

          <div className="grid flex-1 items-end gap-10 py-12 lg:grid-cols-[1.15fr,0.85fr]">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-[#ff7d14]/40 bg-[#ff7d14]/18 px-4 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-[#ffd39f]">
                {content.heroBadge}
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-7xl">{content.pageName}</h1>
              <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-[#ffd39f] sm:text-2xl">{content.subheadline}</p>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">{content.intro}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={data.reserveHref}
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#ff7d14] px-8 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-[#ff9340]"
                >
                  {content.primaryCta}
                </Link>
                <Link
                  href={data.bookingHref}
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-[#101113]"
                >
                  {content.secondaryCta}
                </Link>
              </div>

              <div className="mt-8 grid gap-3 text-sm font-semibold text-white/90 sm:grid-cols-2">
                {content.microBenefits.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur">
                    <span className="text-[#ffb362]">+</span> {item}
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[30px] border border-white/10 bg-[rgba(15,15,18,0.78)] p-6 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-[#ffb362]">{content.quickSummary}</p>
              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/55">{content.priceFrom}</p>
                  <p className="mt-2 text-3xl font-black text-white">${data.lowestPrice} USD</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/55">{content.durationLabel}</p>
                  <p className="mt-2 text-xl font-black text-white">{content.pricingCards[1]?.value ?? "3-5h"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/55">{content.idealForLabel}</p>
                  <p className="mt-2 text-base font-semibold text-white">{content.idealForValue}</p>
                </div>
                <Link
                  href={sharedBuggyContact.whatsappLink}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#25d366]/40 bg-[#25d366]/15 px-5 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#25d366] hover:text-[#0d0d0f]"
                >
                  {content.whatsappCta}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </header>

      <main>
        <nav aria-label="Table of contents" className="border-b border-white/10 bg-[#121216]">
          <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3">
              {content.toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/85 transition hover:border-[#ff7d14] hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        <section id="mejores-tours" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-[32px] border border-white/10 bg-[#17181c] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:p-9">
              <p className="text-xs font-black uppercase tracking-[0.34em] text-[#ffb362]">{content.pillarEyebrow}</p>
              <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">{content.pillarHeading}</h2>
              {content.pillarParagraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-base leading-8 text-white/80">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="grid gap-4">
              {content.pillarCards.map((item) => (
                <div key={item} className="rounded-[26px] border border-[#ff7d14]/20 bg-[#1c1d22] p-5">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#ff7d14]">{content.pillarCardEyebrow}</h3>
                  <p className="mt-3 text-base leading-8 text-white/78">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="incluye" className="border-y border-white/10 bg-[#131419]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white sm:text-4xl">{content.includesHeading}</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/78">{content.includesIntro}</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {content.includes.map((item) => (
                <article key={item.title} className="rounded-[28px] border border-white/10 bg-[#1d1f24] p-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff7d14] text-lg font-black text-white">
                    +
                  </span>
                  <h3 className="mt-4 text-xl font-black text-white">{item.title}</h3>
                  <p className="mt-3 text-base leading-8 text-white/75">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="ruta" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-black text-white sm:text-4xl">{content.routeHeading}</h2>
            <p className="mt-5 text-base leading-8 text-white/78">{content.routeIntro}</p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {content.routeSteps.map((step, index) => (
              <article key={step.title} className="rounded-[28px] border border-white/10 bg-[#17181d] p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#ffb362]">
                  {content.routeStepLabel} {index + 1}
                </p>
                <h3 className="mt-3 text-xl font-black text-white">{step.title}</h3>
                <p className="mt-3 text-base leading-8 text-white/75">{step.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="por-que-elegirlo" className="border-y border-white/10 bg-[#121318]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.95fr,1.05fr]">
              <div>
                <h2 className="text-3xl font-black text-white sm:text-4xl">{content.chooseHeading}</h2>
                {content.chooseParagraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-base leading-8 text-white/78">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="grid gap-4">
                {content.differentiators.map((item) => (
                  <div key={item} className="rounded-[26px] border border-[#ff7d14]/18 bg-[#1d1f24] p-5">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#ff7d14]">{content.differentiatorEyebrow}</h3>
                    <p className="mt-3 text-base leading-8 text-white/78">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="precios" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white sm:text-4xl">{content.pricingHeading}</h2>
          <div className="mt-8 grid gap-4 xl:grid-cols-4">
            {content.pricingCards.map((item) => (
              <article key={item.label} className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#1f2025_0%,#15161a_100%)] p-6">
                <p className="text-xs font-black uppercase tracking-[0.34em] text-[#ffb362]">{item.label}</p>
                <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
                <p className="mt-4 text-sm leading-7 text-white/72">{item.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr,0.95fr]">
            <div className="rounded-[32px] border border-white/10 bg-[#17181d] p-7">
              <h3 className="text-2xl font-black text-white">{content.packingHeading}</h3>
              <p className="mt-4 text-base leading-8 text-white/78">{content.packingParagraph}</p>
              <ul className="mt-6 space-y-3">
                {content.packingTips.map((item) => (
                  <li key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white/82">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#17181d] p-7">
              <h3 className="text-2xl font-black text-white">{content.bookingHeading}</h3>
              {content.bookingParagraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-base leading-8 text-white/78">
                  {paragraph}
                </p>
              ))}
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={data.reserveHref}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#ff7d14] px-6 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#ff9340]"
                >
                  {content.primaryCta}
                </Link>
                <Link
                  href={content.localeLinks.contact}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#111216]"
                >
                  {content.navbarContact}
                </Link>
              </div>
              {/* Add privacy-policy and terms links here if public routes are created later. */}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#131419]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.34em] text-[#ffb362]">{content.galleryEyebrow}</p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">{content.galleryHeading}</h2>
              </div>
              <Link
                href={content.localeLinks.puntaCanaTours}
                className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-white transition hover:border-[#ff7d14] hover:bg-[#ff7d14]"
              >
                {content.moreToursCta}
              </Link>
            </div>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {visibleGallery.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className={`relative overflow-hidden rounded-[26px] border border-white/10 bg-[#1d1e22] ${
                    index === 0 ? "md:col-span-2 md:min-h-[420px]" : "min-h-[220px]"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${content.pageName} - image ${index + 1}`}
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
          </div>
        </section>

        <section id="opiniones" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white sm:text-4xl">{content.opinionsHeading}</h2>
          <p className="mt-5 max-w-4xl text-base leading-8 text-white/78">{content.opinionsIntro}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {content.opinionCards.map((item) => (
              <article key={item.title} className="rounded-[28px] border border-white/10 bg-[#17181d] p-6">
                <h3 className="text-xl font-black text-white">{item.title}</h3>
                <p className="mt-4 text-base leading-8 text-white/75">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="border-y border-white/10 bg-[#131419]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white sm:text-4xl">{content.faqHeading}</h2>
            <div className="mt-8 space-y-4">
              {content.faq.map((item) => (
                <article key={item.q} className="rounded-[26px] border border-white/10 bg-[#1b1d22] p-6">
                  <h3 className="text-xl font-black text-white">{item.q}</h3>
                  <p className="mt-3 text-base leading-8 text-white/75">{item.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="reservar" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white sm:text-4xl">{content.finalHeading}</h2>
          <div className="mt-8 overflow-hidden rounded-[36px] border border-[#ff7d14]/30 bg-[linear-gradient(135deg,#ff7d14_0%,#ba4d09_100%)] p-8 shadow-[0_30px_80px_rgba(255,125,20,0.2)] sm:p-12">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-white/76">{content.finalEyebrow}</p>
            <p className="mt-4 max-w-4xl text-3xl font-black leading-tight text-white sm:text-5xl">{content.finalHeading}</p>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/88 sm:text-lg">{content.finalBody}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={data.reserveHref}
                className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#111214] px-8 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-black"
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
        </section>

        <section className="border-t border-white/10 bg-[#0f1013]">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.34em] text-[#ffb362]">{content.trustEyebrow}</p>
                <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">{content.trustHeading}</h2>
                {content.trustParagraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-base leading-8 text-white/78">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="rounded-[30px] border border-white/10 bg-[#17181d] p-7">
                <p className="text-xs font-black uppercase tracking-[0.34em] text-[#ffb362]">{content.visibleDataEyebrow}</p>
                <div className="mt-5 space-y-4 text-base text-white/82">
                  <p>
                    <span className="font-black text-white">{content.brandLabel}:</span> Proactivitis
                  </p>
                  <p>
                    <span className="font-black text-white">{content.emailLabel}:</span> {sharedBuggyContact.email}
                  </p>
                  <p>
                    <span className="font-black text-white">{content.phoneLabel}:</span> {sharedBuggyContact.phone}
                  </p>
                  <p>
                    <span className="font-black text-white">{content.whatsappLabel}:</span>{" "}
                    <Link href={sharedBuggyContact.whatsappLink} className="text-[#ffd39f] underline underline-offset-4">
                      {content.directContactLabel}
                    </Link>
                  </p>
                  <p>
                    <span className="font-black text-white">{content.usefulLinksLabel}:</span>{" "}
                    <Link href={content.localeLinks.tours} className="text-[#ffd39f] underline underline-offset-4">
                      {content.allToursLabel}
                    </Link>{" "}
                    {" | "}
                    <Link href={content.localeLinks.puntaCanaTours} className="text-[#ffd39f] underline underline-offset-4">
                      {content.puntaCanaToursLabel}
                    </Link>{" "}
                    {" | "}
                    <Link href={content.localeLinks.contact} className="text-[#ffd39f] underline underline-offset-4">
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

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0d0d0f]/95 p-3 backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={data.reserveHref}
            className="flex min-h-14 items-center justify-center rounded-2xl bg-[#ff7d14] text-sm font-black uppercase tracking-[0.2em] text-white"
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
