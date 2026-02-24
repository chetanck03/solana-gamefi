import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { LeaderboardEntry } from '../types';
import { Connection, PublicKey } from '@solana/web3.js';

export default function LeaderboardScreen() {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all-time'>('weekly');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from your backend API or Solana program
      // For now, using placeholder data structure
      const mockData: LeaderboardEntry[] = [];
      
      // In production, this would fetch from your game's Solana program
      // const connection = new Connection('https://api.devnet.solana.com');
      // const accounts = await connection.getProgramAccounts(programId);
      
      setLeaderboard(mockData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return { name: 'trophy', color: '#FFD700' };
    if (rank === 2) return { name: 'medal', color: '#C0C0C0' };
    if (rank === 3) return { name: 'medal', color: '#CD7F32' };
    return { name: 'ribbon', color: '#888' };
  };

  return (
    <View className="flex-1 bg-[#0a0a1a]">
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-2">
          <Text style={{ fontFamily: 'Bangers' }} className="text-3xl font-bold text-white">Leaderboard</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Ionicons name="refresh" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <Text style={{ fontFamily: 'Bangers' }} className="text-[#888] mb-6">Top players this {timeframe.replace('-', ' ')}</Text>

        {/* Timeframe Selector */}
        <View className="flex-row gap-2 mb-6">
          <TouchableOpacity
            className={`flex-1 rounded-xl p-3 ${
              timeframe === 'daily' ? 'bg-[#9945FF]' : 'bg-[#1a1a2e]'
            }`}
            onPress={() => setTimeframe('daily')}
          >
            <Text style={{ fontFamily: 'Bangers' }} className="text-white text-center font-bold">Daily</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 rounded-xl p-3 ${
              timeframe === 'weekly' ? 'bg-[#9945FF]' : 'bg-[#1a1a2e]'
            }`}
            onPress={() => setTimeframe('weekly')}
          >
            <Text style={{ fontFamily: 'Bangers' }} className="text-white text-center font-bold">Weekly</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 rounded-xl p-3 ${
              timeframe === 'all-time' ? 'bg-[#9945FF]' : 'bg-[#1a1a2e]'
            }`}
            onPress={() => setTimeframe('all-time')}
          >
            <Text style={{ fontFamily: 'Bangers' }} className="text-white text-center font-bold">All Time</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {loading ? (
          <View className="items-center py-12">
            <Ionicons name="hourglass" size={48} color="#888" />
            <Text style={{ fontFamily: 'Bangers' }} className="text-[#888] mt-4">Loading leaderboard...</Text>
          </View>
        ) : leaderboard.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="people" size={64} color="#888" />
            <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl font-bold mt-4">No Players Yet</Text>
            <Text style={{ fontFamily: 'Bangers' }} className="text-[#888] text-center mt-2">
              Be the first to compete and claim the top spot!
            </Text>
          </View>
        ) : (
          leaderboard.map((entry) => {
            const rankIcon = getRankIcon(entry.rank);
            
            return (
              <View
                key={entry.rank}
                className={`rounded-xl p-4 mb-3 ${
                  entry.rank <= 3 
                    ? 'bg-[#9945FF]/20 border-2 border-[#9945FF]' 
                    : 'bg-[#1a1a2e] border border-[#2a2a3e]'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="items-center mr-3" style={{ width: 40 }}>
                      <Ionicons 
                        name={rankIcon.name as any} 
                        size={32} 
                        color={rankIcon.color} 
                      />
                      <Text style={{ fontFamily: 'Bangers' }} className="text-white font-bold text-xs mt-1">#{entry.rank}</Text>
                    </View>
                    
                    <View className="flex-1">
                      <Text style={{ fontFamily: 'Bangers' }} className="text-white font-bold text-lg">{entry.username}</Text>
                      <Text style={{ fontFamily: 'Bangers' }} className="text-[#888] text-xs">
                        {entry.publicKey.slice(0, 4)}...{entry.publicKey.slice(-4)}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={16} color="#14F195" />
                      <Text style={{ fontFamily: 'Bangers' }} className="text-[#14F195] font-bold text-xl ml-1">
                        {entry.xp.toLocaleString()}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-[#888] text-xs">XP</Text>
                  </View>
                </View>

                <View className="flex-row justify-between mt-3 pt-3 border-t border-[#2a2a3e]">
                  <View className="flex-row items-center">
                    <Ionicons name="trophy" size={14} color="#888" />
                    <Text style={{ fontFamily: 'Bangers' }} className="text-[#888] text-xs ml-1">Wins:</Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white font-bold ml-1">{entry.wins}</Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Ionicons name="close-circle" size={14} color="#888" />
                    <Text style={{ fontFamily: 'Bangers' }} className="text-[#888] text-xs ml-1">Losses:</Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white font-bold ml-1">{entry.losses}</Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Ionicons name="stats-chart" size={14} color="#888" />
                    <Text style={{ fontFamily: 'Bangers' }} className="text-[#888] text-xs ml-1">Rate:</Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-[#14F195] font-bold ml-1">{entry.winRate}%</Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Ionicons name="flame" size={14} color="#FF6B6B" />
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white font-bold ml-1">{entry.streak}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
