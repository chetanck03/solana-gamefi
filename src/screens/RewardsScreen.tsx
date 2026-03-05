import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '../context/WalletContext';
import { QuizService } from '../services/quizService';
import { StreakService } from '../services/streakService';

export default function RewardsScreen() {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [quizReward, setQuizReward] = useState(0);
  const [streakReward, setStreakReward] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    if (!wallet.publicKey || !wallet.connection) return;

    try {
      const programId = new PublicKey(process.env.EXPO_PUBLIC_PROGRAM_ID || 'GhESwjzEv3C3qKQJKjAfhaq5GFK5vDLaku8tPqCKGzYR');
      const quizService = new QuizService(wallet.connection, programId);
      const streakService = new StreakService(wallet.connection, programId);

      const quizState = await quizService.getQuizState(wallet.publicKey);
      const streakState = await streakService.getStreakState(wallet.publicKey);

      const quizPending = quizState?.pendingReward || 0;
      const streakPending = streakState?.pendingRewards || 0;

      setQuizReward(quizPending);
      setStreakReward(streakPending);
      setTotalRewards(quizPending + streakPending);
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  const claimQuizReward = async () => {
    Alert.alert('Coming Soon', 'Reward claiming will be available once the contracts are deployed and configured.');
  };

  const claimStreakReward = async () => {
    Alert.alert('Coming Soon', 'Reward claiming will be available once the contracts are deployed and configured.');
  };

  const claimAllRewards = async () => {
    if (totalRewards === 0) {
      Alert.alert('No Rewards', 'No rewards available to claim');
      return;
    }
    Alert.alert('Coming Soon', 'Reward claiming will be available once the contracts are deployed and configured.');
  };

  return (
    <ScrollView className="flex-1 bg-[#0a0a1f]">
      <View className="p-6">
        {/* Header */}
        <Text style={{ fontFamily: 'Bangers' }} className="text-3xl text-white text-center mb-2">
          🏆 REWARDS
        </Text>
        <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-center mb-8">
          Claim your earned rewards
        </Text>

        {/* Total Rewards Card */}
        <View className="bg-purple-600 rounded-3xl p-6 mb-6">
          <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg mb-2">Total Pending Rewards</Text>
          <Text style={{ fontFamily: 'Bangers' }} className="text-white text-4xl">
            {(totalRewards / 1_000_000_000).toFixed(6)} SOL
          </Text>
          <Text style={{ fontFamily: 'Bangers' }} className="text-white/70 text-sm mt-2">
            ≈ ${((totalRewards / 1_000_000_000) * 100).toFixed(2)} USD
          </Text>
        </View>

        {/* Quiz Rewards */}
        <View className="bg-[#1a1a3e] rounded-2xl p-5 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">🎓</Text>
              <View>
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg">Quiz Rewards</Text>
                <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-sm">From completed quizzes</Text>
              </View>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between">
            <Text style={{ fontFamily: 'Bangers' }} className="text-purple-400 text-2xl">
              {(quizReward / 1_000_000_000).toFixed(6)} SOL
            </Text>
            <TouchableOpacity
              onPress={claimQuizReward}
              disabled={loading || quizReward === 0}
              className={`px-6 py-3 rounded-xl ${
                quizReward > 0 ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <Text style={{ fontFamily: 'Bangers' }} className="text-white">
                {loading ? 'Claiming...' : 'Claim'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Streak Rewards */}
        <View className="bg-[#1a1a3e] rounded-2xl p-5 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">🔥</Text>
              <View>
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg">Streak Rewards</Text>
                <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-sm">From daily check-ins</Text>
              </View>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between">
            <Text style={{ fontFamily: 'Bangers' }} className="text-orange-400 text-2xl">
              {(streakReward / 1_000_000_000).toFixed(6)} SOL
            </Text>
            <TouchableOpacity
              onPress={claimStreakReward}
              disabled={loading || streakReward === 0}
              className={`px-6 py-3 rounded-xl ${
                streakReward > 0 ? 'bg-orange-600' : 'bg-gray-600'
              }`}
            >
              <Text style={{ fontFamily: 'Bangers' }} className="text-white">
                {loading ? 'Claiming...' : 'Claim'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Claim All Button */}
        <TouchableOpacity
          onPress={claimAllRewards}
          disabled={loading || totalRewards === 0}
          className={`py-4 rounded-2xl ${
            totalRewards > 0 ? 'bg-green-500' : 'bg-gray-600'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ fontFamily: 'Bangers' }} className="text-white text-center text-lg">
              CLAIM ALL REWARDS
            </Text>
          )}
        </TouchableOpacity>

        {/* Info Section */}
        <View className="mt-8 bg-[#1a1a3e] rounded-2xl p-5">
          <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg mb-3">💡 How to Earn</Text>
          <View className="space-y-2">
            <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-sm">
              • Complete daily quizzes correctly to earn 0.001 SOL
            </Text>
            <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-sm">
              • Check in daily to build your streak
            </Text>
            <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-sm">
              • Reach streak milestones: 5, 10, 20 days for bonus rewards
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
