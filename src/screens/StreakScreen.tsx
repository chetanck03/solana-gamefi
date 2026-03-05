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
import { StreakService, StreakState } from '../services/streakService';

export default function StreakScreen() {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [streakState, setStreakState] = useState<StreakState | null>(null);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState(0);
  const [isAtRisk, setIsAtRisk] = useState(false);

  useEffect(() => {
    loadStreakData();
    const interval = setInterval(loadStreakData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadStreakData = async () => {
    if (!wallet.publicKey || !wallet.connection) return;

    try {
      const programId = new PublicKey(process.env.EXPO_PUBLIC_PROGRAM_ID || 'GhESwjzEv3C3qKQJKjAfhaq5GFK5vDLaku8tPqCKGzYR');
      const streakService = new StreakService(wallet.connection, programId);
      const state = await streakService.getStreakState(wallet.publicKey);
      const canCheck = await streakService.canCheckIn(wallet.publicKey);
      const timeRemaining = await streakService.getTimeUntilNextCheckIn(wallet.publicKey);
      const atRisk = await streakService.isStreakAtRisk(wallet.publicKey);

      setStreakState(state);
      setCanCheckIn(canCheck);
      setTimeUntilNext(timeRemaining);
      setIsAtRisk(atRisk);
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!wallet.publicKey || !wallet.connection) return;

    setLoading(true);
    try {
      const programId = new PublicKey(process.env.EXPO_PUBLIC_PROGRAM_ID || 'GhESwjzEv3C3qKQJKjAfhaq5GFK5vDLaku8tPqCKGzYR');
      const streakService = new StreakService(wallet.connection, programId);
      
      // Initialize if needed
      if (!streakState) {
        await streakService.initializeStreak(wallet.publicKey, wallet.authToken);
      }
      
      await streakService.checkIn(wallet.publicKey, wallet.authToken);
      Alert.alert('Success!', 'Daily check-in completed! 🎉');
      await loadStreakData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getMilestoneProgress = (current: number) => {
    const milestones = [5, 10, 20];
    const nextMilestone = milestones.find(m => m > current) || 20;
    return { next: nextMilestone, progress: (current / nextMilestone) * 100 };
  };

  const milestone = streakState ? getMilestoneProgress(streakState.currentStreak) : { next: 5, progress: 0 };

  return (
    <ScrollView className="flex-1 bg-[#0a0a1f]">
      <View className="p-6">
        {/* Header */}
        <Text className="text-3xl font-bold text-white text-center mb-2">
          🔥 DAILY STREAK
        </Text>
        <Text className="text-gray-400 text-center mb-8">
          Check in daily to build your streak
        </Text>

        {/* Current Streak Card */}
        <View className="bg-orange-600 rounded-3xl p-8 mb-6 items-center">
          <Text className="text-white/80 text-lg mb-2">Current Streak</Text>
          <Text className="text-white text-7xl font-bold mb-2">
            {streakState?.currentStreak || 0}
          </Text>
          <Text className="text-white text-2xl">Days</Text>
          
          {isAtRisk && (
            <View className="mt-4 bg-red-500/30 px-4 py-2 rounded-full">
              <Text className="text-white font-semibold">⚠️ Streak at risk!</Text>
            </View>
          )}
        </View>

        {/* Check-in Button */}
        <TouchableOpacity
          onPress={handleCheckIn}
          disabled={loading || !canCheckIn}
          className={`py-5 rounded-2xl mb-6 ${
            canCheckIn ? 'bg-green-500' : 'bg-gray-600'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="items-center">
              <Text className="text-white text-xl font-bold">
                {canCheckIn ? '✓ CHECK IN NOW' : '⏰ CHECKED IN'}
              </Text>
              {!canCheckIn && timeUntilNext > 0 && (
                <Text className="text-white/70 text-sm mt-1">
                  Next check-in in {formatTime(timeUntilNext)}
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* Stats Grid */}
        <View className="flex-row mb-6">
          <View className="flex-1 bg-[#1a1a3e] rounded-2xl p-4 mr-2">
            <Text className="text-gray-400 text-sm mb-1">Longest</Text>
            <Text className="text-white text-3xl font-bold">
              {streakState?.longestStreak || 0}
            </Text>
            <Text className="text-gray-400 text-xs">days</Text>
          </View>
          
          <View className="flex-1 bg-[#1a1a3e] rounded-2xl p-4 ml-2">
            <Text className="text-gray-400 text-sm mb-1">Total</Text>
            <Text className="text-white text-3xl font-bold">
              {streakState?.totalCheckIns || 0}
            </Text>
            <Text className="text-gray-400 text-xs">check-ins</Text>
          </View>
        </View>

        {/* Next Milestone */}
        <View className="bg-[#1a1a3e] rounded-2xl p-5 mb-6">
          <Text className="text-white text-lg font-semibold mb-3">
            Next Milestone: {milestone.next} Days
          </Text>
          <View className="bg-gray-700 rounded-full h-3 mb-2">
            <View 
              className="bg-purple-500 h-3 rounded-full"
              style={{ width: `${Math.min(milestone.progress, 100)}%` }}
            />
          </View>
          <Text className="text-gray-400 text-sm">
            {milestone.next - (streakState?.currentStreak || 0)} days to go
          </Text>
        </View>

        {/* Rewards Info */}
        <View className="bg-[#1a1a3e] rounded-2xl p-5 mb-6">
          <Text className="text-white text-lg font-semibold mb-3">
            🎁 Milestone Rewards
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🥉</Text>
                <Text className="text-white">5 Days</Text>
              </View>
              <Text className="text-yellow-400 font-semibold">0.0005 SOL</Text>
            </View>
            
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🥈</Text>
                <Text className="text-white">10 Days</Text>
              </View>
              <Text className="text-yellow-400 font-semibold">0.001 SOL</Text>
            </View>
            
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🥇</Text>
                <Text className="text-white">20 Days</Text>
              </View>
              <Text className="text-yellow-400 font-semibold">0.0025 SOL</Text>
            </View>
          </View>
        </View>

        {/* Pending Rewards */}
        {streakState && streakState.pendingRewards > 0 && (
          <View className="bg-purple-600 rounded-2xl p-5">
            <Text className="text-white text-lg font-semibold mb-2">
              💰 Pending Rewards
            </Text>
            <Text className="text-white text-3xl font-bold mb-3">
              {(streakState.pendingRewards / 1_000_000_000).toFixed(6)} SOL
            </Text>
            <Text className="text-white/80 text-sm">
              Go to Rewards page to claim your earnings!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
