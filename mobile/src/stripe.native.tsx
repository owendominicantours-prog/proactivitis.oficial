import type { ReactElement } from "react";
import { useEffect } from "react";
import { Linking } from "react-native";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";

export function AppStripeProvider({
  publishableKey,
  children
}: {
  publishableKey: string;
  children: ReactElement | ReactElement[];
}) {
  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.com.proactivitis.app"
      urlScheme="proactivitis"
    >
      {children}
    </StripeProvider>
  );
}

export function StripeDeepLinkHandler() {
  const { handleURLCallback } = useStripe();

  useEffect(() => {
    const handleDeepLink = async (url: string | null) => {
      if (url) await handleURLCallback(url);
    };

    void Linking.getInitialURL().then(handleDeepLink);
    const subscription = Linking.addEventListener("url", (event) => {
      void handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, [handleURLCallback]);

  return null;
}

export function useAppStripe() {
  return {
    ...useStripe(),
    nativeStripeAvailable: true
  };
}
