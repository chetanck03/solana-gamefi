import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useWallet } from '../hooks/useWallet';
import { ConnectButton } from '../components/ConnectButton';
import { COLORS } from '../constants';
import { PlayerProfile } from '../types';

export default function HomeScreen({ navigation }: any) {
  const wallet = useWallet();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const handleConnect = async () => {
    try {
      await wallet.connect();
      Alert.alert('Success', 'Wallet connected!');
    } catch (error: any) {
      Alert.alert('Connection Failed', error.message);
    }
  };

  const handleDisconnect = () => {
    wallet.disconnect();
    setProfile(null);
    setBalance(null);
  };

  useEffect(() => {
    if (wallet.connected) {
      wallet.getBalance().then(setBalance);
      // TODO: Fetch player profile from blockchain
    }
  }, [wallet.connected]);

  if (!wallet.connected) {
    return (
      <View className="flex-1 bg-[#0a0a1a] items-center justify-center px-6">
        <View className="items-center mb-12">
          <Text className="text-6xl mb-4">⚔️</Text>
          <Text className="text-4xl font-bold text-white mb-2">ClashGo</Text>
          <Text className="text-[#888] text-center mt-2">
            Daily On-Chain Competitive Game
          </Text>
        </View>
        
        <ConnectButton
          connected={wallet.connected}
          connecting={wallet.connecting}
          publicKey={wallet.publicKey?.toBase58() ?? null}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#0a0a1a]">
      <View className="p-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-white">Welcome Back!</Text>
          <Text className="text-[#888] mt-1">Ready to clash?</Text>
        </View>

        {/* Stats Card */}
        <View className="bg-[#1a1a2e] rounded-2xl p-6 mb-6 border border-[#2a2a3e]">
          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-[#888] text-xs uppercase">Balance</Text>
              <Text className="text-[#14F195] text-2xl font-bold">
                {balance?.toFixed(4) || '0.0000'} SOL
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-[#888] text-xs uppercase">XP</Text>
              <Text className="text-[#9945FF] text-2xl font-bold">
                {profile?.xp || 0}
              </Text>
            </View>
          </View>
          
          <View className="flex-row justify-between">
            <View>
              <Text className="text-[#888] text-xs uppercase">Streak</Text>
              <Text className="text-white text-xl font-bold">
                🔥 {profile?.currentStreak || 0} days
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-[#888] text-xs uppercase">Win Rate</Text>
              <Text className="text-white text-xl font-bold">
                {profile ? Math.round((profile.wins / profile.totalMatches) * 100) : 0}%
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-white text-xl font-bold mb-4">Quick Actions</Text>
        
        <TouchableOpacity
          className="bg-[#9945FF] rounded-xl p-6 mb-4"
          onPress={() => navigation.navigate('Battle')}
        >
          <Text className="text-white text-2xl font-bold mb-1">⚔️ Start Battle</Text>
          <Text className="text-white/80">60-second PvP challenge</Text>
        </TouchableOpacity>

        <View className="flex-row gap-4 mb-4">
          <TouchableOpacity
            className="flex-1 bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3e]"
            onPress={() => navigation.navigate('Predict')}
          >
            <Text className="text-2xl mb-2">🔮</Text>
            <Text className="text-white font-bold">Daily Prediction</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3e]"
            onPress={() => navigation.navigate('Mystery')}
          >
            <Text className="text-2xl mb-2">🎁</Text>
            <Text className="text-white font-bold">Mystery Box</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3e]"
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Text className="text-2xl mb-2">🏆</Text>
          <Text className="text-white font-bold">Global Leaderboard</Text>
          <Text className="text-[#888] text-sm">See top players</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
