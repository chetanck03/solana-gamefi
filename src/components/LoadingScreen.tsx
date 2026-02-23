import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <View className="flex-1 bg-[#0a0a1a] items-center justify-center">
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text className="text-white text-lg mt-4">{message}</Text>
    </View>
  );
}
