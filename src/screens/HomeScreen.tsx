import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { COLORS } from '../constants';
import { PlayerProfile } from '../types';
import { generateStarterFighters } from '../services/fighterService';
import { StreakService, StreakState } from '../services/streakService';
import { LocalStreakService, LocalStreakData } from '../services/localStreakService';
import { LocalStatsService, PlayerStats } from '../services/localStatsService';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }: any) {
  const wallet = useWallet();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [streakState, setStreakState] = useState<StreakState | null>(null);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [localStreak, setLocalStreak] = useState<LocalStreakData | null>(null);
  const [localStats, setLocalStats] = useState<PlayerStats | null>(null);

  const toggleFeature = (feature: string) => {
    setExpandedFeature(expandedFeature === feature ? null : feature);
  };

  const handleConnect = async () => {
    try {
      await wallet.connect();
      showToast('Wallet connected successfully!', 'success');
    } catch (error: any) {
      // Don't show error toast if user cancelled
      if (error.message === 'Connection cancelled') {
        console.log('User cancelled wallet connection');
        return;
      }
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

  // Reload stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadStats = async () => {
        const stats = await LocalStatsService.getPlayerStats();
        setLocalStats(stats);
        
        // Update profile with latest stats
        if (wallet.connected && wallet.publicKey) {
          const streak = await LocalStreakService.getStreak();
          const newProfile: PlayerProfile = {
            publicKey: wallet.publicKey.toBase58(),
            username: `Player_${wallet.publicKey.toBase58().slice(0, 4)}`,
            xp: 0,
            level: 1,
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            totalMatches: stats.totalMatches,
            wins: stats.wins,
            losses: stats.losses,
            draws: stats.draws,
            badges: [],
            deck: generateStarterFighters(),
            createdAt: Date.now(),
          };
          setProfile(newProfile);
        }
      };
      
      loadStats();
    }, [wallet.connected, wallet.publicKey])
  );

  useEffect(() => {
    // Auto-update local streak when app opens
    const initLocalStreak = async () => {
      const streak = await LocalStreakService.checkAndUpdateStreak();
      setLocalStreak(streak);
    };
    
    // Load local stats
    const initLocalStats = async () => {
      const stats = await LocalStatsService.getPlayerStats();
      setLocalStats(stats);
    };
    
    initLocalStreak();
    initLocalStats();
    
    if (wallet.connected && wallet.publicKey) {
      wallet.getBalance().then(setBalance);
      
      // Load local streak and stats first
      Promise.all([
        LocalStreakService.getStreak(),
        LocalStatsService.getPlayerStats()
      ]).then(([streak, stats]) => {
        const newProfile: PlayerProfile = {
          publicKey: wallet.publicKey!.toBase58(),
          username: `Player_${wallet.publicKey!.toBase58().slice(0, 4)}`,
          xp: 0,
          level: 1,
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          totalMatches: stats.totalMatches,
          wins: stats.wins,
          losses: stats.losses,
          draws: stats.draws,
          badges: [],
          deck: generateStarterFighters(),
          createdAt: Date.now(),
        };
        setProfile(newProfile);
      });
      
      // Load streak data
      loadStreakData();
    }
  }, [wallet.connected]);

  const loadStreakData = async () => {
    if (!wallet.publicKey || !wallet.connection) return;
    
    try {
      const programId = new PublicKey(process.env.EXPO_PUBLIC_PROGRAM_ID || 'GhESwjzEv3C3qKQJKjAfhaq5GFK5vDLaku8tPqCKGzYR');
      const streakService = new StreakService(wallet.connection, programId);
      const state = await streakService.getStreakState(wallet.publicKey);
      const canCheck = await streakService.canCheckIn(wallet.publicKey);
      
      setStreakState(state);
      setCanCheckIn(canCheck);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      const streak = await LocalStreakService.checkAndUpdateStreak();
      setLocalStreak(streak);
      showToast(`Daily check-in completed! 🔥 ${streak.currentStreak} day streak!`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to check in', 'error');
    }
  };

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
            <View className="mb-6">
              <Image 
                source={require('../../assets/clashgo.png')} 
                style={{ width: 128, height: 128 }}
                resizeMode="contain"
              />
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
                      • Challenge players in real-time fighting matches
                    </Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base mb-2">
                      • Use combos and special moves to defeat opponents
                    </Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base">
                      • Master different fighter types and strategies
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
                      • Collect unique fighter NFTs with special abilities
                    </Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base mb-2">
                      • Upgrade fighters to increase their power
                    </Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base">
                      • Build the perfect roster for your playstyle
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
                    {localStreak?.currentStreak || 0}
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
          onPress={() => navigation.navigate('Fight')}
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
            START-FIGHT !!
            </Text>
          </View>
        </TouchableOpacity>

        {/* Daily Streak Card */}
        <View className="bg-orange-600 rounded-2xl p-5 mb-5"
          style={{
            shadowColor: '#FF6B6B',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 8,
          }}>
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3">
                <Ionicons name="flame" size={28} color="#fff" />
              </View>
              <View>
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl">Daily Streak</Text>
                <Text style={{ fontFamily: 'Bangers' }} className="text-white/80 text-sm">
                  {localStreak?.currentStreak || 0} days
                </Text>
              </View>
            </View>
            {localStreak && localStreak.longestStreak > 0 && (
              <View className="bg-white/20 rounded-lg px-4 py-2">
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xs">Best: {localStreak.longestStreak}</Text>
              </View>
            )}
          </View>
          
          <View className="bg-white/10 rounded-xl py-3">
            <Text style={{ fontFamily: 'Bangers' }} className="text-white text-center text-base">
              ✓ Auto-updated daily
            </Text>
          </View>
        </View>

        {/* Rewards Button */}
        {/* <TouchableOpacity
          onPress={() => navigation.navigate('Rewards')}
          className="bg-purple-600 rounded-2xl py-5 mb-5"
          style={{
            shadowColor: '#9945FF',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 8,
          }}>
          <View className="flex-row items-center justify-center">
            <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3">
              <Ionicons name="gift" size={24} color="#fff" />
            </View>
            <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl">
              CLAIM REWARDS
            </Text>
          </View>
        </TouchableOpacity> */}

        {/* Quiz Action */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Quiz')}
          className="bg-[#9945FF] rounded-2xl py-6 mb-5"
          style={{
            shadowColor: '#9945FF',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 8,
          }}>
          <View className="flex-row items-center justify-center">
            <View className="w-12 h-12 bg-black/10 rounded-full items-center justify-center mr-3">
              <Ionicons name="school" size={24} color="#fff" />
            </View>
            <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl ">
            EARN-QUIZ !!
            </Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions - Enhanced */}
        <View className="flex-row mb-5" style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Fighters')}
            className="flex-1 bg-[#1a1a2e] rounded-2xl p-5 border border-[#2a2a3e]"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <View className="w-12 h-12 bg-[#9945FF]/20 rounded-xl items-center justify-center mb-3">
              <Ionicons name="people-outline" size={24} color="#9945FF" />
            </View>
            <Text style={{ fontFamily: 'Bangers' }} className="text-white  text-lg">Fighters</Text>
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
          <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl mb-5">Your Stats</Text>
          
          {localStats && localStats.totalMatches > 0 ? (
            <View>
              {/* Win Rate Circle */}
              <View className="items-center mb-6">
                <View className="relative items-center justify-center mb-3">
                  <View 
                    className="w-32 h-32 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(20, 241, 149, 0.1)',
                      borderWidth: 6,
                      borderColor: '#14F195',
                    }}
                  >
                    <Text style={{ fontFamily: 'Bangers' }} className="text-[#14F195] text-4xl">
                      {LocalStatsService.calculateWinRate(localStats)}%
                    </Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white text-sm">Win Rate</Text>
                  </View>
                </View>
              </View>

              {/* Stats Grid */}
              <View className="flex-row justify-between mb-4">
                <View className="flex-1 items-center bg-[#0a0a1a] rounded-xl p-4 mr-2">
                  <Ionicons name="trophy" size={24} color="#14F195" />
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#14F195] text-3xl mt-2">{localStats.wins}</Text>
                  <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-sm">Wins</Text>
                </View>
                
                <View className="flex-1 items-center bg-[#0a0a1a] rounded-xl p-4 ml-2">
                  <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#FF6B6B] text-3xl mt-2">{localStats.losses}</Text>
                  <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-sm">Losses</Text>
                </View>
              </View>

              <View className="flex-row justify-between">
                <View className="flex-1 items-center bg-[#0a0a1a] rounded-xl p-4 mr-2">
                  <Ionicons name="flame" size={24} color="#FF6B6B" />
                  <Text style={{ fontFamily: 'Bangers' }} className="text-white text-3xl mt-2">{localStats.currentStreak}</Text>
                  <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-sm">Streak</Text>
                </View>
                
                <View className="flex-1 items-center bg-[#0a0a1a] rounded-xl p-4 ml-2">
                  <Ionicons name="game-controller" size={24} color="#9945FF" />
                  <Text style={{ fontFamily: 'Bangers' }} className="text-white text-3xl mt-2">{localStats.totalMatches}</Text>
                  <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-sm">Battles</Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="items-center py-8">
              <View className="w-24 h-24 bg-[#2a2a3e] rounded-full items-center justify-center mb-4">
                <Ionicons name="game-controller-outline" size={48} color="#555" />
              </View>
              <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-center text-xl">No matches yet</Text>
              <Text style={{ fontFamily: 'Bangers' }} className="text-gray-500 text-sm mt-2">Start your first battle!</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
    </View>
  );
}
