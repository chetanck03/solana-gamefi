import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OptimizedImage from './OptimizedImage';

const BATTLEFIELDS = [
  { id: 'Floating Sky', name: 'Floating Sky', image: require('../../assets/battle-screen/Floating-Sky.png') },
  { id: 'Ancient Colosseum', name: 'Ancient Colosseum', image: require('../../assets/battle-screen/Ancient-Colosseum-Arena.png') },
  { id: 'Dark Forest', name: 'Dark Forest', image: require('../../assets/battle-screen/Dark-Forest-Arena.png') },
  { id: 'Desert War', name: 'Desert War', image: require('../../assets/battle-screen/Desert-War-Battlefield.png') },
  { id: 'Frozen Ice', name: 'Frozen Ice', image: require('../../assets/battle-screen/Frozen-Ice-Arena.png') },
  { id: 'Ruined City', name: 'Ruined City', image: require('../../assets/battle-screen/Ruined-City-War-Zone.png') },
  { id: 'Storm Lightning', name: 'Storm Lightning', image: require('../../assets/battle-screen/Storm-Lightning-Battlefield.png') },
  { id: 'Volcanic Lava', name: 'Volcanic Lava', image: require('../../assets/battle-screen/Volcanic-Lava-Arena.png') },
];

interface BattlefieldSelectorProps {
  selectedBattlefield: string;
  onSelect: (battlefieldId: string) => void;
}

export default function BattlefieldSelector({ selectedBattlefield, onSelect }: BattlefieldSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const selectedMap = BATTLEFIELDS.find(b => b.id === selectedBattlefield) || BATTLEFIELDS[0];

  return (
    <View className="mb-4">
      {/* Header with Toggle */}
      <TouchableOpacity 
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between mb-3 px-2"
        activeOpacity={0.7}
      >
        <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl">
          SELECT-BATTLEFIELD:
        </Text>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#14F195" 
        />
      </TouchableOpacity>

      {/* Selected Map Preview */}
      {!isExpanded && (
        <View className="px-2">
          <View 
            className="rounded-xl overflow-hidden"
            style={{
              height: 100,
              borderWidth: 3,
              borderColor: '#14F195',
            }}
          >
            <OptimizedImage
              source={selectedMap.image}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              fallbackIcon={
                <View className="w-full h-full items-center justify-center bg-[#1a1a2e]">
                  <Ionicons name="map" size={40} color="#14F195" />
                </View>
              }
            />
            <View className="absolute bottom-0 left-0 right-0 bg-black/70 py-2">
              <Text 
                style={{ fontFamily: 'Bangers' }} 
                className="text-[#14F195] text-center text-base"
              >
                {selectedMap.name}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* All Maps Grid */}
      {isExpanded && (
        <View className="flex-row flex-wrap justify-center px-2">
          {BATTLEFIELDS.map((battlefield) => (
            <TouchableOpacity
              key={battlefield.id}
              onPress={() => {
                onSelect(battlefield.id);
                setIsExpanded(false);
              }}
              activeOpacity={0.8}
              className="w-[48%] m-1"
            >
              <View 
                className="rounded-xl overflow-hidden"
                style={{
                  height: 100,
                  borderWidth: selectedBattlefield === battlefield.id ? 3 : 2,
                  borderColor: selectedBattlefield === battlefield.id ? '#14F195' : '#2a2a3e',
                }}
              >
                <OptimizedImage
                  source={battlefield.image}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  fallbackIcon={
                    <View className="w-full h-full items-center justify-center bg-[#1a1a2e]">
                      <Ionicons name="map" size={30} color="#888888" />
                    </View>
                  }
                />
                {selectedBattlefield === battlefield.id && (
                  <View className="absolute top-2 right-2 bg-[#14F195] rounded-full w-6 h-6 items-center justify-center">
                    <Ionicons name="checkmark" size={16} color="#0a0a1a" />
                  </View>
                )}
                <View className="absolute bottom-0 left-0 right-0 bg-black/70 py-1">
                  <Text 
                    style={{ fontFamily: 'Bangers' }} 
                    className={`text-center text-xs ${
                      selectedBattlefield === battlefield.id ? 'text-[#14F195]' : 'text-white'
                    }`}
                    numberOfLines={1}
                  >
                    {battlefield.name}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
