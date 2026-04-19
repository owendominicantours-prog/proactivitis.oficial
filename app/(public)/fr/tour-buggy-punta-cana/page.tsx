import BuggyLandingPage from "@/components/public/BuggyLandingPage";
import { buildBuggyLandingMetadata } from "@/lib/buggyLanding";
import { buggyLandingAlternates, buggyLandingContent } from "@/lib/buggyLandingContent";

export async function generateMetadata() {
  return buildBuggyLandingMetadata(buggyLandingContent.fr, {
    canonical: buggyLandingContent.fr.pageUrl,
    languages: buggyLandingAlternates.languages
  });
}

export default async function FrenchBuggyLandingPage() {
  return <BuggyLandingPage content={buggyLandingContent.fr} />;
}
