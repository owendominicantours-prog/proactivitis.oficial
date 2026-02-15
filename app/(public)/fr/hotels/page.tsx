import HotelsDirectoryPage from "@/components/public/HotelsDirectoryPage";
import { fr } from "@/lib/translations";

export const metadata = {
  title: "Hebergement a Punta Cana | Proactivitis",
  description: "Consultez les hotels et resorts a Punta Cana avec infos detaillees et demande de devis."
};

export default function FrenchHotelsIndexPage() {
  return <HotelsDirectoryPage locale={fr} />;
}
