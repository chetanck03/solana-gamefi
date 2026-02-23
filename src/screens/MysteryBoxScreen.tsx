import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { COLORS, PREMIUM_BOX_COST } from '../constants';

export default function MysteryBoxScreen() {
  const [isOpening, setIsOpening] = useState(false);
  const [rewards, setRewards] = useState<any[]>([]);
  const [canClaimFree, setCanClaimFree] = useState(true);

  const openBox = async (type: 'free' | 'premium') => {
    if (type === 'free' && !canClaimFree) {
      Alert.alert('Error', 'Free box available once per day');
      return;
    }

    setIsOpening(true);
    
    // Simulate opening animation
    setTimeout(() => {
      const mockRewards = [
        { type: 'xp', value: Math.floor(Math.random() * 100) + 50 },
        ...(Math.random() > 0.7 ? [{ type: 'badge', value: 'Lucky Charm' }] : []),
      ];
      
      setRewards(mockRewards);
      setIsOpening(false);
      
      if (type === 'free') {
        setCanClaimFree(false);
      }
    }, 2000);
  };

  if (isOpening) {
    return (
      <View className="flex-1 bg-[#0a0a1a] items-center justify-center">
        <Text className="text-8xl mb-6 animate-pulse">🎁</Text>
        <Text className="text-2xl font-bold text-white">Opening...</Text>
      </View>
    );
  }

  if (rewards.length > 0) {
    return (
      <View className="flex-1 bg-[#0a0a1a] items-center justify-center p-6">
        <Text className="text-6xl mb-6">🎉</Text>
        <Text className="text-3xl font-bold text-white mb-6">You Got:</Text>
        
        {rewards.map((reward, index) => (
          <View key={index} className="bg-[#1a1a2e] rounded-xl p-6 mb-4 w-full border border-[#2a2a3e]">
            {reward.type === 'xp' && (
              <>
                <Text className="text-4xl text-center mb-2">⭐</Text>
                <Text className="text-[#14F195] text-3xl font-bold text-center">
                  +{reward.value} XP
                </Text>
              </>
            )}
            {reward.type === 'badge' && (
              <>
                <Text className="text-4xl text-center mb-2">🏅</Text>
                <Text className="text-[#9945FF] text-xl font-bold text-center">
                  {reward.value}
                </Text>
              </>
            )}
          </View>
        ))}

        <TouchableOpacity
          className="bg-[#9945FF] rounded-xl px-8 py-4 mt-4"
          onPress={() => setRewards([])}
        >
          <Text className="text-white font-bold">Claim Rewards</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#0a0a1a]">
      <View className="p-6">
        <Text className="text-3xl font-bold text-white mb-2">Mystery Box</Text>
        <Text className="text-[#888] mb-6">Open boxes to get rewards</Text>

        {/* Free Box */}
        <View className="bg-[#1a1a2e] rounded-xl p-6 mb-6 border border-[#2a2a3e]">
          <Text className="text-6xl text-center mb-4">🎁</Text>
          <Text className="text-white text-2xl font-bold text-center mb-2">
            Free Daily Box
          </Text>
          <Text className="text-[#888] text-center mb-4">
            Available once every 24 hours
          </Text>
          
          <View className="bg-[#2a2a3e] rounded-xl p-4 mb-4">
            <Text className="text-[#888] text-sm mb-2">Possible Rewards:</Text>
            <Text className="text-white">• 50-150 XP</Text>
            <Text className="text-white">• 30% chance for badge</Text>
            <Text className="text-white">• Streak boost (rare)</Text>
          </View>

          <TouchableOpacity
            className={`rounded-xl p-4 ${
              canClaimFree ? 'bg-[#14F195]' : 'bg-[#2a2a3e]'
            }`}
            onPress={() => openBox('free')}
            disabled={!canClaimFree}
          >
            <Text className={`text-center font-bold ${
              canClaimFree ? 'text-black' : 'text-[#888]'
            }`}>
              {canClaimFree ? 'Open Free Box' : 'Available in 23h 45m'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Premium Box */}
        <View className="bg-[#1a1a2e] rounded-xl p-6 border border-[#9945FF]">
          <Text className="text-6xl text-center mb-4">💎</Text>
          <Text className="text-white text-2xl font-bold text-center mb-2">
            Premium Box
          </Text>
          <Text className="text-[#888] text-center mb-4">
            {PREMIUM_BOX_COST} SOL per box
          </Text>
          
          <View className="bg-[#2a2a3e] rounded-xl p-4 mb-4">
            <Text className="text-[#888] text-sm mb-2">Guaranteed Rewards:</Text>
            <Text className="text-[#14F195]">• 200-500 XP</Text>
            <Text className="text-[#14F195]">• 70% chance for rare badge</Text>
            <Text className="text-[#14F195]">• 2x streak boost</Text>
          </View>

          <TouchableOpacity
            className="bg-[#9945FF] rounded-xl p-4"
            onPress={() => openBox('premium')}
          >
            <Text className="text-white text-center font-bold">
              Open Premium Box
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
