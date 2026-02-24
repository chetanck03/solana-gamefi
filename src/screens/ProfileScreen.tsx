import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../context/WalletContext';
import { COLORS } from '../constants';
import { PlayerProfile, Badge } from '../types';
import { generateStarterDeck } from '../services/cardService';

export default function ProfileScreen() {
  const wallet = useWallet();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
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

  if (!wallet.connected || !profile) {
    return (
      <View className="flex-1 bg-[#0a0a1a] items-center justify-center p-6">
        <Ionicons name="person-circle" size={80} color="#888" />
        <Text className="text-[#888] text-center mt-4">Connect wallet to view profile</Text>
      </View>
    );
  }

  const winRate = profile.totalMatches > 0 
    ? Math.round((profile.wins / profile.totalMatches) * 100) 
    : 0;
  const xpToNextLevel = 1000 - (profile.xp % 1000);

  return (
    <ScrollView className="flex-1 bg-[#0a0a1a]">
      <View className="p-6">
        {/* Header */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 bg-[#9945FF] rounded-full items-center justify-center mb-4">
            <Ionicons name="person" size={48} color="white" />
          </View>
          <Text className="text-white text-2xl font-bold">{profile.username}</Text>
          <Text className="text-[#888] text-sm mt-1">
            {profile.publicKey.slice(0, 4)}...{profile.publicKey.slice(-4)}
          </Text>
        </View>

        {/* Level & XP */}
        <View className="bg-[#1a1a2e] rounded-xl p-6 mb-6 border border-[#2a2a3e]">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Ionicons name="shield" size={20} color={COLORS.primary} />
              <Text className="text-white text-xl font-bold ml-2">Level {profile.level}</Text>
            </View>
            <Text className="text-[#888]">{xpToNextLevel} XP to next level</Text>
          </View>
          
          <View className="bg-[#2a2a3e] rounded-full h-3 mb-2">
            <View 
              className="bg-[#9945FF] rounded-full h-3"
              style={{ width: `${((profile.xp % 1000) / 1000) * 100}%` }}
            />
          </View>
          
          <View className="flex-row items-center justify-center">
            <Ionicons name="star" size={20} color="#14F195" />
            <Text className="text-[#14F195] text-2xl font-bold ml-2">
              {profile.xp.toLocaleString()} XP
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          <View className="flex-1 min-w-[45%] bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3e]">
            <Ionicons name="game-controller" size={20} color="#888" />
            <Text className="text-[#888] text-xs uppercase mt-2 mb-1">Total Matches</Text>
            <Text className="text-white text-2xl font-bold">{profile.totalMatches}</Text>
          </View>

          <View className="flex-1 min-w-[45%] bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3e]">
            <Ionicons name="stats-chart" size={20} color="#14F195" />
            <Text className="text-[#888] text-xs uppercase mt-2 mb-1">Win Rate</Text>
            <Text className="text-[#14F195] text-2xl font-bold">{winRate}%</Text>
          </View>

          <View className="flex-1 min-w-[45%] bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3e]">
            <Ionicons name="flame" size={20} color="#FF6B6B" />
            <Text className="text-[#888] text-xs uppercase mt-2 mb-1">Current Streak</Text>
            <Text className="text-white text-2xl font-bold">{profile.currentStreak}</Text>
          </View>

          <View className="flex-1 min-w-[45%] bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3e]">
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text className="text-[#888] text-xs uppercase mt-2 mb-1">Longest Streak</Text>
            <Text className="text-white text-2xl font-bold">{profile.longestStreak}</Text>
          </View>
        </View>

        {/* Match Stats */}
        <View className="bg-[#1a1a2e] rounded-xl p-6 mb-6 border border-[#2a2a3e]">
          <Text className="text-white text-xl font-bold mb-4">Match Statistics</Text>
          
          <View className="flex-row justify-around">
            <View className="items-center">
              <Ionicons name="trophy" size={32} color="#14F195" />
              <Text className="text-[#14F195] text-2xl font-bold mt-2">{profile.wins}</Text>
              <Text className="text-[#888] text-xs">Wins</Text>
            </View>
            
            <View className="items-center">
              <Ionicons name="close-circle" size={32} color="#FF4444" />
              <Text className="text-[#FF4444] text-2xl font-bold mt-2">{profile.losses}</Text>
              <Text className="text-[#888] text-xs">Losses</Text>
            </View>
            
            <View className="items-center">
              <Ionicons name="remove-circle" size={32} color="#888" />
              <Text className="text-[#888] text-2xl font-bold mt-2">{profile.draws}</Text>
              <Text className="text-[#888] text-xs">Draws</Text>
            </View>
          </View>
        </View>

        {/* Card Collection */}
        <View className="bg-[#1a1a2e] rounded-xl p-6 mb-6 border border-[#2a2a3e]">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-xl font-bold">Card Collection</Text>
            <Ionicons name="albums" size={24} color={COLORS.primary} />
          </View>
          
          <View className="flex-row items-center justify-between">
            <Text className="text-[#888]">Total Cards</Text>
            <Text className="text-white text-xl font-bold">{profile.deck.length}</Text>
          </View>
        </View>

        {/* Badges */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">
            Badges ({profile.badges.length})
          </Text>
          
          {profile.badges.length > 0 ? (
            <View className="flex-row flex-wrap gap-3">
              {profile.badges.map((badge) => (
                <View
                  key={badge.id}
                  className="bg-[#1a1a2e] rounded-xl p-4 border border-[#9945FF]"
                  style={{ width: '30%' }}
                >
                  <Ionicons name="medal" size={32} color="#FFD700" />
                  <Text className="text-white text-xs font-bold mt-2" numberOfLines={2}>
                    {badge.name}
                  </Text>
                  <Text className="text-[#888] text-xs mt-1">{badge.rarity}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-[#1a1a2e] rounded-xl p-6 border border-[#2a2a3e] items-center">
              <Ionicons name="ribbon" size={48} color="#888" />
              <Text className="text-[#888] text-center mt-2">No badges earned yet</Text>
              <Text className="text-[#888] text-center text-xs mt-1">
                Win matches to earn badges!
              </Text>
            </View>
          )}
        </View>

        {/* Disconnect Button */}
        <TouchableOpacity
          className="bg-[#FF4444] rounded-xl p-4 flex-row items-center justify-center"
          onPress={() => wallet.disconnect()}
        >
          <Ionicons name="log-out" size={20} color="white" />
          <Text className="text-white font-bold ml-2">Disconnect Wallet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
