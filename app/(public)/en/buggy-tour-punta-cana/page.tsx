import BuggyLandingPage from "@/components/public/BuggyLandingPage";
import { buildBuggyLandingMetadata } from "@/lib/buggyLanding";
import { buggyLandingAlternates, buggyLandingContent } from "@/lib/buggyLandingContent";

export async function generateMetadata() {
  return buildBuggyLandingMetadata(buggyLandingContent.en, {
    canonical: buggyLandingContent.en.pageUrl,
    languages: buggyLandingAlternates.languages
  });
}

export default async function EnglishBuggyLandingPage() {
  return <BuggyLandingPage content={buggyLandingContent.en} />;
}
