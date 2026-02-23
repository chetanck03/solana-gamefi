import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants';
import { LeaderboardEntry } from '../types';

export default function LeaderboardScreen() {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all-time'>('weekly');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // TODO: Fetch leaderboard from API/blockchain
    const mockData: LeaderboardEntry[] = [
      { rank: 1, publicKey: 'ABC...XYZ', username: 'SolWarrior', xp: 15000, wins: 150, streak: 30 },
      { rank: 2, publicKey: 'DEF...UVW', username: 'ClashMaster', xp: 12500, wins: 125, streak: 15 },
      { rank: 3, publicKey: 'GHI...RST', username: 'CryptoKing', xp: 10000, wins: 100, streak: 10 },
    ];
    setLeaderboard(mockData);
  }, [timeframe]);

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <View className="flex-1 bg-[#0a0a1a]">
      <View className="p-6">
        <Text className="text-3xl font-bold text-white mb-2">Leaderboard</Text>
        <Text className="text-[#888] mb-6">Top players this week</Text>

        {/* Timeframe Selector */}
        <View className="flex-row gap-2 mb-6">
          <TouchableOpacity
            className={`flex-1 rounded-xl p-3 ${
              timeframe === 'daily' ? 'bg-[#9945FF]' : 'bg-[#1a1a2e]'
            }`}
            onPress={() => setTimeframe('daily')}
          >
            <Text className="text-white text-center font-bold">Daily</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 rounded-xl p-3 ${
              timeframe === 'weekly' ? 'bg-[#9945FF]' : 'bg-[#1a1a2e]'
            }`}
            onPress={() => setTimeframe('weekly')}
          >
            <Text className="text-white text-center font-bold">Weekly</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 rounded-xl p-3 ${
              timeframe === 'all-time' ? 'bg-[#9945FF]' : 'bg-[#1a1a2e]'
            }`}
            onPress={() => setTimeframe('all-time')}
          >
            <Text className="text-white text-center font-bold">All Time</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        {leaderboard.map((entry) => (
          <View
            key={entry.rank}
            className={`rounded-xl p-4 mb-3 ${
              entry.rank <= 3 ? 'bg-[#9945FF]/20 border-2 border-[#9945FF]' : 'bg-[#1a1a2e] border border-[#2a2a3e]'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Text className="text-3xl mr-3">{getRankEmoji(entry.rank)}</Text>
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">{entry.username}</Text>
                  <Text className="text-[#888] text-xs">{entry.publicKey}</Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-[#14F195] font-bold text-xl">{entry.xp.toLocaleString()}</Text>
                <Text className="text-[#888] text-xs">XP</Text>
              </View>
            </View>

            <View className="flex-row justify-between mt-3 pt-3 border-t border-[#2a2a3e]">
              <View>
                <Text className="text-[#888] text-xs">Wins</Text>
                <Text className="text-white font-bold">{entry.wins}</Text>
              </View>
              <View>
                <Text className="text-[#888] text-xs">Streak</Text>
                <Text className="text-white font-bold">🔥 {entry.streak}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
