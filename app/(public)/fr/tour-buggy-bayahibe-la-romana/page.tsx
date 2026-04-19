import BayahibeBuggyLandingPage from "@/components/public/BayahibeBuggyLandingPage";
import { buildBayahibeBuggyMetadata } from "@/lib/bayahibeBuggyLanding";
import { bayahibeBuggyLandingAlternates, bayahibeBuggyLandingContent } from "@/lib/bayahibeBuggyLandingContent";

export async function generateMetadata() {
  return buildBayahibeBuggyMetadata(bayahibeBuggyLandingContent.fr, {
    canonical: bayahibeBuggyLandingContent.fr.pageUrl,
    languages: bayahibeBuggyLandingAlternates.languages
  });
}

export default function TourBuggyBayahibeLaRomanaFrPage() {
  return <BayahibeBuggyLandingPage content={bayahibeBuggyLandingContent.fr} />;
}
