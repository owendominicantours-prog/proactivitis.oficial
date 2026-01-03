CREATE TYPE  TranslationStatus AS ENUM ('PENDING', 'TRANSLATED');

CREATE TABLE InfoPageTranslation (
    id TEXT NOT NULL,
    pageKey TEXT NOT NULL,
    locale TEXT NOT NULL,
    hero JSONB NOT NULL,
    sections JSONB NOT NULL,
    status TranslationStatus NOT NULL DEFAULT 'PENDING',
    sourceHash TEXT,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT InfoPageTranslation_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX InfoPageTranslation_pageKey_locale_key ON InfoPageTranslation (pageKey, locale);
