import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useWallet } from '../hooks/useWallet';
import { COLORS } from '../constants';
import { PlayerProfile, Badge } from '../types';

export default function ProfileScreen() {
  const wallet = useWallet();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    if (wallet.connected) {
      // TODO: Fetch profile from blockchain
      const mockProfile: PlayerProfile = {
        publicKey: wallet.publicKey?.toBase58() || '',
        username: 'Player123',
        xp: 5420,
        level: 5,
        currentStreak: 7,
        longestStreak: 15,
        totalMatches: 50,
        wins: 32,
        losses: 18,
        badges: [
          {
            id: '1',
            name: '7-Day Warrior',
            description: 'Maintained a 7-day streak',
            rarity: 'rare',
            imageUrl: '',
            earnedAt: Date.now(),
          },
        ],
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      };
      setProfile(mockProfile);
    }
  }, [wallet.connected]);

  if (!wallet.connected || !profile) {
    return (
      <View className="flex-1 bg-[#0a0a1a] items-center justify-center p-6">
        <Text className="text-[#888] text-center">Connect wallet to view profile</Text>
      </View>
    );
  }

  const winRate = Math.round((profile.wins / profile.totalMatches) * 100);
  const xpToNextLevel = 1000 - (profile.xp % 1000);

  return (
    <ScrollView className="flex-1 bg-[#0a0a1a]">
      <View className="p-6">
        {/* Header */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 bg-[#9945FF] rounded-full items-center justify-center mb-4">
            <Text className="text-white text-4xl">👤</Text>
          </View>
          <Text className="text-white text-2xl font-bold">{profile.username}</Text>
          <Text className="text-[#888] text-sm mt-1">
            {profile.publicKey.slice(0, 4)}...{profile.publicKey.slice(-4)}
          </Text>
        </View>

        {/* Level & XP */}
        <View className="bg-[#1a1a2e] rounded-xl p-6 mb-6 border border-[#2a2a3e]">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-xl font-bold">Level {profile.level}</Text>
            <Text className="text-[#888]">{xpToNextLevel} XP to next level</Text>
          </View>
          
          <View className="bg-[#2a2a3e] rounded-full h-3 mb-2">
            <View 
              className="bg-[#9945FF] rounded-full h-3"
              style={{ width: `${((profile.xp % 1000) / 1000) * 100}%` }}
            />
          </View>
          
          <Text className="text-[#14F195] text-2xl font-bold text-center">
            {profile.xp.toLocaleString()} XP
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          <View className="flex-1 min-w-[45%] bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3e]">
            <Text className="text-[#888] text-xs uppercase mb-1">Total Matches</Text>
            <Text className="text-white text-2xl font-bold">{profile.totalMatches}</Text>
          </View>

          <View className="flex-1 min-w-[45%] bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3e]">
            <Text className="text-[#888] text-xs uppercase mb-1">Win Rate</Text>
            <Text className="text-[#14F195] text-2xl font-bold">{winRate}%</Text>
          </View>

          <View className="flex-1 min-w-[45%] bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3e]">
            <Text className="text-[#888] text-xs uppercase mb-1">Current Streak</Text>
            <Text className="text-white text-2xl font-bold">🔥 {profile.currentStreak}</Text>
          </View>

          <View className="flex-1 min-w-[45%] bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3e]">
            <Text className="text-[#888] text-xs uppercase mb-1">Longest Streak</Text>
            <Text className="text-white text-2xl font-bold">⭐ {profile.longestStreak}</Text>
          </View>
        </View>

        {/* Badges */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">Badges ({profile.badges.length})</Text>
          
          {profile.badges.length > 0 ? (
            <View className="flex-row flex-wrap gap-3">
              {profile.badges.map((badge) => (
                <View
                  key={badge.id}
                  className="bg-[#1a1a2e] rounded-xl p-4 border border-[#9945FF] w-[30%]"
                >
                  <Text className="text-4xl text-center mb-2">🏅</Text>
                  <Text className="text-white text-xs font-bold text-center">
                    {badge.name}
                  </Text>
                  <Text className="text-[#888] text-xs text-center mt-1">
                    {badge.rarity}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-[#1a1a2e] rounded-xl p-6 border border-[#2a2a3e]">
              <Text className="text-[#888] text-center">No badges earned yet</Text>
            </View>
          )}
        </View>

        {/* Disconnect Button */}
        <TouchableOpacity
          className="bg-[#FF4444] rounded-xl p-4"
          onPress={() => wallet.disconnect()}
        >
          <Text className="text-white text-center font-bold">Disconnect Wallet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
