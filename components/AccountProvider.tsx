"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AccountContextValue = {
  accountId: string | null;
  setAccountId: (value: string | null) => void;
};

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

type AccountProviderProps = {
  children: React.ReactNode;
  initialAccountId?: string | null;
};

export const useAccount = (): AccountContextValue => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
};

export const AccountProvider = ({ children, initialAccountId = null }: AccountProviderProps) => {
  const [accountId, setAccountId] = useState<string | null>(() => {
    if (initialAccountId) {
      return initialAccountId;
    }
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem("accountId");
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (accountId) {
      window.localStorage.setItem("accountId", accountId);
    } else {
      window.localStorage.removeItem("accountId");
    }
  }, [accountId]);

  const value = useMemo(
    () => ({
      accountId,
      setAccountId
    }),
    [accountId]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

export default AccountProvider;
