import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '../hooks/useWallet';
import { PlayerProfile } from '../types';
import { blockchainService } from '../services/blockchain';

interface GameContextType {
  profile: PlayerProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshProfile = async () => {
    if (!wallet.publicKey) return;
    
    setLoading(true);
    try {
      const data = await blockchainService.getPlayerProfile(wallet.publicKey);
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet.connected) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [wallet.connected]);

  return (
    <GameContext.Provider value={{ profile, loading, refreshProfile }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
