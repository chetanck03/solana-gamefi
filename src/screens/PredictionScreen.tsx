import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { COLORS } from '../constants';

export default function PredictionScreen() {
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedPrediction) {
      Alert.alert('Error', 'Please make a prediction first');
      return;
    }
    
    // TODO: Submit prediction to blockchain
    Alert.alert('Success', 'Prediction submitted! Check back tomorrow for results.');
    setHasSubmitted(true);
  };

  if (hasSubmitted) {
    return (
      <View className="flex-1 bg-[#0a0a1a] items-center justify-center p-6">
        <Text className="text-6xl mb-6">✅</Text>
        <Text className="text-2xl font-bold text-white mb-2 text-center">
          Prediction Submitted!
        </Text>
        <Text className="text-[#888] text-center mb-6">
          Come back tomorrow to see if you were right and claim your XP
        </Text>
        <TouchableOpacity
          className="bg-[#9945FF] rounded-xl px-8 py-4"
          onPress={() => setHasSubmitted(false)}
        >
          <Text className="text-white font-bold">Make Another Prediction</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#0a0a1a]">
      <View className="p-6">
        <Text className="text-3xl font-bold text-white mb-2">Daily Prediction</Text>
        <Text className="text-[#888] mb-6">Make your prediction and earn XP</Text>

        {/* SOL Price Prediction */}
        <View className="bg-[#1a1a2e] rounded-xl p-6 mb-6 border border-[#2a2a3e]">
          <Text className="text-white text-xl font-bold mb-4">📈 SOL Price Movement</Text>
          <Text className="text-[#888] mb-4">Will SOL price go up or down in 24h?</Text>
          
          <View className="flex-row gap-4">
            <TouchableOpacity
              className={`flex-1 rounded-xl p-4 ${
                selectedPrediction === 'up' ? 'bg-[#14F195]' : 'bg-[#2a2a3e]'
              }`}
              onPress={() => setSelectedPrediction('up')}
            >
              <Text className={`text-center font-bold ${
                selectedPrediction === 'up' ? 'text-black' : 'text-white'
              }`}>
                📈 UP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 rounded-xl p-4 ${
                selectedPrediction === 'down' ? 'bg-[#FF4444]' : 'bg-[#2a2a3e]'
              }`}
              onPress={() => setSelectedPrediction('down')}
            >
              <Text className={`text-center font-bold ${
                selectedPrediction === 'down' ? 'text-white' : 'text-white'
              }`}>
                📉 DOWN
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rewards Info */}
        <View className="bg-[#1a1a2e] rounded-xl p-6 mb-6 border border-[#2a2a3e]">
          <Text className="text-white text-lg font-bold mb-3">🎁 Potential Rewards</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-[#888]">Correct Prediction:</Text>
            <Text className="text-[#14F195] font-bold">+100 XP</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-[#888]">With Streak Bonus:</Text>
            <Text className="text-[#14F195] font-bold">+150 XP</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[#888]">Wrong Prediction:</Text>
            <Text className="text-[#888]">+10 XP</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`rounded-xl p-6 ${
            selectedPrediction ? 'bg-[#9945FF]' : 'bg-[#2a2a3e]'
          }`}
          onPress={handleSubmit}
          disabled={!selectedPrediction}
        >
          <Text className="text-white text-center text-lg font-bold">
            Submit Prediction
          </Text>
        </TouchableOpacity>

        {/* History */}
        <View className="mt-8">
          <Text className="text-white text-xl font-bold mb-4">Recent Predictions</Text>
          <View className="bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3e]">
            <Text className="text-[#888] text-center">No predictions yet</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
