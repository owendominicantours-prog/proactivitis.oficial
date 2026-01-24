import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BlogShareButtons from "@/components/blog/BlogShareButtons";
import BlogCommentForm from "@/components/blog/BlogCommentForm";
import { TourCard } from "@/components/public/TourCard";
import BlogReadingProgress from "@/components/blog/BlogReadingProgress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BASE_URL = "https://proactivitis.com";

type StaticBlogTranslation = {
  title: string;
  excerpt: string;
  contentHtml: string;
};

type StaticBlogPost = {
  id: string;
  slug: string;
  coverImage?: string;
  publishedAt: Date;
  translations: Record<"es" | "en" | "fr", StaticBlogTranslation>;
};

const STATIC_POSTS: StaticBlogPost[] = [
  {
    id: "punta-cana-travel-guide-2026",
    slug: "punta-cana-travel-guide-2026",
    coverImage: "/fototours/fotosimple.jpg",
    publishedAt: new Date("2026-02-01T12:00:00Z"),
    translations: {
      es: {
        title: "Guia de viaje Punta Cana 2026: que hacer, que reservar y cuanto tiempo quedarse",
        excerpt:
          "La guia practica 2026 para planificar Punta Cana: traslados, excursiones top, precios reales y consejos para evitar sobrecostos.",
        contentHtml: `
          <p>Punta Cana sigue siendo el destino numero uno del Caribe para quienes buscan playa, seguridad y experiencias bien organizadas. En 2026 la demanda crece, los hoteles suben tarifas y el mayor dolor del viajero es la logistica. Esta guia resume lo esencial para decidir rapido: que hacer, que reservar con tiempo y como moverte sin sorpresas.</p>
          <h2>1. Punto de partida: traslados privados desde PUJ</h2>
          <p>La decision que mas impacta tu experiencia es el traslado. Un transporte privado reduce esperas, te evita colas y te deja en el lobby sin negociaciones. Si llegas en un vuelo internacional, el pick-up confirmado con tracking de vuelo evita cargos inesperados. Nuestra recomendacion es reservar el traslado antes de viajar y confirmar el hotel exacto y el horario de salida.</p>
          <p>Si viajas en pareja o en familia, un SUV o minivan privada es mas comoda y evita depender de otros viajeros. Para quienes se hospedan en Bavaro, Cap Cana o Uvero Alto, el tiempo promedio de traslado oscila entre 20 y 45 minutos dependiendo del hotel.</p>
          <h2>2. Las excursiones mas buscadas en Punta Cana 2026</h2>
          <p>El top de experiencias no cambia, pero el orden de prioridad si. En 2026 los viajeros buscan tours con picks-up claros y actividades completas. Estas son las favoritas:</p>
          <ul>
            <li><strong>Isla Saona</strong>: el clasico que siempre funciona, ideal para quienes quieren playa, catamaran y fotos de postal.</li>
            <li><strong>Buggy y ATV</strong>: aventura con barro, cueva y parada en playa Macao.</li>
            <li><strong>Party Boat / Catamaran</strong>: open bar + snorkeling + piscina natural para grupos y adultos.</li>
            <li><strong>Parasailing</strong>: vistas desde 150-200 pies sobre Bavaro.</li>
            <li><strong>Santo Domingo</strong>: historia real, zona colonial y logistica de un dia completo.</li>
          </ul>
          <p>Si solo tienes 3-4 dias, combina una excursion de playa (Saona o Catamaran) con una de aventura (Buggy o ATV). Eso te da variedad sin perder tiempo en traslados largos.</p>
          <h2>3. Cuanto tiempo quedarse y como armar un itinerario</h2>
          <p>Lo ideal para Punta Cana en 2026 son 4 a 6 dias. Menos de eso se siente apurado. Un itinerario simple que funciona:</p>
          <ul>
            <li><strong>Dia 1:</strong> llegada + traslado privado + descanso.</li>
            <li><strong>Dia 2:</strong> isla o catamaran (actividad acuática).</li>
            <li><strong>Dia 3:</strong> buggy/ATV o safari cultural.</li>
            <li><strong>Dia 4:</strong> playa libre + compras o spa.</li>
            <li><strong>Dia 5 (opcional):</strong> Santo Domingo o Samana si quieres historia o ballenas.</li>
          </ul>
          <h2>4. Precios reales y como evitar sobrecostos</h2>
          <p>El error mas comun es comprar en mostradores del hotel sin comparar. En 2026 los precios suben, pero un proveedor directo te da tarifa fija y evita comisiones. Asegurate de ver:</p>
          <ul>
            <li>Precio total con impuestos y combustible incluidos.</li>
            <li>Politica de cancelacion (ideal: 24h sin cargos).</li>
            <li>Confirmacion inmediata por WhatsApp o email.</li>
          </ul>
          <h2>5. Recomendaciones finales</h2>
          <p>Reserva primero el traslado y luego 2-3 excursiones clave. Evita saturarte con actividades diarias si viajas en familia. Si viajas en pareja, prioriza experiencias con menos grupos y mas tiempo libre.</p>
          <p>¿Listo para organizar tu viaje? Mira las opciones de <a href="/tours">tours en Punta Cana</a> o reserva tu <a href="/traslado">traslado privado</a> con confirmacion inmediata.</p>
        `
      },
      en: {
        title: "Punta Cana Travel Guide 2026: what to do, what to book, and how long to stay",
        excerpt:
          "Your 2026 planning guide for Punta Cana: transfers, top tours, real prices, and tips to avoid extra fees.",
        contentHtml: `
          <p>Punta Cana remains the #1 Caribbean destination for travelers who want beaches, safety, and well-run experiences. In 2026 demand is higher and logistics matter more. This guide covers what to do, what to book early, and how to move around without surprises.</p>
          <h2>1. Start with private transfers from PUJ</h2>
          <p>Private airport transfers save time and keep your arrival smooth. Flight tracking and confirmed pick-up reduce stress and extra charges. Book before you travel and confirm the exact hotel and arrival time.</p>
          <p>For couples and families, a private SUV or minivan is more comfortable and avoids waiting for other travelers. Typical transfer time is 20-45 minutes depending on your resort zone.</p>
          <h2>2. Top tours in Punta Cana for 2026</h2>
          <p>These experiences keep ranking because they deliver value:</p>
          <ul>
            <li><strong>Saona Island</strong>: classic beach day with catamaran vibes.</li>
            <li><strong>Buggy & ATV</strong>: off-road adventure, cave stop, and Macao Beach.</li>
            <li><strong>Party Boat / Catamaran</strong>: open bar + snorkeling + natural pool.</li>
            <li><strong>Parasailing</strong>: aerial views over Bavaro.</li>
            <li><strong>Santo Domingo</strong>: history and colonial city for a full-day trip.</li>
          </ul>
          <h2>3. How many days to stay</h2>
          <p>Four to six days is the sweet spot. A simple plan:</p>
          <ul>
            <li><strong>Day 1:</strong> arrival + private transfer.</li>
            <li><strong>Day 2:</strong> island or catamaran.</li>
            <li><strong>Day 3:</strong> buggy/ATV or cultural safari.</li>
            <li><strong>Day 4:</strong> beach + local market.</li>
            <li><strong>Day 5 (optional):</strong> Santo Domingo or Samana.</li>
          </ul>
          <h2>4. Real prices and how to avoid overpaying</h2>
          <p>Hotel desks often add commissions. Book direct to lock a fixed price and clear policy.</p>
          <ul>
            <li>Fixed total price.</li>
            <li>24h free cancellation is ideal.</li>
            <li>Instant confirmation via WhatsApp or email.</li>
          </ul>
          <h2>5. Final recommendations</h2>
          <p>Book your transfer first and then 2-3 key tours. If you travel with family, leave room for free beach days. If you want premium vibes, choose smaller group options.</p>
          <p>Explore <a href="/en/tours">Punta Cana tours</a> or reserve a <a href="/en/traslado">private transfer</a> with instant confirmation.</p>
        `
      },
      fr: {
        title: "Guide de voyage Punta Cana 2026: que faire, que reserver, et combien de jours rester",
        excerpt:
          "Guide 2026 pour planifier Punta Cana: transferts, meilleures excursions, prix reels et conseils pour eviter les frais.",
        contentHtml: `
          <p>Punta Cana reste la destination numero 1 des Caraibes pour la plage, la securite et les activites bien organisees. En 2026 la demande augmente, donc la logistique est essentielle. Ce guide explique quoi faire, quoi reserver et comment se deplacer sans surprises.</p>
          <h2>1. Commencez par le transfert prive depuis PUJ</h2>
          <p>Un transfert prive evite les attentes et garantit une arrivee fluide. Le suivi de vol et le pick-up confirme reduisent le stress. Reserve avant le voyage et confirme l'hotel.</p>
          <p>Pour les couples et familles, un SUV prive ou un minivan est plus confortable. Le temps de transfert varie entre 20 et 45 minutes selon la zone.</p>
          <h2>2. Top excursions a Punta Cana en 2026</h2>
          <ul>
            <li><strong>Isla Saona</strong>: journee plage et catamaran.</li>
            <li><strong>Buggy & ATV</strong>: aventure, grotte et plage Macao.</li>
            <li><strong>Party Boat / Catamaran</strong>: open bar + snorkeling + piscine naturelle.</li>
            <li><strong>Parasailing</strong>: vues aeriennes sur Bavaro.</li>
            <li><strong>Santo Domingo</strong>: histoire et ville coloniale.</li>
          </ul>
          <h2>3. Combien de jours rester</h2>
          <p>Quatre a six jours est ideal. Exemple:</p>
          <ul>
            <li><strong>Jour 1:</strong> arrivee + transfert prive.</li>
            <li><strong>Jour 2:</strong> ile ou catamaran.</li>
            <li><strong>Jour 3:</strong> buggy/ATV ou safari culturel.</li>
            <li><strong>Jour 4:</strong> plage + marche local.</li>
            <li><strong>Jour 5 (optionnel):</strong> Santo Domingo ou Samana.</li>
          </ul>
          <h2>4. Prix reels et comment eviter de payer trop</h2>
          <p>Les comptoirs d'hotel ajoutent souvent des commissions. Une reservation directe est plus claire.</p>
          <ul>
            <li>Prix fixe.</li>
            <li>Annulation gratuite 24h.</li>
            <li>Confirmation rapide par WhatsApp ou email.</li>
          </ul>
          <h2>5. Recommandations finales</h2>
          <p>Reservez d'abord votre transfert puis 2-3 excursions. Si vous voyagez en famille, gardez du temps libre.</p>
          <p>Voir les <a href="/fr/tours">excursions a Punta Cana</a> ou reserver un <a href="/fr/traslado">transfert prive</a>.</p>
        `
      }
    }
  }
];

const getStaticPost = (slug: string) => STATIC_POSTS.find((post) => post.slug === slug);

const LABELS = {
  es: {
    listTitle: "Noticias y guias",
    listSubtitle: "Historias, recomendaciones y actualizaciones del equipo Proactivitis.",
    listEmpty: "Todavia no hay publicaciones.",
    listCta: "Leer articulo",
    detailComments: "Comentarios",
    detailEmptyComments: "Aun no hay comentarios aprobados.",
    detailTours: "Tours recomendados"
  },
  en: {
    listTitle: "News & Guides",
    listSubtitle: "Updates, recommendations, and insights from Proactivitis.",
    listEmpty: "No posts yet.",
    listCta: "Read article",
    detailComments: "Comments",
    detailEmptyComments: "No approved comments yet.",
    detailTours: "Recommended tours"
  },
  fr: {
    listTitle: "Actualites & Guides",
    listSubtitle: "Mises a jour, recommandations et conseils de Proactivitis.",
    listEmpty: "Aucune publication pour le moment.",
    listCta: "Lire l'article",
    detailComments: "Commentaires",
    detailEmptyComments: "Aucun commentaire approuve pour le moment.",
    detailTours: "Tours recommandes"
  }
};

export async function getBlogList(locale: "es" | "en" | "fr") {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      translations: {
        where: { locale },
        select: { title: true, excerpt: true }
      }
    }
  });

  const normalizedPosts = posts.map((post) => {
    const translation = post.translations[0];
    return {
      ...post,
      title: translation?.title ?? post.title,
      excerpt: translation?.excerpt ?? post.excerpt
    };
  });

  const staticPosts = STATIC_POSTS.map((post) => ({
    id: post.id,
    title: post.translations[locale].title,
    slug: post.slug,
    excerpt: post.translations[locale].excerpt,
    coverImage: post.coverImage,
    publishedAt: post.publishedAt
  }));

  return [...staticPosts, ...normalizedPosts].sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;
  });
}

export async function buildBlogMetadata(locale: "es" | "en" | "fr"): Promise<Metadata> {
  const titleMap = {
    es: "Noticias y Blog | Proactivitis",
    en: "News & Blog | Proactivitis",
    fr: "Actualites & Blog | Proactivitis"
  } as const;
  const descriptionMap = {
    es: "Actualizaciones, consejos y novedades de Proactivitis.",
    en: "Updates, tips, and news from Proactivitis.",
    fr: "Actualites, conseils et nouvelles de Proactivitis."
  } as const;

  return {
    title: titleMap[locale],
    description: descriptionMap[locale],
    alternates: {
      canonical: locale === "es" ? `${BASE_URL}/news` : `${BASE_URL}/${locale}/news`,
      languages: {
        es: "/news",
        en: "/en/news",
        fr: "/fr/news"
      }
    }
  };
}

export async function buildBlogPostMetadata(slug: string, locale: "es" | "en" | "fr"): Promise<Metadata> {
  const staticPost = getStaticPost(slug);
  if (staticPost) {
    const translation = staticPost.translations[locale];
    const canonical =
      locale === "es" ? `${BASE_URL}/news/${staticPost.slug}` : `${BASE_URL}/${locale}/news/${staticPost.slug}`;
    return {
      title: translation.title,
      description: translation.excerpt,
      alternates: {
        canonical,
        languages: {
          es: `/news/${staticPost.slug}`,
          en: `/en/news/${staticPost.slug}`,
          fr: `/fr/news/${staticPost.slug}`
        }
      },
      openGraph: {
        title: translation.title,
        description: translation.excerpt,
        url: canonical,
        images: staticPost.coverImage ? [{ url: staticPost.coverImage }] : undefined
      }
    };
  }

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale }, select: { title: true, excerpt: true } }
    }
  });

  if (!post) {
    return { title: "Blog | Proactivitis" };
  }

  const translation = post.translations[0];
  const title = translation?.title ?? post.title;
  const description = translation?.excerpt ?? post.excerpt ?? post.title;
  const canonical = locale === "es" ? `${BASE_URL}/news/${post.slug}` : `${BASE_URL}/${locale}/news/${post.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        es: `/news/${post.slug}`,
        en: `/en/news/${post.slug}`,
        fr: `/fr/news/${post.slug}`
      }
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined
    }
  };
}

export async function renderBlogList(locale: "es" | "en" | "fr") {
  const labels = LABELS[locale];
  const posts = await getBlogList(locale);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Blog</p>
          <h1 className="text-4xl font-semibold text-slate-900">{labels.listTitle}</h1>
          <p className="text-sm text-slate-600">{labels.listSubtitle}</p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              {labels.listEmpty}
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-48 w-full bg-slate-100">
                  <Image
                    src={post.coverImage ?? "/fototours/fotosimple.jpg"}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-3 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("es-ES") : "Proactivitis"}
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">{post.title}</h2>
                  <p className="text-sm text-slate-600">{post.excerpt ?? "Proactivitis"}</p>
                  <Link
                    href={locale === "es" ? `/news/${post.slug}` : `/${locale}/news/${post.slug}`}
                    className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:bg-slate-50"
                  >
                    {labels.listCta}
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export async function renderBlogDetail(slug: string, locale: "es" | "en" | "fr") {
  const labels = LABELS[locale];
  const staticPost = getStaticPost(slug);
  if (staticPost) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | null)?.id ?? null;
    const preference = userId
      ? await prisma.customerPreference.findUnique({
          where: { userId },
          select: {
            preferredCountries: true,
            preferredDestinations: true,
            completedAt: true,
            discountEligible: true,
            discountRedeemedAt: true
          }
        })
      : null;
    const preferredCountries = (preference?.preferredCountries as string[] | undefined) ?? [];
    const preferredDestinations = (preference?.preferredDestinations as string[] | undefined) ?? [];
    const applyPreferences =
      preference?.completedAt && (preferredCountries.length || preferredDestinations.length);
    const discountPercent =
      preference?.discountEligible && !preference?.discountRedeemedAt ? 10 : 0;
    const translation = staticPost.translations[locale];
    const shareUrl =
      locale === "es"
        ? `${BASE_URL}/news/${staticPost.slug}`
        : `${BASE_URL}/${locale}/news/${staticPost.slug}`;
    const relatedTours = await prisma.tour.findMany({
      where: {
        status: "published",
        slug: { not: "transfer-privado-proactivitis" },
        ...(applyPreferences
          ? {
              departureDestination: {
                is: {
                  ...(preferredCountries.length ? { country: { slug: { in: preferredCountries } } } : {}),
                  ...(preferredDestinations.length ? { slug: { in: preferredDestinations } } : {})
                }
              }
            }
          : {})
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 4,
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        heroImage: true,
        location: true
      }
    });

    return (
      <div className="min-h-screen bg-slate-50">
        <BlogReadingProgress locale={locale} />
        <article className="mx-auto max-w-4xl px-4 py-12 space-y-8">
          <header className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              {staticPost.publishedAt.toLocaleDateString("es-ES")}
            </p>
            <h1 className="text-4xl font-semibold text-slate-900">{translation.title}</h1>
            <p className="text-sm text-slate-600">{translation.excerpt}</p>
            <BlogShareButtons url={shareUrl} title={translation.title} />
          </header>

          <div className="relative h-[320px] w-full overflow-hidden rounded-3xl bg-slate-100">
            <Image
              src={staticPost.coverImage ?? "/fototours/fotosimple.jpg"}
              alt={translation.title}
              fill
              sizes="(max-width: 768px) 100vw, 70vw"
              className="object-cover"
            />
          </div>

          <section className="blog-content">
            <div dangerouslySetInnerHTML={{ __html: translation.contentHtml }} />
          </section>

          {relatedTours.length ? (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">{labels.detailTours}</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {relatedTours.map((tour) => (
                  <TourCard
                    key={tour.id}
                    slug={tour.slug}
                    title={tour.title}
                    location={tour.location ?? "Punta Cana"}
                    price={tour.price}
                    discountPercent={discountPercent}
                    image={tour.heroImage ?? "/fototours/fotosimple.jpg"}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{labels.detailComments}</h2>
            <p className="text-sm text-slate-500">{labels.detailEmptyComments}</p>
          </section>
        </article>
      </div>
    );
  }

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      translations: {
        where: { locale },
        select: { title: true, excerpt: true, contentHtml: true }
      },
      tours: {
        select: {
          tour: {
            select: {
              id: true,
              slug: true,
              title: true,
              price: true,
              heroImage: true,
              location: true,
              departureDestination: {
                select: {
                  slug: true,
                  country: { select: { slug: true } }
                }
              }
            }
          }
        }
      },
      comments: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!post || post.status !== "PUBLISHED") {
    return null;
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | null)?.id ?? null;
  const preference = userId
    ? await prisma.customerPreference.findUnique({
        where: { userId },
        select: {
          preferredCountries: true,
          preferredDestinations: true,
          completedAt: true,
          discountEligible: true,
          discountRedeemedAt: true
        }
      })
    : null;
  const preferredCountries = (preference?.preferredCountries as string[] | undefined) ?? [];
  const preferredDestinations = (preference?.preferredDestinations as string[] | undefined) ?? [];
  const applyPreferences =
    preference?.completedAt && (preferredCountries.length || preferredDestinations.length);
  const discountPercent =
    preference?.discountEligible && !preference?.discountRedeemedAt ? 10 : 0;

  const translation = post.translations[0];
  const title = translation?.title ?? post.title;
  const excerpt = translation?.excerpt ?? post.excerpt ?? "";
  const contentHtml = translation?.contentHtml ?? post.contentHtml;
  const shareUrl = locale === "es" ? `${BASE_URL}/news/${post.slug}` : `${BASE_URL}/${locale}/news/${post.slug}`;
  const relatedTours = post.tours.map((entry) => entry.tour);
  const filteredTours = applyPreferences
    ? relatedTours.filter((tour) => {
        const destination = tour.departureDestination;
        if (!destination) return false;
        const matchesCountry = preferredCountries.length
          ? preferredCountries.includes(destination.country?.slug ?? "")
          : true;
        const matchesDestination = preferredDestinations.length
          ? preferredDestinations.includes(destination.slug)
          : true;
        return matchesCountry && matchesDestination;
      })
    : relatedTours;

  return (
    <div className="min-h-screen bg-slate-50">
      <BlogReadingProgress locale={locale} />
      <article className="mx-auto max-w-4xl px-4 py-12 space-y-8">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("es-ES") : "Proactivitis"}
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-600">{excerpt}</p>
          <BlogShareButtons url={shareUrl} title={title} />
        </header>

        <div className="relative h-[320px] w-full overflow-hidden rounded-3xl bg-slate-100">
          <Image
            src={post.coverImage ?? "/fototours/fotosimple.jpg"}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 70vw"
            className="object-cover"
          />
        </div>

        <section className="blog-content">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </section>

        {filteredTours.length ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{labels.detailTours}</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {filteredTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  slug={tour.slug}
                  title={tour.title}
                  location={tour.location}
                  price={tour.price}
                  discountPercent={discountPercent}
                  image={tour.heroImage ?? "/fototours/fotosimple.jpg"}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">{labels.detailComments}</h2>
          <BlogCommentForm blogPostId={post.id} />
          <div className="space-y-3">
            {post.comments.length === 0 ? (
              <p className="text-sm text-slate-500">{labels.detailEmptyComments}</p>
            ) : (
              post.comments.map((comment) => (
                <article key={comment.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">{comment.name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(comment.createdAt).toLocaleDateString("es-ES")}
                  </p>
                  <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{comment.body}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </article>
    </div>
  );
}
