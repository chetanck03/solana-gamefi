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
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const toggleFeature = (feature: string) => {
    setExpandedFeature(expandedFeature === feature ? null : feature);
  };

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
        
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center">
          
          {/* Logo - Centered */}
          <View className="items-center mb-12">
            <View className="w-32 h-32 bg-[#9945FF] border-4 border-[#9945FF] rounded-3xl items-center justify-center mb-6" 
              style={{ 
                shadowColor: '#9945FF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 20,
                elevation: 10,
              }}>
              <Ionicons name="game-controller-outline" size={64} color="#fff" />
            </View>
            
            <View className="flex-row items-center justify-center mb-3">
              <Text style={{ fontFamily: 'Bangers' }} className="text-[#9945FF] text-6xl">
                CLASH
              </Text>
              <Text style={{ fontFamily: 'Bangers' }} className="text-white text-6xl">
                GO
              </Text>
            </View>
            
            <Text style={{ fontFamily: 'Bangers' }} className="text-[#14F195] text-lg text-center">
              Battle • Collect • Earn Crypto
            </Text>
          </View>

          {/* Connect Button */}
          <TouchableOpacity
            onPress={handleConnect}
            className="bg-[#9945FF] rounded-2xl py-6 mb-8"
            style={{
              shadowColor: '#9945FF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 5,
              
            }}
          >
            <View className="flex-row items-center justify-center px-6">
              <Ionicons name="wallet-outline" size={28} color="#fff" />
              <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl ml-3">
                CONNECT-WALLET !!
              </Text>
            </View>
          </TouchableOpacity>

          {/* Features */}
          <View className="gap-4">
            {/* Real-time Battles */}
            <TouchableOpacity 
              onPress={() => toggleFeature('battles')}
              activeOpacity={0.7}
            >
              <View className="bg-[#1a1a2e] rounded-2xl p-5 border border-[#2a2a3e]">
                <View className="flex-row items-center">
                  <View className="w-14 h-14 border-2 border-[#9945FF] rounded-xl items-center justify-center mr-4">
                    <Ionicons name="people-outline" size={28} color="#9945FF" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl mb-1">Real-time Battles</Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-base">Fight players worldwide</Text>
                  </View>
                  <Ionicons 
                    name={expandedFeature === 'battles' ? "chevron-up" : "chevron-forward"} 
                    size={24} 
                    color="#555" 
                  />
                </View>
                {expandedFeature === 'battles' && (
                  <View className="mt-4 pt-4 border-t border-[#2a2a3e]">
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base mb-2">
                      • Challenge players in real-time PvP matches
                    </Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base mb-2">
                      • Use strategy and skill to defeat opponents
                    </Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base">
                      • Climb the ranks and earn rewards
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Collect & Upgrade */}
            <TouchableOpacity 
              onPress={() => toggleFeature('collect')}
              activeOpacity={0.7}
            >
              <View className="bg-[#1a1a2e] rounded-2xl p-5 border border-[#2a2a3e]">
                <View className="flex-row items-center">
                  <View className="w-14 h-14 border-2 border-[#14F195] rounded-xl items-center justify-center mr-4">
                    <Ionicons name="layers-outline" size={28} color="#14F195" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl mb-1">Collect & Upgrade</Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-base">Build your ultimate deck</Text>
                  </View>
                  <Ionicons 
                    name={expandedFeature === 'collect' ? "chevron-up" : "chevron-forward"} 
                    size={24} 
                    color="#555" 
                  />
                </View>
                {expandedFeature === 'collect' && (
                  <View className="mt-4 pt-4 border-t border-[#2a2a3e]">
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base mb-2">
                      • Collect unique NFT cards with special abilities
                    </Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base mb-2">
                      • Upgrade cards to increase their power
                    </Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base">
                      • Build the perfect deck for your playstyle
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Win SOL Prizes */}
            <TouchableOpacity 
              onPress={() => toggleFeature('prizes')}
              activeOpacity={0.7}
            >
              <View className="bg-[#1a1a2e] rounded-2xl p-5 border border-[#2a2a3e]">
                <View className="flex-row items-center">
                  <View className="w-14 h-14 border-2 border-[#FFD700] rounded-xl items-center justify-center mr-4">
                    <Ionicons name="trophy-outline" size={28} color="#FFD700" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl mb-1">Win SOL Prizes</Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-base">Earn real crypto rewards</Text>
                  </View>
                  <Ionicons 
                    name={expandedFeature === 'prizes' ? "chevron-up" : "chevron-forward"} 
                    size={24} 
                    color="#555" 
                  />
                </View>
                {expandedFeature === 'prizes' && (
                  <View className="mt-4 pt-4 border-t border-[#2a2a3e]">
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base mb-2">
                      • Win SOL tokens in every battle
                    </Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base mb-2">
                      • Bigger rewards for tournament victories
                    </Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base">
                      • Withdraw your earnings anytime
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Tournaments */}
            <TouchableOpacity 
              onPress={() => toggleFeature('tournaments')}
              activeOpacity={0.7}
            >
              <View className="bg-[#1a1a2e] rounded-2xl p-5 border border-[#2a2a3e]">
                <View className="flex-row items-center">
                  <View className="w-14 h-14 border-2 border-[#FF6B6B] rounded-xl items-center justify-center mr-4">
                    <Ionicons name="flame-outline" size={28} color="#FF6B6B" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl mb-1">Tournaments</Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-base">Compete in ranked matches</Text>
                  </View>
                  <Ionicons 
                    name={expandedFeature === 'tournaments' ? "chevron-up" : "chevron-forward"} 
                    size={24} 
                    color="#555" 
                  />
                </View>
                {expandedFeature === 'tournaments' && (
                  <View className="mt-4 pt-4 border-t border-[#2a2a3e]">
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base mb-2">
                      • Join daily and weekly tournaments
                    </Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base mb-2">
                      • Compete for massive prize pools
                    </Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base">
                      • Earn exclusive badges and titles
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="items-center mt-8">
            <Text style={{ fontFamily: 'Bangers' }} className="text-gray-500 text-base">
              Powered by <Text style={{ fontFamily: 'Bangers' }} className="text-[#14F195] font-semibold">Solana</Text>
            </Text>
          </View>
        </View>
        </ScrollView>
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
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-4xl ">
                  Hey,{profile?.username.split('_')[1]}!
                </Text>
                <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-base mt-1">
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
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}>
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-[#9945FF] rounded-lg items-center justify-center mr-3">
                  <Ionicons name="wallet" size={28} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#9945FF] text-lg font-bold uppercase tracking-wider ">Wallet</Text>
                  <Text style={{ fontFamily: 'Bangers' }} className="text-white  font-semibold">
                    {wallet.publicKey ? wallet.publicKey.toBase58() : ''}
                  </Text>
                </View>
              </View>
              <View className="bg-[#9945FF] rounded-lg p-2">
                <Ionicons name="copy" size={20} color="#fff" />
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
                <Text style={{ fontFamily: 'Bangers' }} className="text-[#9945FF] text-lg font-bold uppercase tracking-widest mb-2">
                  Total Balance
                </Text>
                <View className="flex-row items-baseline">
                  <Text style={{ fontFamily: 'Bangers' }} className="text-white text-5xl  tracking-tight">
                    {balance?.toFixed(4) || '0.0000'}
                  </Text>
                </View>
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-base  mt-1 tracking-wide">SOL</Text>
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
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg font-semibold mb-1">Win-Rate</Text>
                <Text style={{ fontFamily: 'Bangers' }} className="text-[#14F195] text-xl font-black">
                  {profile && profile.totalMatches > 0
                    ? Math.round((profile.wins / profile.totalMatches) * 100)
                    : 0}%
                </Text>
              </View>
              <View className="w-px bg-[#2a2a3e] mx-2" />
              <View className="flex-1 items-center">
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg font-semibold mb-1">Streak</Text>
                <View className="flex-row items-center">
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#FF6B6B] text-xl font-black mr-1">
                    {profile?.currentStreak || 0}
                  </Text>
                  <Ionicons name="flame" size={18} color="#FF6B6B" />
                </View>
              </View>
              <View className="w-px bg-[#2a2a3e] mx-2" />
              <View className="flex-1 items-center">
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg font-semibold mb-1">Battles</Text>
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl font-black">
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
            <Text style={{ fontFamily: 'Bangers' }} className="text-black text-2xl ">
            START-BATTLE !!
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
            <Text style={{ fontFamily: 'Bangers' }} className="text-white  text-lg">Cards</Text>
            <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-base mt-1">{profile?.deck.length || 0} owned</Text>
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
            <Text style={{ fontFamily: 'Bangers' }} className="text-white  text-lg">Shop</Text>
            <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-base mt-1">Buy packs</Text>
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
            <Text style={{ fontFamily: 'Bangers' }} className="text-white  text-lg">Ranks</Text>
            <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-base mt-1">Top 100</Text>
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
          <Text style={{ fontFamily: 'Bangers' }} className="text-white  text-xl mb-5">Your Stats</Text>
          
          {profile && profile.totalMatches > 0 ? (
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <View className="w-16 h-16 bg-[#14F195]/20 rounded-2xl items-center justify-center mb-2">
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#14F195] text-2xl font-black">{profile.wins}</Text>
                </View>
                <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-xs">Wins</Text>
              </View>
              <View className="items-center flex-1">
                <View className="w-16 h-16 bg-[#FF6B6B]/20 rounded-2xl items-center justify-center mb-2">
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#FF6B6B] text-2xl font-black">{profile.losses}</Text>
                </View>
                <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-xs">Losses</Text>
              </View>
              <View className="items-center flex-1">
                <View className="w-16 h-16 bg-gray-500/20 rounded-2xl items-center justify-center mb-2">
                  <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-2xl font-black">{profile.draws}</Text>
                </View>
                <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-xs">Draws</Text>
              </View>
            </View>
          ) : (
            <View className="items-center py-8">
              <View className="w-20 h-20 bg-[#2a2a3e] rounded-full items-center justify-center mb-4">
                <Ionicons name="game-controller-outline" size={40} color="#555" />
              </View>
              <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-center text-lg font-semibold">No matches yet</Text>
              {/* <Text style={{ fontFamily: 'Bangers' }} className="text-gray-500 text-xs mt-2">Start your first battle</Text> */}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
    </View>
  );
}
