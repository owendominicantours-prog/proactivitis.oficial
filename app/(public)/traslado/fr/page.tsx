import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redirection transferts | Proactivitis",
  description: "Redirection vers la page canonique des transferts en francais.",
  robots: { index: false, follow: true }
};

export default function LegacyFrenchTrasladoPage() {
  permanentRedirect("/fr/traslado");
}
