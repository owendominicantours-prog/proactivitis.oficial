import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BlogShareButtons from "@/components/blog/BlogShareButtons";
import BlogCommentForm from "@/components/blog/BlogCommentForm";
import { TourCard } from "@/components/public/TourCard";
import BlogReadingProgress from "@/components/blog/BlogReadingProgress";

const BASE_URL = "https://proactivitis.com";

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

  return posts.map((post) => {
    const translation = post.translations[0];
    return {
      ...post,
      title: translation?.title ?? post.title,
      excerpt: translation?.excerpt ?? post.excerpt
    };
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
              location: true
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

  const translation = post.translations[0];
  const title = translation?.title ?? post.title;
  const excerpt = translation?.excerpt ?? post.excerpt ?? "";
  const contentHtml = translation?.contentHtml ?? post.contentHtml;
  const shareUrl = locale === "es" ? `${BASE_URL}/news/${post.slug}` : `${BASE_URL}/${locale}/news/${post.slug}`;
  const relatedTours = post.tours.map((entry) => entry.tour);

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

        {relatedTours.length ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">{labels.detailTours}</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {relatedTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  slug={tour.slug}
                  title={tour.title}
                  location={tour.location}
                  price={tour.price}
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
