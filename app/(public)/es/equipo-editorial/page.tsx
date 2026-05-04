import EditorialTeamPage, { buildEditorialTeamMetadata } from "@/components/public/EditorialTeamPage";

export const metadata = buildEditorialTeamMetadata("es");

export default function Page() {
  return <EditorialTeamPage locale="es" />;
}
