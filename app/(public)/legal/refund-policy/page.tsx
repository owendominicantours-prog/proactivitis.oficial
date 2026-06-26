import type { Metadata } from "next";

import { RefundPolicyPage } from "@/components/public/RefundPolicyPage";

export const metadata: Metadata = {
  title: "Politica de devoluciones y reembolsos | Proactivitis",
  description:
    "Politica de devoluciones, cancelaciones, cambios y reembolsos para tours, traslados, rent car y servicios turisticos reservados en Proactivitis.",
  alternates: {
    canonical: "https://proactivitis.com/legal/refund-policy"
  }
};

export default function LegalRefundPolicyRoute() {
  return <RefundPolicyPage />;
}
