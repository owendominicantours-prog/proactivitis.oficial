import HotelsDirectoryPage from "@/components/public/HotelsDirectoryPage";
import { es } from "@/lib/translations";

export const metadata = {
  title: "Alojamiento en Punta Cana | Proactivitis",
  description: "Encuentra hoteles y resorts en Punta Cana con informacion completa y solicitud de cotizacion."
};

export default function SpanishHotelsIndexPage() {
  return <HotelsDirectoryPage locale={es} />;
}
