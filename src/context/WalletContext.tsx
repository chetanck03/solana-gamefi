import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_IDENTITY = {
  name: 'ClashGo',
  uri: 'https://clashgo.app',
  icon: 'favicon.ico',
};

const WALLET_STORAGE_KEY = 'wallet_public_key';

interface WalletContextType {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<PublicKey>;
  disconnect: () => void;
  getBalance: () => Promise<number>;
  connection: Connection;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const cluster = 'devnet';
  const connection = new Connection(clusterApiUrl(cluster), 'confirmed');

  // Load saved wallet on mount
  useEffect(() => {
    loadSavedWallet();
  }, []);

  const loadSavedWallet = async () => {
    try {
      const savedKey = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
      if (savedKey) {
        const pubkey = new PublicKey(savedKey);
        setPublicKey(pubkey);
        console.log('Restored wallet connection:', savedKey);
      }
    } catch (error) {
      console.error('Error loading saved wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveWallet = async (pubkey: PublicKey) => {
    try {
      await AsyncStorage.setItem(WALLET_STORAGE_KEY, pubkey.toBase58());
    } catch (error) {
      console.error('Error saving wallet:', error);
    }
  };

  const clearWallet = async () => {
    try {
      await AsyncStorage.removeItem(WALLET_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing wallet:', error);
    }
  };

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const authResult = await transact(
        async (wallet: Web3MobileWallet) => {
          const result = await wallet.authorize({
            chain: `solana:${cluster}`,
            identity: APP_IDENTITY,
          });
          return result;
        }
      );

      const pubkey = new PublicKey(
        Buffer.from(authResult.accounts[0].address, 'base64')
      );
      setPublicKey(pubkey);
      await saveWallet(pubkey); // Save to AsyncStorage
      console.log('Wallet connected and saved:', pubkey.toBase58());
      return pubkey;
    } catch (error: any) {
      // Handle cancellation gracefully
      if (error.message?.includes('CancellationException') || 
          error.message?.includes('cancelled') ||
          error.message?.includes('canceled')) {
        console.log('Wallet connection cancelled by user');
        throw new Error('Connection cancelled');
      }
      
      console.error('Connect failed:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [cluster]);

  const disconnect = useCallback(async () => {
    setPublicKey(null);
    await clearWallet(); // Clear from AsyncStorage
    console.log('Wallet disconnected and cleared');
  }, []);

  const getBalance = useCallback(async () => {
    if (!publicKey) return 0;
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }, [publicKey, connection]);

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        connected: !!publicKey,
        connecting,
        connect,
        disconnect,
        getBalance,
        connection,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
