import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { COLORS } from '../constants';
import { PlayerProfile } from '../types';
import { generateStarterDeck } from '../services/cardService';

export default function HomeScreen({ navigation }: any) {
  const wallet = useWallet();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const handleConnect = async () => {
    try {
      await wallet.connect();
      showToast('Wallet connected successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to connect wallet', 'error');
    }
  };

  const handleDisconnect = () => {
    wallet.disconnect();
    setProfile(null);
    setBalance(null);
    showToast('Wallet disconnected', 'info');
  };

  const copyWalletAddress = async () => {
    if (wallet.publicKey) {
      await Clipboard.setStringAsync(wallet.publicKey.toBase58());
      showToast('Wallet address copied!', 'success');
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
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
          
          {/* Header with Wallet Info */}
          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-white text-2xl font-bold">
                  Hey, {profile?.username.split('_')[1]}!
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Level {profile?.level} • {profile?.xp} XP
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleDisconnect}
                activeOpacity={0.7}
                className="bg-[#1a1a2e] rounded-lg p-2.5 border-2 border-[#FF6B6B]/40"
                style={{
                  shadowColor: '#FF6B6B',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                  elevation: 3,
                }}>
                <Ionicons name="log-out" size={22} color="#FF6B6B" />
              </TouchableOpacity>
            </View>

            {/* Wallet Address Card - Game Style */}
            <TouchableOpacity
              onPress={copyWalletAddress}
              activeOpacity={0.7}
              className="bg-[#1a1a2e] rounded-xl p-3 border-2 border-[#9945FF]/30 flex-row items-center justify-between"
              style={{
                shadowColor: '#9945FF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}>
              <View className="flex-row items-center flex-1">
                <View className="w-9 h-9 bg-[#9945FF] rounded-lg items-center justify-center mr-3">
                  <Ionicons name="wallet" size={22} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-[#9945FF] text-xs font-bold uppercase tracking-wider mb-0.5">Wallet</Text>
                  <Text className="text-white font-mono text-sm font-semibold">
                    {wallet.publicKey ? shortenAddress(wallet.publicKey.toBase58()) : ''}
                  </Text>
                </View>
              </View>
              <View className="bg-[#9945FF] rounded-lg p-2">
                <Ionicons name="copy" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

        {/* Balance Card - Game Style */}
        <View className="relative bg-[#1a1a2e] rounded-2xl p-5 mb-5 border-2 border-[#9945FF]/40 overflow-hidden"
          style={{
            shadowColor: '#9945FF',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 8,
          }}>
          {/* Gradient Overlay */}
          <View className="absolute inset-0 bg-gradient-to-br from-[#9945FF]/20 to-transparent" />
          
          {/* Content */}
          <View className="relative">
            <View className="flex-row items-start justify-between mb-5">
              <View className="flex-1">
                <Text className="text-[#9945FF] text-xs font-bold uppercase tracking-widest mb-2">
                  Total Balance
                </Text>
                <View className="flex-row items-baseline">
                  <Text className="text-white text-5xl font-black tracking-tight">
                    {balance?.toFixed(4) || '0.0000'}
                  </Text>
                </View>
                <Text className="text-white text-base font-bold mt-1 tracking-wide">SOL</Text>
              </View>
              <View className="w-14 h-14 bg-[#9945FF] rounded-xl items-center justify-center"
                style={{
                  shadowColor: '#9945FF',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.6,
                  shadowRadius: 8,
                  elevation: 6,
                }}>
                <Ionicons name="wallet" size={36} color="#fff" />
              </View>
            </View>
            
            {/* Stats Row */}
            <View className="flex-row bg-[#0f0f1e]/60 rounded-xl p-3 border border-[#2a2a3e]">
              <View className="flex-1 items-center">
                <Text className="text-gray-400 text-xs font-semibold mb-1">Win Rate</Text>
                <Text className="text-[#14F195] text-xl font-black">
                  {profile && profile.totalMatches > 0
                    ? Math.round((profile.wins / profile.totalMatches) * 100)
                    : 0}%
                </Text>
              </View>
              <View className="w-px bg-[#2a2a3e] mx-2" />
              <View className="flex-1 items-center">
                <Text className="text-gray-400 text-xs font-semibold mb-1">Streak</Text>
                <View className="flex-row items-center">
                  <Text className="text-[#FF6B6B] text-xl font-black mr-1">
                    {profile?.currentStreak || 0}
                  </Text>
                  <Ionicons name="flame" size={18} color="#FF6B6B" />
                </View>
              </View>
              <View className="w-px bg-[#2a2a3e] mx-2" />
              <View className="flex-1 items-center">
                <Text className="text-gray-400 text-xs font-semibold mb-1">Battles</Text>
                <Text className="text-white text-xl font-black">
                  {profile?.totalMatches || 0}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Action - Enhanced */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Battle')}
          className="bg-[#14F195] rounded-2xl py-6 mb-5"
          style={{
            shadowColor: '#14F195',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 8,
          }}>
          <View className="flex-row items-center justify-center">
            <View className="w-12 h-12 bg-black/10 rounded-full items-center justify-center mr-3">
              <Ionicons name="game-controller" size={24} color="#000" />
            </View>
            <Text className="text-black text-2xl font-black tracking-wide">
              START BATTLE
            </Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions - Enhanced */}
        <View className="flex-row mb-5" style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Collection')}
            className="flex-1 bg-[#1a1a2e] rounded-2xl p-5 border border-[#2a2a3e]"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <View className="w-12 h-12 bg-[#9945FF]/20 rounded-xl items-center justify-center mb-3">
              <Ionicons name="albums-outline" size={24} color="#9945FF" />
            </View>
            <Text className="text-white font-bold text-base">Cards</Text>
            <Text className="text-gray-400 text-xs mt-1">{profile?.deck.length || 0} owned</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Shop')}
            className="flex-1 bg-[#1a1a2e] rounded-2xl p-5 border border-[#2a2a3e]"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <View className="w-12 h-12 bg-[#14F195]/20 rounded-xl items-center justify-center mb-3">
              <Ionicons name="cart-outline" size={24} color="#14F195" />
            </View>
            <Text className="text-white font-bold text-base">Shop</Text>
            <Text className="text-gray-400 text-xs mt-1">Buy packs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Leaderboard')}
            className="flex-1 bg-[#1a1a2e] rounded-2xl p-5 border border-[#2a2a3e]"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <View className="w-12 h-12 bg-[#FFD700]/20 rounded-xl items-center justify-center mb-3">
              <Ionicons name="trophy-outline" size={24} color="#FFD700" />
            </View>
            <Text className="text-white font-bold text-base">Ranks</Text>
            <Text className="text-gray-400 text-xs mt-1">Top 100</Text>
          </TouchableOpacity>
        </View>

        {/* Stats - Enhanced */}
        <View className="bg-[#1a1a2e] rounded-2xl p-6 border border-[#2a2a3e] mb-5"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}>
          <Text className="text-white font-bold text-xl mb-5">Your Stats</Text>
          
          {profile && profile.totalMatches > 0 ? (
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <View className="w-16 h-16 bg-[#14F195]/20 rounded-2xl items-center justify-center mb-2">
                  <Text className="text-[#14F195] text-2xl font-black">{profile.wins}</Text>
                </View>
                <Text className="text-gray-400 text-xs">Wins</Text>
              </View>
              <View className="items-center flex-1">
                <View className="w-16 h-16 bg-[#FF6B6B]/20 rounded-2xl items-center justify-center mb-2">
                  <Text className="text-[#FF6B6B] text-2xl font-black">{profile.losses}</Text>
                </View>
                <Text className="text-gray-400 text-xs">Losses</Text>
              </View>
              <View className="items-center flex-1">
                <View className="w-16 h-16 bg-gray-500/20 rounded-2xl items-center justify-center mb-2">
                  <Text className="text-gray-400 text-2xl font-black">{profile.draws}</Text>
                </View>
                <Text className="text-gray-400 text-xs">Draws</Text>
              </View>
            </View>
          ) : (
            <View className="items-center py-8">
              <View className="w-20 h-20 bg-[#2a2a3e] rounded-full items-center justify-center mb-4">
                <Ionicons name="game-controller-outline" size={40} color="#555" />
              </View>
              <Text className="text-gray-400 text-center text-base font-semibold">No matches yet</Text>
              <Text className="text-gray-500 text-xs mt-2">Start your first battle!</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
    </View>
  );
}
