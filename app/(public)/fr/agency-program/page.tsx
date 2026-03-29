import { AgencyProgramPage, getAgencyProgramMetadata } from "@/components/public/AgencyProgramPage";

export const metadata = getAgencyProgramMetadata("fr");

export default function AgencyProgramPageFr() {
  return <AgencyProgramPage locale="fr" />;
}
