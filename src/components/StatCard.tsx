import React from 'react';
import { View, Text } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}

export function StatCard({ label, value, icon, color = '#ffffff' }: StatCardProps) {
  return (
    <View className="flex-1 min-w-[45%] bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a3e]">
      <Text className="text-[#888] text-xs uppercase mb-1">{label}</Text>
      <Text className="text-2xl font-bold" style={{ color }}>
        {icon && `${icon} `}{value}
      </Text>
    </View>
  );
}
