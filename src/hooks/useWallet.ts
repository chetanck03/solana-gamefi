import { useState, useCallback } from "react";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const APP_IDENTITY = {
  name: "Solana GameFi",
  uri: "https://solanagamefi.app",
  icon: "favicon.ico",
};

export function useWallet() {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Using devnet for testing - change to "mainnet-beta" for production
  const cluster = "devnet";
  const connection = new Connection(clusterApiUrl(cluster), "confirmed");

  // Connect to wallet
  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const authResult = await transact(
        async (wallet: Web3MobileWallet) => {
          // Opens Phantom/Solflare and shows authorization dialog
          const result = await wallet.authorize({
            chain: `solana:${cluster}`,
            identity: APP_IDENTITY,
          });
          return result;
        }
      );

      // Convert base64 address to PublicKey
      const pubkey = new PublicKey(
        Buffer.from(authResult.accounts[0].address, "base64")
      );
      setPublicKey(pubkey);
      return pubkey;
    } catch (error: any) {
      console.error("Connect failed:", error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [cluster]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setPublicKey(null);
  }, []);

  // Get wallet balance
  const getBalance = useCallback(async () => {
    if (!publicKey) return 0;
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }, [publicKey, connection]);

  return {
    publicKey,
    connected: !!publicKey,
    connecting,
    connect,
    disconnect,
    getBalance,
    connection,
  };
}
