import EditorialTeamPage, { buildEditorialTeamMetadata } from "@/components/public/EditorialTeamPage";

export const metadata = buildEditorialTeamMetadata("en");

export default function Page() {
  return <EditorialTeamPage locale="en" />;
}
