import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants';
import { Fighter, FighterType } from '../types';
import { useWallet } from '../context/WalletContext';
import { generateStarterFighters } from '../services/fighterService';
import OptimizedImage from '../components/OptimizedImage';

interface FighterCardProps {
  fighter: Fighter;
}

const FighterCard: React.FC<FighterCardProps> = ({ fighter }) => {
  const rarityColors = {
    common: '#888888',
    rare: '#4ECDC4',
    epic: '#9945FF',
    legendary: '#FFD700',
  };

  const typeIcons = {
    warrior: 'shield',
    mage: 'flash',
    archer: 'arrow-forward',
    tank: 'cube',
    assassin: 'eye',
  };

  return (
    <View 
      className="rounded-3xl m-2 overflow-hidden relative"
      style={{ 
        width: 340,
        height: 520,
        borderWidth: 3,
        borderColor: rarityColors[fighter.rarity],
        shadowColor: rarityColors[fighter.rarity],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 12,
      }}
    >
      {/* Full Background Image */}
      <View className="absolute inset-0">
        {fighter.imageUrl ? (
          <OptimizedImage 
            source={fighter.imageUrl}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            fallbackIcon={
              <View className="w-full h-full items-center justify-center bg-[#0a0a1a]">
                <Ionicons 
                  name={typeIcons[fighter.type] as any} 
                  size={120} 
                  color={rarityColors[fighter.rarity]} 
                />
              </View>
            }
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-[#0a0a1a]">
            <Ionicons 
              name={typeIcons[fighter.type] as any} 
              size={120} 
              color={rarityColors[fighter.rarity]} 
            />
          </View>
        )}
        
        {/* Dark Gradient Overlays */}
        <LinearGradient
          colors={['rgba(10, 10, 26, 0.7)', 'transparent', 'transparent']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 120,
          }}
        />
        <LinearGradient
          colors={['transparent', 'rgba(10, 10, 26, 0.85)', 'rgba(10, 10, 26, 0.98)']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 280,
          }}
        />
      </View>
      
      {/* Content Overlay */}
      <View className="flex-1 justify-between p-4">
        {/* Top Section - Type Badge */}
        <View className="flex-row justify-end">
          {/* <View 
            className="px-4 py-2 rounded-full flex-row items-center"
            style={{ 
              backgroundColor: rarityColors[fighter.rarity],
              shadowColor: rarityColors[fighter.rarity],
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Ionicons 
              name={typeIcons[fighter.type] as any} 
              size={18} 
              color="#fff" 
            />
          </View> */}
        </View>
        
        {/* Bottom Section - Info */}
        <View>
          {/* Name and Rarity */}
          <View className="mb-4">
            <Text 
              style={{ 
                fontFamily: 'Bangers',
                textShadowColor: 'rgba(0, 0, 0, 0.8)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }} 
              className="text-white text-3xl text-center"
              numberOfLines={1}
            >
              {fighter.name}
            </Text>
            
            <Text 
              className="text-center text-base uppercase tracking-widest mt-1"
              style={{ 
                color: "#14F195",
                fontFamily: 'Bangers',
                textShadowColor: 'rgba(0, 0, 0, 0.8)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              {fighter.rarity} {fighter.type}
            </Text>
          </View>
          
          {/* Stats */}
          <View 
            className="rounded-2xl p-4 mb-3"
            style={{ 
              backgroundColor: 'rgba(10, 10, 26, 0.85)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center flex-1">
                <Ionicons name="heart" size={18} color="#FF4444" />
                <Text className="text-white text-sm ml-2" style={{ fontFamily: 'Bangers' }}>Health</Text>
              </View>
              <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl">{fighter.maxHealth}</Text>
            </View>
            
            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center flex-1">
                <Ionicons name="flash" size={18} color="#FF6B6B" />
                <Text className="text-white text-sm ml-2" style={{ fontFamily: 'Bangers' }}>Attack</Text>
              </View>
              <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl">{fighter.attack}</Text>
            </View>
            
            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center flex-1">
                <Ionicons name="shield" size={18} color="#4ECDC4" />
                <Text className="text-white text-sm ml-2" style={{ fontFamily: 'Bangers' }}>Defense</Text>
              </View>
              <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl">{fighter.defense}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <View className="flex-row items-center flex-1">
                <Ionicons name="speedometer" size={18} color="#14F195" />
                <Text className="text-white text-sm ml-2" style={{ fontFamily: 'Bangers' }}>Speed</Text>
              </View>
              <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl">{fighter.speed}</Text>
            </View>
          </View>
          
          {/* Special Move */}
          <View 
            className="rounded-2xl p-3"
            style={{ 
              backgroundColor: 'rgba(10, 10, 26, 0.85)',
              borderWidth: 1,
              borderColor: rarityColors[fighter.rarity] + '40',        
            }}
          >
            <Text className="text-[#fff] text-sm mb-1" style={{ fontFamily: 'Bangers' }}>Special Move:</Text>
            <Text 
              style={{ 
                fontFamily: 'Bangers', 
                color: "#14F195",
                textShadowColor: 'rgba(0, 0, 0, 0.5)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }} 
              className="text-xl"
            >
              {fighter.specialMove.name}
            </Text>
            <Text className="text-[#fff] text-sm mt-1" style={{ fontFamily: 'Bangers' }} numberOfLines={2}>
              {fighter.specialMove.description}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function FighterCollectionScreen() {
  const wallet = useWallet();
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [filteredFighters, setFilteredFighters] = useState<Fighter[]>([]);
  const [selectedType, setSelectedType] = useState<FighterType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'attack' | 'health'>('name');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (wallet.connected) {
      // Load fighters - in real app, this would fetch from blockchain
      const starterFighters = generateStarterFighters();
      setFighters(starterFighters);
      setFilteredFighters(starterFighters);
    }
  }, [wallet.connected]);

  useEffect(() => {
    let filtered = [...fighters];
    
    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(f => f.type === selectedType);
    }
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        case 'attack':
          return b.attack - a.attack;
        case 'health':
          return b.maxHealth - a.maxHealth;
        default:
          return 0;
      }
    });
    
    setFilteredFighters(filtered);
  }, [fighters, selectedType, sortBy, searchQuery]);

  if (!wallet.connected) {
    return (
      <View className="flex-1 bg-[#0a0a1a] items-center justify-center p-6">
        <Ionicons name="people-outline" size={80} color={COLORS.textSecondary} />
        <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl mt-4 text-center">
          Connect Wallet to View Fighters
        </Text>
      </View>
    );
  }

  const types: (FighterType | 'all')[] = ['all', 'warrior', 'mage', 'archer', 'tank', 'assassin'];

  return (
    <View className="flex-1 bg-[#0a0a1a]">
      <View className="p-4">
        <Text style={{ fontFamily: 'Bangers' }} className="text-white text-3xl mb-4">
          MY FIGHTERS
        </Text>
        
        <Text style={{ fontFamily: 'Bangers' }} className="text-[#888888] text-lg mb-4">
          {filteredFighters.length} Fighter{filteredFighters.length !== 1 ? 's' : ''} Owned
        </Text>
        
        {/* Search */}
        <View className="mb-4">
          <View className="bg-[#1a1a2e] rounded-xl flex-row items-center border-2 border-[#2a2a3e]" style={{ maxWidth: 400 }}>
            <Ionicons name="search" className='ml-2 ' size={20} color={COLORS.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search fighters..."
              placeholderTextColor={COLORS.textSecondary}
              className="flex-1 ml-2 text-white"
              style={{ fontFamily: 'Bangers' }}
            />
          </View>
        </View>
        
        {/* Type Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {types.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedType(type)}
              className={`mr-2 px-4 py-2 rounded-full ${
                selectedType === type ? 'bg-[#9945FF]' : 'bg-[#1a1a2e]'
              }`}
            >
              <Text 
                style={{ fontFamily: 'Bangers' }}
                className={`${selectedType === type ? 'text-white' : 'text-[#888888]'} uppercase`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Sort */}
        <View className="flex-row mb-4">
          <Text style={{ fontFamily: 'Bangers' }} className="text-[#888888] mr-2">Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['name', 'rarity', 'attack', 'health'] as const).map((sort) => (
              <TouchableOpacity
                key={sort}
                onPress={() => setSortBy(sort)}
                className="mr-3"
              >
                <Text 
                  style={{ fontFamily: 'Bangers' }}
                  className={sortBy === sort ? 'text-[#14F195]' : 'text-[#888888]'}
                >
                  {sort.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      
      {/* Fighters List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center pb-6 px-2">
          {filteredFighters.map((fighter) => (
            <FighterCard key={fighter.id} fighter={fighter} />
          ))}
          
          {filteredFighters.length === 0 && (
            <View className="items-center mt-10">
              <Ionicons name="sad-outline" size={60} color={COLORS.textSecondary} />
              <Text className="text-[#888888] text-lg mt-4">No fighters found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
