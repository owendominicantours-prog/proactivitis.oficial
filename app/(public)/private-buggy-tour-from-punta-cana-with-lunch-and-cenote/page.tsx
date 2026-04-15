import { permanentRedirect } from "next/navigation";

export default function LegacyPrivateBuggyRedirect() {
  permanentRedirect("/tours/private-buggy-tour-cenote-swim-dominican-lunch");
}
