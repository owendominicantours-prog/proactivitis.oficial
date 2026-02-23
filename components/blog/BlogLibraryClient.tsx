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
    recommendations: "Recomendaciones rotativas",
    empty: "No encontramos resultados con esos filtros.",
    readMore: "Ver artículo",
    page: "Página",
    prev: "Anterior",
    next: "Siguiente",
    posts: "artículos"
  },
  en: {
    searchPlaceholder: "Search by title, topic, or buying intent...",
    all: "All",
    filters: "Quick filters",
    sortLabel: "Sort by",
    sortNewest: "Newest",
    sortOldest: "Oldest",
    sortAZ: "A-Z",
    recommendations: "Rotating recommendations",
    empty: "No results found with those filters.",
    readMore: "Read article",
    page: "Page",
    prev: "Previous",
    next: "Next",
    posts: "articles"
  },
  fr: {
    searchPlaceholder: "Rechercher par titre, sujet ou intention d'achat...",
    all: "Tout",
    filters: "Filtres rapides",
    sortLabel: "Trier",
    sortNewest: "Plus récents",
    sortOldest: "Plus anciens",
    sortAZ: "A-Z",
    recommendations: "Recommandations rotatives",
    empty: "Aucun résultat avec ces filtres.",
    readMore: "Voir l'article",
    page: "Page",
    prev: "Précédent",
    next: "Suivant",
    posts: "articles"
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr,340px]">
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
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-slate-500">{t.filters}</p>
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

        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300">{t.recommendations}</p>
          {featured ? (
            <Link href={`${prefix}/news/${featured.slug}`} className="mt-3 block">
              <div className="relative h-28 overflow-hidden rounded-xl">
                <Image
                  src={featured.coverImage ?? "/fototours/fotosimple.jpg"}
                  alt={featured.title}
                  fill
                  className="object-cover opacity-90"
                />
              </div>
              <h3 className="mt-3 line-clamp-2 text-sm font-semibold">{featured.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-slate-300">{featured.excerpt ?? ""}</p>
            </Link>
          ) : null}
        </div>
      </section>

      {pagePosts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{t.empty}</div>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {pagePosts.map((post) => (
            <article
              key={post.id}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
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
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{formatDate(post.publishedAt, locale)}</p>
                <h2 className="line-clamp-2 text-xl font-semibold text-slate-900">{post.title}</h2>
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

