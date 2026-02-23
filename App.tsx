import "./src/polyfills";
import { StatusBar } from "expo-status-bar";
import { Text, View, Alert } from "react-native";
import { useEffect, useState } from "react";
import { ConnectButton } from "./src/components/ConnectButton";
import { useWallet } from "./src/hooks/useWallet";
import "./global.css"

export default function App() {
  const wallet = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  const handleConnect = async () => {
    try {
      await wallet.connect();
      Alert.alert("Success", "Wallet connected!");
    } catch (error: any) {
      Alert.alert("Connection Failed", error.message || "Could not connect wallet");
    }
  };

  const handleDisconnect = () => {
    wallet.disconnect();
    setBalance(null);
    Alert.alert("Disconnected", "Wallet disconnected");
  };

  // Fetch balance when connected
  useEffect(() => {
    if (wallet.connected) {
      wallet.getBalance().then(setBalance);
    }
  }, [wallet.connected]);

  return (
    <View className="flex-1 bg-[#0a0a1a] items-center justify-center px-6">
      {/* Header */}
      <View className="items-center mb-12">
        <Text className="text-5xl font-bold text-white mb-2">◎</Text>
        <Text className="text-3xl font-bold text-white tracking-wide">Solana Wallet</Text>
        <Text className="text-[#888] text-sm mt-2">Connect to get started</Text>
      </View>
      
      {/* Connect Button */}
      <View className="w-full max-w-sm">
        <ConnectButton
          connected={wallet.connected}
          connecting={wallet.connecting}
          publicKey={wallet.publicKey?.toBase58() ?? null}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      </View>

      {/* Wallet Info Card */}
      {wallet.connected && (
        <View className="mt-8 p-6 bg-[#1a1a2e] rounded-2xl w-full max-w-sm border border-[#2a2a3e]">
          <View className="mb-4">
            <Text className="text-[#888] text-xs uppercase tracking-wider mb-2">Wallet Address</Text>
            <Text className="text-[#9945FF] text-sm font-mono leading-5">
              {wallet.publicKey?.toBase58()}
            </Text>
          </View>
          
          {balance !== null && (
            <View className="pt-4 border-t border-[#2a2a3e]">
              <Text className="text-[#888] text-xs uppercase tracking-wider mb-2">Balance</Text>
              <Text className="text-[#14F195] text-4xl font-bold">{balance.toFixed(4)}</Text>
              <Text className="text-[#14F195] text-lg font-semibold mt-1">SOL</Text>
            </View>
          )}
        </View>
      )}

      <StatusBar style="light" />
    </View>
  );
}
