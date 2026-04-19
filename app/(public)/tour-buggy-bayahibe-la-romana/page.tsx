import BayahibeBuggyLandingPage from "@/components/public/BayahibeBuggyLandingPage";
import { buildBayahibeBuggyMetadata } from "@/lib/bayahibeBuggyLanding";
import { bayahibeBuggyLandingAlternates, bayahibeBuggyLandingContent } from "@/lib/bayahibeBuggyLandingContent";

export async function generateMetadata() {
  return buildBayahibeBuggyMetadata(bayahibeBuggyLandingContent.es, {
    canonical: bayahibeBuggyLandingContent.es.pageUrl,
    languages: bayahibeBuggyLandingAlternates.languages
  });
}

export default function TourBuggyBayahibeLaRomanaPage() {
  return <BayahibeBuggyLandingPage content={bayahibeBuggyLandingContent.es} />;
}
