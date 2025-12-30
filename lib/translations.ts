import esMessages from "@/messages/es.json";
import enMessages from "@/messages/en.json";
import frMessages from "@/messages/fr.json";

export const translations = {
  es: esMessages,
  en: enMessages,
  fr: frMessages
} as const;

export type Locale = keyof typeof translations;

export const es: Locale = "es";
export const en: Locale = "en";
export const fr: Locale = "fr";

export type TranslationKey = keyof typeof esMessages;

export function translate(
  locale: Locale,
  key: TranslationKey,
  replacements?: Record<string, string | number>
) {
  let value = translations[locale][key];
  if (!value) return key;
  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, replacement]) => {
      value = value.replaceAll(`{${placeholder}}`, String(replacement));
    });
  }
  return value;
}
