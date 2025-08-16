import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

interface WalletCreditData {
  balanceCents: number;
  currency: string;
}

interface WalletCreditContextType {
  wallet: WalletCreditData;
  setWallet: (w: WalletCreditData) => void;
}

const WalletCreditContext = createContext<WalletCreditContextType | undefined>(undefined);

interface WalletCreditProviderProps {
  children: ReactNode;
}

export function WalletCreditProvider({ children }: WalletCreditProviderProps) {
  const [wallet, setWallet] = useState<WalletCreditData>({ balanceCents: 0, currency: 'USD' });

  const value = useMemo<WalletCreditContextType>(() => ({ wallet, setWallet }), [wallet]);

  return (
    <WalletCreditContext.Provider value={value}>
      {children}
    </WalletCreditContext.Provider>
  );
}

export function useWalletCredit() {
  const ctx = useContext(WalletCreditContext);
  if (!ctx) throw new Error('useWalletCredit must be used within a WalletCreditProvider');
  return ctx;
}


