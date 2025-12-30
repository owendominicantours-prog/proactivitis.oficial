import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PublicDestinationsPage from "@/components/public/PublicDestinationsPage";

const canonicalUrl = "https://proactivitis.com/destinos";

export const metadata: Metadata = {
  title: "Destinos Curados | Proactivitis Global Destinations",
  description:
    "Explora nuestra lista VIP de destinos globales. Solo regiones auditadas y equipos locales verificados para experiencias premium.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/destinos",
      en: "/en/destinos",
      fr: "/fr/destinos"
    }
  }
};

export default function SpanishDestinationsPage() {
  return <PublicDestinationsPage locale={es} />;
}
