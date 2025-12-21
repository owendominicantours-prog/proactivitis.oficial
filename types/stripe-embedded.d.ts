/// <reference types="react" />

declare namespace StripeEmbedded {
  interface StripePayoutsProps {
    "account-session": string;
    theme: string;
    "return-url"?: string;
    style?: React.CSSProperties;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-payouts": StripeEmbedded.StripePayoutsProps;
    }
  }
}

export {};
