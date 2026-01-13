CREATE TABLE IF NOT EXISTS "BlogPost" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT,
  "coverImage" TEXT,
  "contentHtml" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "authorId" TEXT,
  CONSTRAINT "BlogPost_slug_key" UNIQUE ("slug"),
  CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "BlogPostTour" (
  "blogPostId" TEXT NOT NULL,
  "tourId" TEXT NOT NULL,
  CONSTRAINT "BlogPostTour_pkey" PRIMARY KEY ("blogPostId", "tourId"),
  CONSTRAINT "BlogPostTour_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE,
  CONSTRAINT "BlogPostTour_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "BlogComment" (
  "id" TEXT PRIMARY KEY,
  "blogPostId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "approvedAt" TIMESTAMPTZ,
  CONSTRAINT "BlogComment_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "BlogPostTranslation" (
  "id" TEXT PRIMARY KEY,
  "blogPostId" TEXT NOT NULL,
  "locale" TEXT NOT NULL,
  "title" TEXT,
  "excerpt" TEXT,
  "contentHtml" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "sourceHash" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "BlogPostTranslation_blogPostId_locale_key" UNIQUE ("blogPostId", "locale"),
  CONSTRAINT "BlogPostTranslation_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE
);
