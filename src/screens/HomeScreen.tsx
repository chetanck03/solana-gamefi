import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../context/WalletContext';
import { COLORS } from '../constants';
import { PlayerProfile } from '../types';
import { generateStarterDeck } from '../services/cardService';

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
    if (wallet.connected && wallet.publicKey) {
      wallet.getBalance().then(setBalance);
      
      const newProfile: PlayerProfile = {
        publicKey: wallet.publicKey.toBase58(),
        username: `Player_${wallet.publicKey.toBase58().slice(0, 4)}`,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        totalMatches: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        badges: [],
        deck: generateStarterDeck(),
        createdAt: Date.now(),
      };
      setProfile(newProfile);
    }
  }, [wallet.connected]);

  if (!wallet.connected) {
    return (
      <View className="flex-1 bg-[#0f0f1e]">
        {/* Dark gaming background */}
        <View className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1e]" />
        
        <View className="flex-1 px-5 justify-center pb-20">
          
          {/* Logo - Centered */}
          <View className="items-center mb-12">
            <View className="w-32 h-32 bg-[#9945FF] rounded-3xl items-center justify-center mb-6" 
              style={{ 
                shadowColor: '#9945FF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 20,
                elevation: 10,
              }}>
              <Ionicons name="game-controller" size={64} color="#fff" />
            </View>
            
            <View className="flex-row items-center mb-3">
              <Text className="text-[#9945FF] text-5xl font-black tracking-tight">
                Clash
              </Text>
              <Text className="text-white text-5xl font-black tracking-tight">
                Go
              </Text>
            </View>
            
            <Text className="text-[#14F195] text-base">
              On-Chain Card Battles
            </Text>
          </View>

          {/* Connect Button */}
          <TouchableOpacity
            onPress={handleConnect}
            className="bg-[#9945FF] rounded-xl py-5 mb-8"
            style={{
              shadowColor: '#9945FF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="wallet-outline" size={24} color="#fff" />
              <Text className="text-white text-lg font-bold ml-2">
                CONNECT WALLET
              </Text>
            </View>
          </TouchableOpacity>

          {/* Features */}
          <View className="space-y-3">
            <View className="bg-[#1a1a2e] rounded-xl p-4 flex-row items-center border border-[#2a2a3e]">
              <View className="w-12 h-12 bg-[#9945FF]/20 rounded-lg items-center justify-center mr-4">
                <Ionicons name="people" size={24} color="#9945FF" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">Real-time Battles</Text>
                <Text className="text-gray-400 text-sm">Fight players worldwide</Text>
              </View>
            </View>

            <View className="bg-[#1a1a2e] rounded-xl p-4 flex-row items-center border border-[#2a2a3e]">
              <View className="w-12 h-12 bg-[#14F195]/20 rounded-lg items-center justify-center mr-4">
                <Ionicons name="albums" size={24} color="#14F195" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">Collect & Upgrade</Text>
                <Text className="text-gray-400 text-sm">Build your ultimate deck</Text>
              </View>
            </View>

            <View className="bg-[#1a1a2e] rounded-xl p-4 flex-row items-center border border-[#2a2a3e]">
              <View className="w-12 h-12 bg-[#FFD700]/20 rounded-lg items-center justify-center mr-4">
                <Ionicons name="trophy" size={24} color="#FFD700" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">Win SOL Prizes</Text>
                <Text className="text-gray-400 text-sm">Earn real crypto rewards</Text>
              </View>
            </View>

            <View className="bg-[#1a1a2e] rounded-xl p-4 flex-row items-center border border-[#2a2a3e]">
              <View className="w-12 h-12 bg-[#FF6B6B]/20 rounded-lg items-center justify-center mr-4">
                <Ionicons name="flame" size={24} color="#FF6B6B" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">Tournaments</Text>
                <Text className="text-gray-400 text-sm">Compete in ranked matches</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View className="items-center mt-8">
            <Text className="text-gray-500 text-base">
              Powered by <Text className="text-[#14F195] font-semibold">Solana</Text>
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0f0f1e]">
      <ScrollView className="flex-1">
        <View className="p-5">
          
          {/* Header */}
          <View className="mb-5">
            <Text className="text-white text-2xl font-bold">
              Hey, {profile?.username.split('_')[1]}!
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              Level {profile?.level} • {profile?.xp} XP
            </Text>
          </View>

        {/* Balance Card */}
        <View className="bg-gradient-to-br from-[#9945FF] to-[#7d3acc] rounded-2xl p-5 mb-5"
          style={{
            shadowColor: '#9945FF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}>
          <Text className="text-white/80 text-sm mb-1">Your Balance</Text>
          <Text className="text-white text-3xl font-black mb-3">
            {balance?.toFixed(4) || '0.0000'} SOL
          </Text>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white/60 text-xs">Win Rate</Text>
              <Text className="text-white text-lg font-bold">
                {profile && profile.totalMatches > 0
                  ? Math.round((profile.wins / profile.totalMatches) * 100)
                  : 0}%
              </Text>
            </View>
            <View>
              <Text className="text-white/60 text-xs">Streak</Text>
              <Text className="text-white text-lg font-bold">
                {profile?.currentStreak || 0} 🔥
              </Text>
            </View>
            <View>
              <Text className="text-white/60 text-xs">Matches</Text>
              <Text className="text-white text-lg font-bold">
                {profile?.totalMatches || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Action */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Battle')}
          className="bg-[#14F195] rounded-xl py-5 mb-5"
          style={{
            shadowColor: '#14F195',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 5,
          }}>
          <View className="flex-row items-center justify-center">
            <Ionicons name="game-controller" size={28} color="#000" />
            <Text className="text-black text-xl font-black ml-3">
              START BATTLE
            </Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View className="flex-row mb-5" style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Collection')}
            className="flex-1 bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3e]">
            <Ionicons name="albums" size={32} color="#9945FF" />
            <Text className="text-white font-bold mt-2">Cards</Text>
            <Text className="text-gray-400 text-xs">{profile?.deck.length || 0} owned</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Shop')}
            className="flex-1 bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3e]">
            <Ionicons name="cart" size={32} color="#14F195" />
            <Text className="text-white font-bold mt-2">Shop</Text>
            <Text className="text-gray-400 text-xs">Buy packs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Leaderboard')}
            className="flex-1 bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3e]">
            <Ionicons name="trophy" size={32} color="#FFD700" />
            <Text className="text-white font-bold mt-2">Ranks</Text>
            <Text className="text-gray-400 text-xs">Top 100</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="bg-[#1a1a2e] rounded-xl p-5 border border-[#2a2a3e]">
          <Text className="text-white font-bold text-lg mb-4">Your Stats</Text>
          
          {profile && profile.totalMatches > 0 ? (
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-[#14F195] text-2xl font-bold">{profile.wins}</Text>
                <Text className="text-gray-400 text-xs mt-1">Wins</Text>
              </View>
              <View className="w-px bg-[#2a2a3e]" />
              <View className="items-center">
                <Text className="text-[#FF6B6B] text-2xl font-bold">{profile.losses}</Text>
                <Text className="text-gray-400 text-xs mt-1">Losses</Text>
              </View>
              <View className="w-px bg-[#2a2a3e]" />
              <View className="items-center">
                <Text className="text-gray-400 text-2xl font-bold">{profile.draws}</Text>
                <Text className="text-gray-400 text-xs mt-1">Draws</Text>
              </View>
            </View>
          ) : (
            <View className="items-center py-6">
              <Ionicons name="game-controller-outline" size={48} color="#444" />
              <Text className="text-gray-400 text-center mt-3">No matches yet</Text>
              <Text className="text-gray-500 text-xs mt-1">Start your first battle!</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
    </View>
  );
}
