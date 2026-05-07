import type { ReactNode } from "react";

const webStripeError = {
  message: "Stripe nativo no esta disponible en esta plataforma."
};

export function AppStripeProvider({ children }: { publishableKey: string; children: ReactNode }) {
  return <>{children}</>;
}

export function StripeDeepLinkHandler() {
  return null;
}

export function useAppStripe() {
  return {
    nativeStripeAvailable: false,
    initPaymentSheet: async () => ({ error: webStripeError }),
    presentPaymentSheet: async () => ({ error: webStripeError })
  };
}
