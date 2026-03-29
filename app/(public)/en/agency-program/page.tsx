import { AgencyProgramPage, getAgencyProgramMetadata } from "@/components/public/AgencyProgramPage";

export const metadata = getAgencyProgramMetadata("en");

export default function AgencyProgramPageEn() {
  return <AgencyProgramPage locale="en" />;
}
