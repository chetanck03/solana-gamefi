import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface GameCardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function GameCard({ 
  title, 
  description, 
  icon, 
  onPress,
  variant = 'secondary' 
}: GameCardProps) {
  const bgColor = variant === 'primary' ? 'bg-[#9945FF]' : 'bg-[#1a1a2e]';
  const borderColor = variant === 'primary' ? '' : 'border border-[#2a2a3e]';

  return (
    <TouchableOpacity
      className={`${bgColor} ${borderColor} rounded-xl p-6 mb-4`}
      onPress={onPress}
    >
      <Text className="text-4xl mb-2">{icon}</Text>
      <Text className="text-white text-xl font-bold mb-1">{title}</Text>
      <Text className={variant === 'primary' ? 'text-white/80' : 'text-[#888]'}>
        {description}
      </Text>
    </TouchableOpacity>
  );
}
