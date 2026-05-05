import EditorialTeamPage, { buildEditorialTeamMetadata } from "@/components/public/EditorialTeamPage";

export const metadata = buildEditorialTeamMetadata("fr");

export default function Page() {
  return <EditorialTeamPage locale="fr" />;
}
