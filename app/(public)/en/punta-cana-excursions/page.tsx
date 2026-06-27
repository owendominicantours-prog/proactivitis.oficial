import {
  NuevaGeneracionToursIndexPage,
  buildNuevaGeneracionIndexMetadata
} from "@/components/public/NuevaGeneracionExperiencePages";

export const metadata = buildNuevaGeneracionIndexMetadata("en");
export const revalidate = 86400;

export default async function Page() {
  return <NuevaGeneracionToursIndexPage locale="en" />;
}
