import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { InfoPage, infoPages, type InfoSection } from "@/lib/infoPages";
import { translateEntries, translateText } from "@/lib/translationService";
import { TranslationStatus } from "@prisma/client";

import { InfoLocale } from "@/lib/infoRoutes";

type InfoPageTranslationPayload = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  hero: InfoPage["hero"];
  sections: InfoPage["sections"];
};

function hashInfoPage(page: InfoPage) {
  const segments: string[] = [];
  const add = (value?: string) => {
    if (value) segments.push(value);
  };
  add(page.seoTitle);
  add(page.seoDescription);
  add(page.hero.eyebrow);
  add(page.hero.title);
  add(page.hero.subtitle);
  page.sections.forEach((section) => {
    add(section.title);
    switch (section.type) {
      case "columns":
        section.columns.forEach((column) => {
          add(column.title);
          column.items.forEach(add);
        });
        break;
      case "faq":
      case "faq-group":
        section.items.forEach((item) => {
          add(item.question);
          add(item.answer);
          add(item.ctaLabel);
        });
        break;
      case "cta":
        add(section.body);
        add(section.primaryLabel);
        add(section.secondaryLabel);
        break;
      case "contact-info":
        section.items.forEach((item) => {
          add(item.label);
        });
        break;
      case "form":
        add(section.description);
        add(section.title);
        section.fields.forEach((field) => {
          add(field.label);
          add(field.placeholder);
          field.options?.forEach(add);
        });
        add(section.submitLabel);
        break;
      case "steps":
        section.steps.forEach((step) => {
          add(step.label);
          add(step.description);
        });
        break;
    case "text":
    case "legal-section":
      section.body?.forEach(add);
      break;
    case "bullets":
    case "list":
      section.items?.forEach(add);
      break;
      default:
        break;
    }
  });
  return crypto.createHash("sha256").update(segments.join("||")).digest("hex");
}

async function translateSection(section: InfoSection, locale: InfoLocale): Promise<InfoSection> {
  const translateString = async (value?: string) => (value ? translateText(value, locale) : value);
  switch (section.type) {
    case "columns":
      return {
        ...section,
        title: await translateString(section.title),
        columns: await Promise.all(
          section.columns.map(async (column) => ({
            ...column,
            title: await translateString(column.title),
            items: await translateEntries(column.items ?? [], locale)
          }))
        )
      };
    case "faq":
    case "faq-group":
      return {
        ...section,
        title: await translateString(section.title),
        items: await Promise.all(
          section.items.map(async (item) => ({
            ...item,
            question: await translateString(item.question),
            answer: await translateString(item.answer),
            ctaLabel: await translateString(item.ctaLabel)
          }))
        )
      };
    case "cta":
      return {
        ...section,
        title: await translateString(section.title),
        body: await translateString(section.body),
        primaryLabel: await translateString(section.primaryLabel),
        secondaryLabel: await translateString(section.secondaryLabel)
      };
    case "contact-info":
      return {
        ...section,
        title: await translateString(section.title),
        items: await Promise.all(
          section.items.map(async (item) => ({
            ...item,
            label: item.label ? await translateText(item.label, locale) : item.label
          }))
        )
      };
    case "form":
      return {
        ...section,
        title: await translateString(section.title),
        description: await translateString(section.description),
        fields: await Promise.all(
          section.fields.map(async (field) => ({
            ...field,
            label: await translateString(field.label),
            placeholder: await translateString(field.placeholder),
            options: field.options ? await translateEntries(field.options, locale) : undefined
          }))
        ),
        submitLabel: await translateString(section.submitLabel)
      };
    case "steps":
      return {
        ...section,
        title: await translateString(section.title),
        steps: await Promise.all(
          section.steps.map(async (step) => ({
            ...step,
            label: await translateString(step.label),
            description: await translateString(step.description)
          }))
        )
      };
    case "text":
      return {
        ...section,
        title: await translateString(section.title),
        body: section.body ? await translateEntries(section.body, locale) : section.body
      };
    case "bullets":
    case "list":
      return {
        ...section,
        title: await translateString(section.title),
        items: section.items ? await translateEntries(section.items, locale) : section.items
      };
    case "legal-section":
      return {
        ...section,
        title: await translateString(section.title),
        body: section.body ? await translateEntries(section.body, locale) : section.body
      };
    default:
      return section;
  }
}

async function translateInfoPageContent(page: InfoPage, locale: InfoLocale): Promise<InfoPageTranslationPayload> {
  const seoTitle = page.seoTitle ? await translateText(page.seoTitle, locale) : null;
  const seoDescription = page.seoDescription ? await translateText(page.seoDescription, locale) : null;
  const hero = {
    ...page.hero,
    eyebrow: await translateText(page.hero.eyebrow, locale),
    title: await translateText(page.hero.title, locale),
    subtitle: await translateText(page.hero.subtitle, locale)
  };
  const sections = await Promise.all(page.sections.map((section) => translateSection(section, locale)));
  return { seoTitle, seoDescription, hero, sections };
}

export async function translateInfoPage(pageKey: string, locale: InfoLocale) {
  const page = infoPages.find((item) => item.key === pageKey);
  if (!page) return;
  const hash = hashInfoPage(page);
  const existing = await prisma.infoPageTranslation.findUnique({
    where: {
      pageKey_locale: {
        pageKey,
        locale
      }
    }
  });
  if (existing?.sourceHash === hash && existing.status === TranslationStatus.TRANSLATED) {
    return;
  }

  const payload = await translateInfoPageContent(page, locale);
  await prisma.infoPageTranslation.upsert({
    where: {
      pageKey_locale: {
        pageKey,
        locale
      }
    },
    create: {
      pageKey,
      locale,
      seoTitle: payload.seoTitle ?? null,
      seoDescription: payload.seoDescription ?? null,
      hero: payload.hero,
      sections: payload.sections,
      status: TranslationStatus.TRANSLATED,
      sourceHash: hash
    },
    update: {
      seoTitle: payload.seoTitle ?? null,
      seoDescription: payload.seoDescription ?? null,
      hero: payload.hero,
      sections: payload.sections,
      status: TranslationStatus.TRANSLATED,
      sourceHash: hash
    }
  });
}

export async function getTranslatedInfoPage(pageKey: string, locale: InfoLocale) {
  const translation = await prisma.infoPageTranslation.findUnique({
    where: {
      pageKey_locale: {
        pageKey,
        locale
      }
    }
  });
  if (!translation) return null;
  return {
    seoTitle: translation.seoTitle as string | null,
    seoDescription: translation.seoDescription as string | null,
    hero: translation.hero as InfoPage["hero"],
    sections: translation.sections as InfoPage["sections"]
  };
}

export async function resolveInfoPageContent(pageKey: string, locale: InfoLocale) {
  const page = infoPages.find((item) => item.key === pageKey);
  if (!page) return null;
  if (locale === "es") return page;
  const translated = await getTranslatedInfoPage(pageKey, locale);
  if (!translated) return page;
  return {
    ...page,
    seoTitle: translated.seoTitle ?? page.seoTitle,
    seoDescription: translated.seoDescription ?? page.seoDescription,
    hero: translated.hero,
    sections: translated.sections
  };
}
