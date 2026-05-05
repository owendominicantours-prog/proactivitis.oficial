"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Locale = "es" | "en" | "fr";

type PostItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
};

type Props = {
  locale: Locale;
  posts: PostItem[];
};

const UI = {
  es: {
    searchPlaceholder: "Buscar por título, tema o intención...",
    all: "Todo",
    filters: "Filtros rápidos",
    sortLabel: "Ordenar",
    sortNewest: "Más recientes",
    sortOldest: "Más antiguos",
    sortAZ: "A-Z",
    recommendations: "Mesa de inteligencia",
    empty: "No encontramos resultados con esos filtros.",
    readMore: "Ver artículo",
    page: "Página",
    prev: "Anterior",
    next: "Siguiente",
    posts: "artículos",
    leadReport: "Reporte principal",
    latestReports: "Últimos reportes",
    intelligenceFilters: "Filtros de inteligencia",
    verified: "Verificado por Proactivitis",
    marketTrends: "Tendencias de mercado",
    logisticsAlerts: "Alertas de logística",
    dataSignals: "Señales de datos",
    liveDesk: "Monitor editorial",
    operatingSystem: "Sistema editorial activo",
    operatingCopy: "Fact-checking, clasificación de intención y actualización de sitemaps para cada publicación.",
    topSignals: "Señales principales",
    reportType: "Market Intelligence",
    sourceLine: "Fuente: Proactivitis Data Desk",
    operationsTitle: "Tablero operativo editorial",
    operationsSubtitle: "Cada reporte entra en un flujo de verificación, clasificación y distribución técnica.",
    distributionStatus: "Distribución SEO activa",
    multilingualStatus: "Cobertura multidioma",
    pressContact: "Contacto de prensa disponible"
  },
  en: {
    searchPlaceholder: "Search by title, topic, or buying intent...",
    all: "All",
    filters: "Quick filters",
    sortLabel: "Sort by",
    sortNewest: "Newest",
    sortOldest: "Oldest",
    sortAZ: "A-Z",
    recommendations: "Intelligence desk",
    empty: "No results found with those filters.",
    readMore: "Read article",
    page: "Page",
    prev: "Previous",
    next: "Next",
    posts: "articles",
    leadReport: "Lead report",
    latestReports: "Latest reports",
    intelligenceFilters: "Intelligence filters",
    verified: "Verified by Proactivitis",
    marketTrends: "Market trends",
    logisticsAlerts: "Logistics alerts",
    dataSignals: "Data signals",
    liveDesk: "Editorial monitor",
    operatingSystem: "Active editorial system",
    operatingCopy: "Fact-checking, intent classification, and sitemap refreshes for every publication.",
    topSignals: "Top signals",
    reportType: "Market Intelligence",
    sourceLine: "Source: Proactivitis Data Desk",
    operationsTitle: "Editorial operations board",
    operationsSubtitle: "Every report enters a verification, classification, and technical distribution workflow.",
    distributionStatus: "Active SEO distribution",
    multilingualStatus: "Multilingual coverage",
    pressContact: "Press contact available"
  },
  fr: {
    searchPlaceholder: "Rechercher par titre, sujet ou intention d'achat...",
    all: "Tout",
    filters: "Filtres rapides",
    sortLabel: "Trier",
    sortNewest: "Plus récents",
    sortOldest: "Plus anciens",
    sortAZ: "A-Z",
    recommendations: "Bureau d'intelligence",
    empty: "Aucun résultat avec ces filtres.",
    readMore: "Voir l'article",
    page: "Page",
    prev: "Précédent",
    next: "Suivant",
    posts: "articles",
    leadReport: "Rapport principal",
    latestReports: "Derniers rapports",
    intelligenceFilters: "Filtres d'intelligence",
    verified: "Verifie par Proactivitis",
    marketTrends: "Tendances du marche",
    logisticsAlerts: "Alertes logistiques",
    dataSignals: "Signaux de donnees",
    liveDesk: "Moniteur editorial",
    operatingSystem: "Systeme editorial actif",
    operatingCopy: "Fact-checking, classification d'intention et actualisation des sitemaps pour chaque publication.",
    topSignals: "Signaux principaux",
    reportType: "Market Intelligence",
    sourceLine: "Source : Proactivitis Data Desk",
    operationsTitle: "Tableau operationnel editorial",
    operationsSubtitle: "Chaque rapport entre dans un flux de verification, classification et distribution technique.",
    distributionStatus: "Distribution SEO active",
    multilingualStatus: "Couverture multilingue",
    pressContact: "Contact presse disponible"
  }
} as const;

const POSTS_PER_PAGE = 18;

const inferTags = (text: string) => {
  const value = text.toLowerCase();
  const tags = new Set<string>();
  if (/(hotel|resort|all inclusive|todo incluido|bahia|riu|iberostar|royalton|hyatt|cap cana|bavaro)/.test(value))
    tags.add("Hotels");
  if (/(tour|excursion|saona|buggy|atv|catamaran|party boat|parasailing|snorkel|coco bongo)/.test(value))
    tags.add("Tours");
  if (/(transfer|traslado|aeropuerto|puj|taxi|uber|movilidad|transport)/.test(value)) tags.add("Transfers");
  if (/(restaurant|restaurante|bar|night|discoteca|casino|food|comida)/.test(value)) tags.add("Nightlife");
  if (/(tips|guide|guia|comparativa|vs|seguridad|clima|sargazo|requisitos)/.test(value)) tags.add("Travel Tips");
  if (/(inversion|real estate|apartamentos|villas|condominio|confotur)/.test(value)) tags.add("Real Estate");
  if (!tags.size) tags.add("Travel Tips");
  return Array.from(tags);
};

const formatDate = (date: string | null, locale: Locale) => {
  if (!date) return "Proactivitis";
  const localeCode = locale === "es" ? "es-DO" : locale === "fr" ? "fr-FR" : "en-US";
  return new Date(date).toLocaleDateString(localeCode, { day: "2-digit", month: "short", year: "numeric" });
};

export default function BlogLibraryClient({ locale, posts }: Props) {
  const t = UI[locale];
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("ALL");
  const [sort, setSort] = useState<"newest" | "oldest" | "az">("newest");
  const [page, setPage] = useState(1);
  const [recIndex, setRecIndex] = useState(0);

  const enriched = useMemo(
    () =>
      posts.map((post) => {
        const haystack = `${post.title} ${post.excerpt ?? ""}`;
        return { ...post, tags: inferTags(haystack), haystack: haystack.toLowerCase() };
      }),
    [posts]
  );

  const availableTags = useMemo(() => {
    const freq = new Map<string, number>();
    for (const post of enriched) {
      for (const tag of post.tags) {
        freq.set(tag, (freq.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, [enriched]);

  const recommended = useMemo(() => enriched.slice(0, Math.min(8, enriched.length)), [enriched]);

  useEffect(() => {
    if (recommended.length <= 1) return;
    const timer = setInterval(() => {
      setRecIndex((value) => (value + 1) % recommended.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [recommended.length]);

  const filtered = useMemo(() => {
    let list = [...enriched];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((post) => post.haystack.includes(q));
    }
    if (activeTag !== "ALL") {
      list = list.filter((post) => post.tags.includes(activeTag));
    }
    if (sort === "az") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "oldest") {
      list.sort((a, b) => new Date(a.publishedAt ?? 0).getTime() - new Date(b.publishedAt ?? 0).getTime());
    } else {
      list.sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime());
    }
    return list;
  }, [activeTag, enriched, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagePosts = filtered.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [query, activeTag, sort]);

  const prefix = locale === "es" ? "" : `/${locale}`;
  const featured = recommended[recIndex] ?? null;
  const leadStory = filtered[0] ?? featured;
  const visiblePosts = leadStory && safePage === 1
    ? pagePosts.filter((post) => post.id !== leadStory.id)
    : pagePosts;
  const intelligenceItems = [t.marketTrends, t.logisticsAlerts, t.dataSignals];
  const leadTags = leadStory?.tags.slice(0, 3) ?? [];
  const signalPosts = filtered.filter((post) => !leadStory || post.id !== leadStory.id).slice(0, 3);
  const operatingCards = [
    { label: t.verified, value: `${filtered.length} ${t.posts}` },
    { label: t.distributionStatus, value: t.operatingCopy },
    { label: t.multilingualStatus, value: t.operatingSystem },
    { label: t.pressContact, value: t.sourceLine }
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      {leadStory ? (
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
          <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <Link href={`${prefix}/news/${leadStory.slug}`} className="group block">
              <div className="relative min-h-[340px] bg-slate-100 md:min-h-[430px]">
                <Image
                  src={leadStory.coverImage ?? "/fototours/fotosimple.jpg"}
                  alt={leadStory.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-sky-500 px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
                      {t.leadReport}
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] backdrop-blur">
                      {t.reportType}
                    </span>
                  </div>
                  <h2 className="mt-4 max-w-4xl font-serif text-4xl font-black leading-tight md:text-6xl">
                    {leadStory.title}
                  </h2>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-slate-200">
                    {leadStory.excerpt ?? "Insights and practical travel guidance from Proactivitis."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {leadTags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          </article>

          <aside className="grid gap-4">
            <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-300">{t.liveDesk}</p>
              <h3 className="mt-3 text-2xl font-black leading-tight">{t.operatingSystem}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{t.operatingCopy}</p>
              <div className="mt-5 space-y-3">
                {intelligenceItems.map((item, index) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-black">{item}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">
                      {signalPosts[index]?.title ?? t.verified}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">{t.topSignals}</p>
              <div className="mt-4 space-y-4">
                {signalPosts.map((post, index) => (
                  <Link key={post.id} href={`${prefix}/news/${post.slug}`} className="grid grid-cols-[34px_1fr] gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">
                      {index + 1}
                    </span>
                    <span>
                      <span className="line-clamp-2 text-sm font-black leading-5 text-slate-950">{post.title}</span>
                      <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {formatDate(post.publishedAt, locale)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-950 px-5 py-5 text-white md:px-7">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-300">{t.liveDesk}</p>
          <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <h2 className="font-serif text-3xl font-black">{t.operationsTitle}</h2>
            <p className="max-w-xl text-sm leading-6 text-slate-300">{t.operationsSubtitle}</p>
          </div>
        </div>
        <div className="grid gap-px bg-slate-200 md:grid-cols-4">
          {operatingCards.map((card) => (
            <div key={card.label} className="bg-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-700">{card.label}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr,280px]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr,170px]">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchPlaceholder}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none ring-sky-500 transition focus:ring-2"
            />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as "newest" | "oldest" | "az")}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700"
            >
              <option value="newest">{t.sortLabel}: {t.sortNewest}</option>
              <option value="oldest">{t.sortLabel}: {t.sortOldest}</option>
              <option value="az">{t.sortLabel}: {t.sortAZ}</option>
            </select>
          </div>
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-slate-500">{t.intelligenceFilters}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTag("ALL")}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  activeTag === "ALL"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t.all}
              </button>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    activeTag === tag
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500">
            {filtered.length} {t.posts}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-950">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-sky-300">{t.recommendations}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {intelligenceItems.map((item) => (
              <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {pagePosts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{t.empty}</div>
      ) : (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{t.latestReports}</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{filtered.length} {t.posts}</h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visiblePosts.map((post) => (
            <article
              key={post.id}
              className="group overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <Link href={`${prefix}/news/${post.slug}`} className="block">
                <div className="relative h-48">
                  <Image
                    src={post.coverImage ?? "/fototours/fotosimple.jpg"}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{formatDate(post.publishedAt, locale)}</p>
                  <span className="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">
                    {t.reportType}
                  </span>
                </div>
                <h2 className="line-clamp-2 font-serif text-xl font-black leading-tight text-slate-950">{post.title}</h2>
                <p className="line-clamp-3 text-sm text-slate-600">
                  {post.excerpt ?? "Insights and practical travel guidance from Proactivitis."}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={`${prefix}/news/${post.slug}`}
                  className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                >
                  {t.readMore}
                </Link>
              </div>
            </article>
          ))}
          </div>
        </section>
      )}

      <section className="mt-8 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          disabled={safePage <= 1}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t.prev}
        </button>
        <span className="text-xs font-semibold text-slate-600">
          {t.page} {safePage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          disabled={safePage >= totalPages}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t.next}
        </button>
      </section>
    </main>
  );
}

