import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StructuredData from "@/components/schema/StructuredData";
import { prisma } from "@/lib/prisma";
import {
  PROACTIVITIS_EMAIL,
  PROACTIVITIS_LOCALBUSINESS,
  PROACTIVITIS_LOGO,
  PROACTIVITIS_PHONE,
  PROACTIVITIS_URL,
  PROACTIVITIS_WHATSAPP_LINK,
  getPriceValidUntil
} from "@/lib/seo";

const PAGE_URL = `${PROACTIVITIS_URL}/en/tour-buggy-bayahibe-la-romana`;
const PAGE_TITLE = "Buggy Tour from Bayahibe La Romana | River, Bateyes & Off Road Adventure";
const PAGE_DESCRIPTION =
  "Book your buggy tour from Bayahibe or La Romana. Drive through off-road trails, visit local bateyes, swim in Chavon River and enjoy an authentic Dominican experience.";
const H1 = "Buggy Tour from Bayahibe La Romana: Off Road Adventure, River & Local Culture";
const SUBHEADLINE = "Drive through sugarcane fields, explore local villages and swim in the famous Chavon River.";
const INTRO =
  "This buggy experience from Bayahibe and La Romana is built for travelers who want more than a generic resort excursion. It mixes off-road action, sugarcane landscapes, local bateyes, river time and a slower, more authentic look at the Dominican countryside.";
const TOUR_SLUG = "half-day-atv-o-buggy-4x4-from-bayahibe-la-romana";
const DEFAULT_IMAGE = "/fototours/fototour.jpeg";
const HERO_IMAGE_WIDTH = 1600;
const HERO_IMAGE_HEIGHT = 900;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
    languages: {
      es: "/tour-buggy-bayahibe-la-romana",
      en: "/en/tour-buggy-bayahibe-la-romana",
      fr: "/fr/tour-buggy-bayahibe-la-romana"
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  openGraph: {
    type: "website",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: "Proactivitis",
    locale: "en_US",
    images: [
      {
        url: `${PROACTIVITIS_URL}${DEFAULT_IMAGE}`,
        width: HERO_IMAGE_WIDTH,
        height: HERO_IMAGE_HEIGHT,
        alt: H1
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [`${PROACTIVITIS_URL}${DEFAULT_IMAGE}`]
  }
};

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    const parsed = JSON.parse(gallery);
    return Array.isArray(parsed) ? parsed.map((value) => String(value)).filter(Boolean) : [];
  } catch {
    return [];
  }
};

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return `${PROACTIVITIS_URL}${DEFAULT_IMAGE}`;
  if (value.startsWith("http")) return value;
  return `${PROACTIVITIS_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const buildImageList = (heroImage?: string | null, gallery?: string | null) => {
  const images = [heroImage, ...parseGallery(gallery)].filter((value): value is string => Boolean(value));
  return Array.from(new Set(images)).slice(0, 6);
};

const faqItems = [
  {
    q: "Do I need experience to drive the buggy?",
    a: "No. This tour is beginner-friendly. Before departure you receive simple driving instructions and safety guidance."
  },
  {
    q: "Will I get dirty during the tour?",
    a: "Most likely yes. Mud, dust and uneven terrain are part of the off-road fun, especially in wetter conditions."
  },
  {
    q: "Is transport included from Bayahibe or La Romana?",
    a: "Yes. Hotel pickup is usually included from selected properties in Bayahibe and La Romana, subject to operational coverage."
  },
  {
    q: "Is the buggy tour safe?",
    a: "Yes. The route is operated with guides, a briefing before departure and basic safety equipment where applicable."
  },
  {
    q: "What should I wear?",
    a: "Wear light clothes that can get dirty, closed shoes or sandals with grip, sunscreen, sunglasses and a change of clothes."
  },
  {
    q: "Can kids join this excursion?",
    a: "Yes. Children can usually join as passengers, while drivers must follow the operator's age and license rules."
  }
];

export default async function BayahibeBuggyLandingPage() {
  const tour = await prisma.tour.findFirst({
    where: {
      status: "published",
      slug: TOUR_SLUG
    },
    select: {
      slug: true,
      title: true,
      price: true,
      heroImage: true,
      gallery: true
    }
  });

  const reserveHref = tour ? `/tours/${tour.slug}` : "/tours";
  const bookingHref = `${reserveHref}#booking`;
  const heroImage = tour?.heroImage ?? DEFAULT_IMAGE;
  const galleryImages = buildImageList(tour?.heroImage, tour?.gallery);
  const visibleGallery =
    galleryImages.length > 0
      ? galleryImages
      : [DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE];
  const lowestPrice = Number(tour?.price) > 0 ? Number(tour?.price) : 80;
  const heroImageAbsolute = toAbsoluteUrl(heroImage);

  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${PROACTIVITIS_URL}/#organization`,
        name: "Proactivitis",
        url: PROACTIVITIS_URL,
        logo: {
          "@type": "ImageObject",
          "@id": `${PROACTIVITIS_URL}/#logo`,
          url: PROACTIVITIS_LOGO
        },
        image: heroImageAbsolute,
        email: PROACTIVITIS_EMAIL,
        telephone: PROACTIVITIS_PHONE,
        description:
          "Proactivitis curates tours and travel experiences across the Dominican Republic with clear booking paths and practical information for international travelers."
      },
      {
        "@type": "WebSite",
        "@id": `${PROACTIVITIS_URL}/#website`,
        url: PROACTIVITIS_URL,
        name: "Proactivitis",
        publisher: {
          "@id": `${PROACTIVITIS_URL}/#organization`
        },
        inLanguage: "en"
      },
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}/#webpage`,
        url: PAGE_URL,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        isPartOf: {
          "@id": `${PROACTIVITIS_URL}/#website`
        },
        primaryImageOfPage: {
          "@id": `${PAGE_URL}/#primaryimage`
        },
        breadcrumb: {
          "@id": `${PAGE_URL}/#breadcrumb`
        },
        inLanguage: "en"
      },
      {
        "@type": "ImageObject",
        "@id": `${PAGE_URL}/#primaryimage`,
        url: heroImageAbsolute,
        contentUrl: heroImageAbsolute,
        caption: H1,
        width: HERO_IMAGE_WIDTH,
        height: HERO_IMAGE_HEIGHT
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: PROACTIVITIS_URL
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tours",
            item: `${PROACTIVITIS_URL}/tours`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Buggy Tour from Bayahibe La Romana",
            item: PAGE_URL
          }
        ]
      },
      {
        "@type": "Service",
        "@id": `${PAGE_URL}/#service`,
        name: "Buggy Tour from Bayahibe La Romana",
        serviceType: "Off-road buggy tour in Bayahibe and La Romana",
        provider: {
          "@id": `${PROACTIVITIS_URL}/#organization`
        },
        areaServed: [
          { "@type": "Place", name: "Bayahibe" },
          { "@type": "Place", name: "La Romana" },
          { "@type": "Place", name: "Dominican Republic" }
        ],
        audience: {
          "@type": "Audience",
          audienceType: ["Couples", "Families", "Adventure travelers", "Small groups"]
        },
        availableLanguage: ["English", "Spanish"],
        description: PAGE_DESCRIPTION,
        offers: {
          "@id": `${PAGE_URL}/#offer`
        }
      },
      {
        "@type": "Offer",
        "@id": `${PAGE_URL}/#offer`,
        url: reserveHref.startsWith("http") ? reserveHref : `${PROACTIVITIS_URL}${reserveHref}`,
        priceCurrency: "USD",
        price: lowestPrice,
        availability: "https://schema.org/InStock",
        priceValidUntil: getPriceValidUntil(),
        category: "Adventure tour",
        itemOffered: {
          "@id": `${PAGE_URL}/#service`
        }
      },
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}/#faq`,
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a
          }
        }))
      },
      {
        "@type": "TouristTrip",
        "@id": `${PAGE_URL}/#trip`,
        name: "Buggy Tour from Bayahibe La Romana",
        description:
          "An off-road buggy adventure through sugarcane fields, local bateyes and Chavon River near Bayahibe and La Romana.",
        provider: {
          "@id": `${PROACTIVITIS_URL}/#organization`
        },
        itinerary: [
          "Hotel pickup",
          "Arrival at the ranch",
          "Driving instructions",
          "Off-road buggy route",
          "Bateyes and local culture stop",
          "Chavon River swim stop",
          "Local tasting",
          "Return transfer"
        ],
        touristType: ["Adventure travelers", "Couples", "Families", "Groups"],
        offers: {
          "@id": `${PAGE_URL}/#offer`
        }
      },
      {
        ...PROACTIVITIS_LOCALBUSINESS,
        "@id": `${PROACTIVITIS_URL}/#localbusiness`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0b0f0c] text-white">
      <StructuredData data={schemaGraph} />

      <header className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="Buggy tour in Bayahibe and La Romana with mud, jungle and river scenery"
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
            <Link href="/" className="text-sm font-black uppercase tracking-[0.34em] text-white">
              Proactivitis
            </Link>
            <Link
              href={bookingHref}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#0d100e]"
            >
              Check Availability
            </Link>
          </div>

          <div className="grid flex-1 items-end gap-10 py-12 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-[#d8721c]/40 bg-[#d8721c]/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-[#ffd5a5]">
                Off road Dominican Republic
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-7xl">
                {H1}
              </h1>
              <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-[#d9f0bd] sm:text-2xl">{SUBHEADLINE}</p>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">{INTRO}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={reserveHref}
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#d8721c] px-8 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-[#e48a3f]"
                >
                  Book Now
                </Link>
                <Link
                  href={bookingHref}
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-[#0d100e]"
                >
                  Check Availability
                </Link>
              </div>

              <div className="mt-8 grid gap-3 text-sm font-semibold text-white/90 sm:grid-cols-3">
                {["Hotel pickup included", "No experience required", "Small groups"].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur">
                    <span className="text-[#b9df72]">+</span> {item}
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[30px] border border-white/10 bg-[rgba(12,16,13,0.8)] p-6 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-[#d9f0bd]">Quick facts</p>
              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/55">Price from</p>
                  <p className="mt-2 text-3xl font-black text-white">${lowestPrice} USD</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/55">Duration</p>
                  <p className="mt-2 text-xl font-black text-white">3 to 4 hours</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/55">Area</p>
                  <p className="mt-2 text-base font-semibold text-white">Bayahibe / La Romana</p>
                </div>
                <Link
                  href={PROACTIVITIS_WHATSAPP_LINK}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#25d366]/40 bg-[#25d366]/15 px-5 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#25d366] hover:text-[#0b0f0c]"
                >
                  Ask on WhatsApp
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
                <p className="text-xs font-black uppercase tracking-[0.34em] text-[#d9f0bd]">SEO intro</p>
                <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                  A buggy tour in Bayahibe and La Romana that feels real, not staged
                </h2>
                <p className="mt-5 text-base leading-8 text-white/78">
                  Many travelers searching for buggy tour Bayahibe, buggy La Romana or things to do in Bayahibe are
                  not looking for a polished resort-style attraction. They want an excursion that actually feels tied to
                  the destination. This route stands out because it leaves behind the polished hotel bubble and takes
                  you into off-road terrain, sugarcane areas, rural communities and the Chavon River environment.
                </p>
                <p className="mt-4 text-base leading-8 text-white/78">
                  That makes it especially attractive for visitors staying in Bayahibe or La Romana who want a
                  different rhythm from Punta Cana. The experience combines buggy driving, natural scenery and cultural
                  context in a way that feels more grounded. Instead of a generic buggy loop, the route gives you
                  movement, landscape variety and a stronger sense of place.
                </p>
                <p className="mt-4 text-base leading-8 text-white/78">
                  From an SEO perspective, this page is built to answer the real buying questions behind searches such
                  as Bayahibe excursions, La Romana buggy tour, off road Dominican Republic and Chavon River tour:
                  what the experience includes, how long it lasts, whether transport is included, what makes it
                  different and why it is worth booking directly.
                </p>
              </div>
              <div className="grid gap-4">
                {[
                  "Authentic Dominican route instead of a purely tourist setup",
                  "Off-road terrain with rural views, sugarcane fields and river stop",
                  "A strong option for travelers staying closer to Bayahibe or La Romana",
                  "Adventure, culture and nature in one experience"
                ].map((item) => (
                  <div key={item} className="rounded-[26px] border border-[#d8721c]/20 bg-[#1a211b] p-5">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#d8721c]">Why it matters</h3>
                    <p className="mt-3 text-base leading-8 text-white/78">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-black text-white sm:text-4xl">This is more than a buggy ride</h2>
            <p className="mt-5 text-base leading-8 text-white/78">
              The best part of this excursion is that it does not rely on speed alone. Yes, you get the buggy, the
              dirt roads and the splashes of mud that make an off-road tour memorable, but the route also brings in the
              kind of local context that many travelers hope to find and rarely do. You pass through sugarcane
              plantations, see landscapes that feel distinctly southeastern Dominican Republic and stop in bateyes that
              add a cultural dimension to the experience.
            </p>
            <p className="mt-4 text-base leading-8 text-white/78">
              That cultural side changes the tone of the tour. Instead of feeling like a closed circuit with staged
              photo spots, the experience gives you a view of working land, rural roads and communities tied to the
              region's agricultural history. For travelers who want more than an adrenaline shot, that local immersion
              is a major advantage.
            </p>
            <p className="mt-4 text-base leading-8 text-white/78">
              The Chavon River stop is another key differentiator. It gives the route a genuine nature moment, balances
              the driving with a refreshing pause and creates the kind of memory that makes this excursion feel broader
              than a buggy-only product. If you are comparing Bayahibe excursions and want something with action, water
              and a local Dominican feel, this format is hard to beat.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              "Off-road buggy driving through dirt and muddy tracks",
              "Sugarcane landscapes and a route that feels less crowded than Punta Cana",
              "Bateyes and local culture with a more grounded Dominican atmosphere",
              "River stop, local tasting and a full half-day adventure"
            ].map((item) => (
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
            <h2 className="text-3xl font-black text-white sm:text-4xl">Real tour itinerary from pickup to return</h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-4">
              {[
                {
                  title: "1. Hotel pickup",
                  copy:
                    "Your experience starts with pickup from selected Bayahibe or La Romana hotels so you can begin the tour without extra logistics."
                },
                {
                  title: "2. Arrival at the ranch",
                  copy:
                    "Once at the ranch, you check in, meet the team and get ready for the off-road portion of the excursion."
                },
                {
                  title: "3. Driving instructions",
                  copy:
                    "Guides explain the buggy, the route, the pace and the basic safety points before departure."
                },
                {
                  title: "4. Start of the buggy ride",
                  copy:
                    "The route begins with dirt roads, uneven terrain and the countryside feel that makes this tour different from more polished excursions."
                },
                {
                  title: "5. Bateyes and local culture",
                  copy:
                    "One of the key stops introduces travelers to bateyes and the local social context around the region."
                },
                {
                  title: "6. Chavon River swim",
                  copy:
                    "The river stop adds a refreshing natural break and a memorable contrast to the dusty buggy ride."
                },
                {
                  title: "7. Local tasting",
                  copy:
                    "Depending on operations, you may enjoy coffee, cacao, fruits or other Dominican tasting elements."
                },
                {
                  title: "8. Return transfer",
                  copy:
                    "After the route and stops, you return to the ranch and head back to your hotel."
                }
              ].map((item) => (
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
              <h2 className="text-3xl font-black text-white sm:text-4xl">What&apos;s included</h2>
              <div className="mt-8 grid gap-4">
                {[
                  "Hotel pickup",
                  "Buggy shared or private depending on option",
                  "Safety equipment",
                  "Professional guide",
                  "Bottled water",
                  "Fruits or local tasting"
                ].map((item) => (
                  <div key={item} className="rounded-[26px] border border-white/10 bg-[#171d18] p-5 text-base font-semibold text-white">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-black text-white sm:text-4xl">Key info before you book</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Duration", value: "3-4 hours" },
                  { label: "Location", value: "Bayahibe / La Romana" },
                  { label: "Languages", value: "English / Spanish" },
                  { label: "Difficulty", value: "Easy" },
                  { label: "Age", value: "From around 5+" },
                  { label: "Tour style", value: "Adventure + culture + nature" }
                ].map((item) => (
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
            <h2 className="text-3xl font-black text-white sm:text-4xl">Why this tour stands out from other Bayahibe excursions</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {[
                "Authentic Dominican experience with cultural context",
                "Less crowded feeling than many Punta Cana buggy tours",
                "Real off-road terrain instead of a flat scenic transfer",
                "Natural landscapes shaped by sugarcane fields and river scenery",
                "A balanced half-day plan with action, water and local immersion"
              ].map((item) => (
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
              <p className="text-xs font-black uppercase tracking-[0.34em] text-[#d9f0bd]">Gallery</p>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">What this buggy route looks and feels like</h2>
            </div>
            <Link
              href={reserveHref}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-white transition hover:border-[#d8721c] hover:bg-[#d8721c]"
            >
              Book Now
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
                  alt={`Bayahibe buggy tour gallery image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-4 text-sm font-semibold text-white">
                  {["Mud and buggy action", "Sugarcane landscapes", "River stop", "Local road sections", "Travelers enjoying the ride"][index] ??
                    "Off-road adventure"}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#101511]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white sm:text-4xl">What makes travelers choose this route</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "More authentic than bigger buggy hubs",
                  copy:
                    "Travelers looking for a route with more local character often prefer Bayahibe and La Romana over more saturated buggy circuits."
                },
                {
                  title: "The river stop changes the experience",
                  copy:
                    "The Chavon River break adds scenery, freshness and a stronger nature component than a ride-only format."
                },
                {
                  title: "A strong fit for international visitors",
                  copy:
                    "If you want off-road terrain, real local context and a manageable half-day excursion, this is one of the best tours to compare."
                }
              ].map((item) => (
                <article key={item.title} className="rounded-[28px] border border-white/10 bg-[#171d18] p-6">
                  <h3 className="text-xl font-black text-white">{item.title}</h3>
                  <p className="mt-4 text-base leading-8 text-white/75">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white sm:text-4xl">Frequently asked questions</h2>
          <div className="mt-8 space-y-4">
            {faqItems.map((item) => (
              <article key={item.q} className="rounded-[26px] border border-white/10 bg-[#171d18] p-6">
                <h3 className="text-xl font-black text-white">{item.q}</h3>
                <p className="mt-3 text-base leading-8 text-white/75">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#0f1410]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white sm:text-4xl">Book your buggy adventure from Bayahibe today</h2>
            <div className="mt-8 overflow-hidden rounded-[36px] border border-[#d8721c]/30 bg-[linear-gradient(135deg,#d8721c_0%,#7b4d1f_100%)] p-8 shadow-[0_30px_80px_rgba(216,114,28,0.22)] sm:p-12">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-white/78">Limited availability during high season</p>
              <p className="mt-4 max-w-4xl text-3xl font-black leading-tight text-white sm:text-5xl">
                Reserve your off-road, river and local culture experience before the most convenient departure times fill up.
              </p>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/88 sm:text-lg">
                If you want a buggy tour from Bayahibe or La Romana that feels more authentic, less crowded and more connected to the landscape,
                this is a strong option to book directly with Proactivitis.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={reserveHref}
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#0f1210] px-8 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-black"
                >
                  Reserve Now
                </Link>
                <Link
                  href={bookingHref}
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-8 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-[#111214]"
                >
                  Check Availability
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#0b0f0c]">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.34em] text-[#d9f0bd]">Proactivitis</p>
                <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">Travel information with booking clarity</h2>
                <p className="mt-5 text-base leading-8 text-white/78">
                  This page is published by Proactivitis and built to help international travelers compare Bayahibe
                  excursions with clear information, structured content and direct booking access.
                </p>
                <p className="mt-4 text-base leading-8 text-white/78">
                  Review schema has intentionally been omitted because no real public review dataset is displayed on this
                  page. If verified review content is added later, the schema structure can be extended cleanly.
                </p>
              </div>
              <div className="rounded-[30px] border border-white/10 bg-[#171d18] p-7">
                <p className="text-xs font-black uppercase tracking-[0.34em] text-[#d9f0bd]">Visible business data</p>
                <div className="mt-5 space-y-4 text-base text-white/82">
                  <p>
                    <span className="font-black text-white">Brand:</span> Proactivitis
                  </p>
                  <p>
                    <span className="font-black text-white">Email:</span> {PROACTIVITIS_EMAIL}
                  </p>
                  <p>
                    <span className="font-black text-white">Phone:</span> {PROACTIVITIS_PHONE}
                  </p>
                  <p>
                    <span className="font-black text-white">WhatsApp:</span>{" "}
                    <Link href={PROACTIVITIS_WHATSAPP_LINK} className="text-[#ffd5a5] underline underline-offset-4">
                      Direct contact
                    </Link>
                  </p>
                  <p>
                    <span className="font-black text-white">Useful links:</span>{" "}
                    <Link href="/tours" className="text-[#ffd5a5] underline underline-offset-4">
                      All tours
                    </Link>{" "}
                    {" | "}
                    <Link href="/contact" className="text-[#ffd5a5] underline underline-offset-4">
                      Contact
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
        <p className="mt-3 text-sm text-white/60">Copyright 2026 Proactivitis. All rights reserved.</p>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0b0f0c]/95 p-3 backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={reserveHref}
            className="flex min-h-14 items-center justify-center rounded-2xl bg-[#d8721c] text-sm font-black uppercase tracking-[0.2em] text-white"
          >
            Book Now
          </Link>
          <Link
            href={bookingHref}
            className="flex min-h-14 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-sm font-black uppercase tracking-[0.2em] text-white"
          >
            Availability
          </Link>
        </div>
      </div>
    </div>
  );
}
