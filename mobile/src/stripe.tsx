import type { ReactNode } from "react";

type StripeSheetResult = {
  error?: {
    message?: string;
  };
};

export function AppStripeProvider({ children }: { publishableKey: string; children: ReactNode }) {
  return <>{children}</>;
}

export function StripeDeepLinkHandler() {
  return null;
}

export function useAppStripe(): {
  nativeStripeAvailable: boolean;
  initPaymentSheet: (params: Record<string, unknown>) => Promise<StripeSheetResult>;
  presentPaymentSheet: () => Promise<StripeSheetResult>;
} {
  const error = {
    message: "Stripe nativo no esta disponible en esta plataforma."
  };

  return {
    nativeStripeAvailable: false,
    initPaymentSheet: async () => ({ error }),
    presentPaymentSheet: async () => ({ error })
  };
}
