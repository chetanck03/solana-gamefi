import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FightContextType {
  isInActiveFight: boolean;
  setIsInActiveFight: (active: boolean) => void;
}

const FightContext = createContext<FightContextType | undefined>(undefined);

export function FightProvider({ children }: { children: ReactNode }) {
  const [isInActiveFight, setIsInActiveFight] = useState(false);

  return (
    <FightContext.Provider value={{ isInActiveFight, setIsInActiveFight }}>
      {children}
    </FightContext.Provider>
  );
}

export function useFight() {
  const context = useContext(FightContext);
  if (context === undefined) {
    throw new Error('useFight must be used within a FightProvider');
  }
  return context;
}
