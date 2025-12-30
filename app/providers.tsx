"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { LanguageProvider } from "../context/LanguageProvider";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <SessionProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </SessionProvider>
  );
};
