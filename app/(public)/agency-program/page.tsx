import { AgencyProgramPage, getAgencyProgramMetadata } from "@/components/public/AgencyProgramPage";

export const metadata = getAgencyProgramMetadata("es");

export default function AgencyProgramPageEs() {
  return <AgencyProgramPage locale="es" />;
}
