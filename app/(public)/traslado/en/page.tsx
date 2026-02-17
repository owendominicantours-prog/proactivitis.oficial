import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redirecting to Transfers | Proactivitis",
  description: "Redirect to the canonical English transfer page.",
  robots: { index: false, follow: true }
};

export default function LegacyEnglishTrasladoPage() {
  permanentRedirect("/en/traslado");
}
