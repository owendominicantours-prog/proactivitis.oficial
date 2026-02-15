import HotelsDirectoryPage from "@/components/public/HotelsDirectoryPage";
import { en } from "@/lib/translations";

export const metadata = {
  title: "Punta Cana Accommodation | Proactivitis",
  description: "Browse hotels and resorts in Punta Cana with details and quote request options."
};

export default function EnglishHotelsIndexPage() {
  return <HotelsDirectoryPage locale={en} />;
}
