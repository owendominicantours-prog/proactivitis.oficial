import BayahibeBuggyLandingPage from "@/components/public/BayahibeBuggyLandingPage";
import { buildBayahibeBuggyMetadata } from "@/lib/bayahibeBuggyLanding";
import { bayahibeBuggyLandingAlternates, bayahibeBuggyLandingContent } from "@/lib/bayahibeBuggyLandingContent";

export async function generateMetadata() {
  return buildBayahibeBuggyMetadata(bayahibeBuggyLandingContent.en, {
    canonical: bayahibeBuggyLandingContent.en.pageUrl,
    languages: bayahibeBuggyLandingAlternates.languages
  });
}

export default function TourBuggyBayahibeLaRomanaEnPage() {
  return <BayahibeBuggyLandingPage content={bayahibeBuggyLandingContent.en} />;
}
