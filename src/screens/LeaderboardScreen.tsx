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
      // Generate realistic mock data based on timeframe
      let mockData: LeaderboardEntry[] = [];
      
      if (timeframe === 'daily') {
        // Daily leaderboard - different top players
        mockData = [
          {
            rank: 1,
            publicKey: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7H3x5iV4TxXi',
            username: 'PhantomFighter',
            xp: 2840,
            wins: 18,
            losses: 2,
            winRate: 90,
            streak: 18,
            level: 18
          },
          {
            rank: 2,
            publicKey: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
            username: 'DeFiMaster',
            xp: 2650,
            wins: 16,
            losses: 3,
            winRate: 84,
            streak: 12,
            level: 20
          },
          {
            rank: 3,
            publicKey: 'J1toso1uCk3RLmjbvbTVWRx9KVUMs92SNSrYQN4Qnxzf',
            username: 'Web3Warrior',
            xp: 2420,
            wins: 15,
            losses: 4,
            winRate: 79,
            streak: 9,
            level: 17
          },
          {
            rank: 4,
            publicKey: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
            username: 'BlockchainBeast',
            xp: 2180,
            wins: 14,
            losses: 5,
            winRate: 74,
            streak: 7,
            level: 22
          },
          {
            rank: 5,
            publicKey: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
            username: 'TokenTitan',
            xp: 1950,
            wins: 12,
            losses: 4,
            winRate: 75,
            streak: 8,
            level: 16
          },
          {
            rank: 6,
            publicKey: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
            username: 'CryptoKing',
            xp: 1820,
            wins: 11,
            losses: 5,
            winRate: 69,
            streak: 5,
            level: 24
          },
          {
            rank: 7,
            publicKey: 'Cw8CFyM9FkoMi7K7Crf6HNQqf4L7c5Z7E4XT8ceNQQGC',
            username: 'StakeMaster',
            xp: 1640,
            wins: 10,
            losses: 6,
            winRate: 63,
            streak: 4,
            level: 14
          },
          {
            rank: 8,
            publicKey: '8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR',
            username: 'MetaGamer',
            xp: 1480,
            wins: 9,
            losses: 5,
            winRate: 64,
            streak: 6,
            level: 19
          },
          {
            rank: 9,
            publicKey: '4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi',
            username: 'SolanaWarrior',
            xp: 1320,
            wins: 8,
            losses: 6,
            winRate: 57,
            streak: 3,
            level: 23
          },
          {
            rank: 10,
            publicKey: 'BgvYv4FjxZWQjyKhddFQN9SjNMHSZeZWqkxEQ8t5RDPD',
            username: 'LamportLegend',
            xp: 1180,
            wins: 7,
            losses: 5,
            winRate: 58,
            streak: 4,
            level: 13
          }
        ];
      } else if (timeframe === 'weekly') {
        // Weekly leaderboard
        mockData = [
          {
            rank: 1,
            publicKey: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
            username: 'CryptoKing',
            xp: 8920,
            wins: 52,
            losses: 8,
            winRate: 87,
            streak: 12,
            level: 24
          },
          {
            rank: 2,
            publicKey: '4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi',
            username: 'SolanaWarrior',
            xp: 8340,
            wins: 48,
            losses: 11,
            winRate: 81,
            streak: 8,
            level: 23
          },
          {
            rank: 3,
            publicKey: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
            username: 'BlockchainBeast',
            xp: 7850,
            wins: 45,
            losses: 9,
            winRate: 83,
            streak: 15,
            level: 22
          },
          {
            rank: 4,
            publicKey: '2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2zhPdri9',
            username: 'NFTChampion',
            xp: 7120,
            wins: 41,
            losses: 14,
            winRate: 75,
            streak: 5,
            level: 21
          },
          {
            rank: 5,
            publicKey: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
            username: 'DeFiMaster',
            xp: 6580,
            wins: 38,
            losses: 12,
            winRate: 76,
            streak: 7,
            level: 20
          },
          {
            rank: 6,
            publicKey: '8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR',
            username: 'MetaGamer',
            xp: 6120,
            wins: 35,
            losses: 16,
            winRate: 69,
            streak: 3,
            level: 19
          },
          {
            rank: 7,
            publicKey: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7H3x5iV4TxXi',
            username: 'PhantomFighter',
            xp: 5640,
            wins: 32,
            losses: 13,
            winRate: 71,
            streak: 6,
            level: 18
          },
          {
            rank: 8,
            publicKey: 'J1toso1uCk3RLmjbvbTVWRx9KVUMs92SNSrYQN4Qnxzf',
            username: 'Web3Warrior',
            xp: 5180,
            wins: 29,
            losses: 17,
            winRate: 63,
            streak: 2,
            level: 17
          },
          {
            rank: 9,
            publicKey: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
            username: 'TokenTitan',
            xp: 4720,
            wins: 27,
            losses: 15,
            winRate: 64,
            streak: 4,
            level: 16
          },
          {
            rank: 10,
            publicKey: 'GVXRSBjFk6e6J3NbVPXohDJvmN1Ty4is89a7nAaQgKvd',
            username: 'DAODestroyer',
            xp: 4280,
            wins: 24,
            losses: 17,
            winRate: 59,
            streak: 1,
            level: 15
          },
          {
            rank: 11,
            publicKey: 'Cw8CFyM9FkoMi7K7Crf6HNQqf4L7c5Z7E4XT8ceNQQGC',
            username: 'StakeMaster',
            xp: 3890,
            wins: 22,
            losses: 18,
            winRate: 55,
            streak: 3,
            level: 14
          },
          {
            rank: 12,
            publicKey: 'BgvYv4FjxZWQjyKhddFQN9SjNMHSZeZWqkxEQ8t5RDPD',
            username: 'LamportLegend',
            xp: 3520,
            wins: 20,
            losses: 16,
            winRate: 56,
            streak: 2,
            level: 13
          }
        ];
      } else {
        // All-time leaderboard
        mockData = [
          {
            rank: 1,
            publicKey: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
            username: 'CryptoKing',
            xp: 15420,
            wins: 89,
            losses: 12,
            winRate: 88,
            streak: 12,
            level: 24
          },
          {
            rank: 2,
            publicKey: '4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi',
            username: 'SolanaWarrior',
            xp: 14850,
            wins: 76,
            losses: 18,
            winRate: 81,
            streak: 8,
            level: 23
          },
          {
            rank: 3,
            publicKey: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
            username: 'BlockchainBeast',
            xp: 13920,
            wins: 71,
            losses: 15,
            winRate: 83,
            streak: 15,
            level: 22
          },
          {
            rank: 4,
            publicKey: '2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2zhPdri9',
            username: 'NFTChampion',
            xp: 12680,
            wins: 65,
            losses: 22,
            winRate: 75,
            streak: 5,
            level: 21
          },
          {
            rank: 5,
            publicKey: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
            username: 'DeFiMaster',
            xp: 11540,
            wins: 58,
            losses: 19,
            winRate: 75,
            streak: 7,
            level: 20
          },
          {
            rank: 6,
            publicKey: '8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR',
            username: 'MetaGamer',
            xp: 10890,
            wins: 54,
            losses: 25,
            winRate: 68,
            streak: 3,
            level: 19
          },
          {
            rank: 7,
            publicKey: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7H3x5iV4TxXi',
            username: 'PhantomFighter',
            xp: 9720,
            wins: 49,
            losses: 21,
            winRate: 70,
            streak: 6,
            level: 18
          },
          {
            rank: 8,
            publicKey: 'J1toso1uCk3RLmjbvbTVWRx9KVUMs92SNSrYQN4Qnxzf',
            username: 'Web3Warrior',
            xp: 8950,
            wins: 45,
            losses: 28,
            winRate: 62,
            streak: 2,
            level: 17
          },
          {
            rank: 9,
            publicKey: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
            username: 'TokenTitan',
            xp: 8340,
            wins: 42,
            losses: 24,
            winRate: 64,
            streak: 4,
            level: 16
          },
          {
            rank: 10,
            publicKey: 'GVXRSBjFk6e6J3NbVPXohDJvmN1Ty4is89a7nAaQgKvd',
            username: 'DAODestroyer',
            xp: 7680,
            wins: 38,
            losses: 27,
            winRate: 58,
            streak: 1,
            level: 15
          },
          {
            rank: 11,
            publicKey: 'Cw8CFyM9FkoMi7K7Crf6HNQqf4L7c5Z7E4XT8ceNQQGC',
            username: 'StakeMaster',
            xp: 7120,
            wins: 36,
            losses: 29,
            winRate: 55,
            streak: 3,
            level: 14
          },
          {
            rank: 12,
            publicKey: 'BgvYv4FjxZWQjyKhddFQN9SjNMHSZeZWqkxEQ8t5RDPD',
            username: 'LamportLegend',
            xp: 6540,
            wins: 33,
            losses: 26,
            winRate: 56,
            streak: 2,
            level: 13
          },
          {
            rank: 13,
            publicKey: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            username: 'ValidatorVic',
            xp: 5980,
            wins: 31,
            losses: 31,
            winRate: 50,
            streak: 1,
            level: 12
          },
          {
            rank: 14,
            publicKey: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
            username: 'AnchorAce',
            xp: 5420,
            wins: 28,
            losses: 28,
            winRate: 50,
            streak: 0,
            level: 11
          },
          {
            rank: 15,
            publicKey: 'So11111111111111111111111111111111111111112',
            username: 'RustRaider',
            xp: 4890,
            wins: 25,
            losses: 30,
            winRate: 45,
            streak: 1,
            level: 10
          }
        ];
      }
      
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
