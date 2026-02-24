import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CARD_RARITIES } from '../constants';
import { Card, CardType } from '../types';
import { useWallet } from '../context/WalletContext';
import { generateStarterDeck } from '../services/cardService';

export default function CollectionScreen() {
  const wallet = useWallet();
  const [cards, setCards] = useState<Card[]>([]);
  const [filter, setFilter] = useState<'all' | CardType>('all');
  const [sortBy, setSortBy] = useState<'rarity' | 'attack' | 'name'>('rarity');

  useEffect(() => {
    if (wallet.connected) {
      // Load player's card collection
      const deck = generateStarterDeck();
      setCards(deck);
    }
  }, [wallet.connected]);

  const filteredCards = cards.filter(card => 
    filter === 'all' || card.type === filter
  );

  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortBy === 'rarity') {
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    } else if (sortBy === 'attack') {
      return b.attack - a.attack;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  const typeIcons = {
    warrior: 'shield',
    mage: 'flash',
    archer: 'arrow-forward',
    tank: 'cube',
    assassin: 'eye',
  };

  if (!wallet.connected) {
    return (
      <View className="flex-1 bg-[#0a0a1a] items-center justify-center p-6">
        <Ionicons name="albums" size={64} color="#888" />
        <Text className="text-white text-xl font-bold mt-4">Connect Wallet</Text>
        <Text className="text-[#888] text-center mt-2">
          Connect your wallet to view your card collection
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0a0a1a]">
      <View className="p-6">
        <Text className="text-3xl font-bold text-white mb-2">My Collection</Text>
        <Text className="text-[#888] mb-6">{cards.length} cards total</Text>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <TouchableOpacity
            className={`rounded-full px-4 py-2 mr-2 ${
              filter === 'all' ? 'bg-[#9945FF]' : 'bg-[#1a1a2e]'
            }`}
            onPress={() => setFilter('all')}
          >
            <Text className="text-white font-bold">All</Text>
          </TouchableOpacity>
          
          {(['warrior', 'mage', 'archer', 'tank', 'assassin'] as CardType[]).map(type => (
            <TouchableOpacity
              key={type}
              className={`rounded-full px-4 py-2 mr-2 ${
                filter === type ? 'bg-[#9945FF]' : 'bg-[#1a1a2e]'
              }`}
              onPress={() => setFilter(type)}
            >
              <Text className="text-white font-bold capitalize">{type}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Options */}
        <View className="flex-row gap-2 mb-6">
          <TouchableOpacity
            className={`flex-1 rounded-xl p-2 ${
              sortBy === 'rarity' ? 'bg-[#9945FF]' : 'bg-[#1a1a2e]'
            }`}
            onPress={() => setSortBy('rarity')}
          >
            <Text className="text-white text-center text-sm">Rarity</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 rounded-xl p-2 ${
              sortBy === 'attack' ? 'bg-[#9945FF]' : 'bg-[#1a1a2e]'
            }`}
            onPress={() => setSortBy('attack')}
          >
            <Text className="text-white text-center text-sm">Attack</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 rounded-xl p-2 ${
              sortBy === 'name' ? 'bg-[#9945FF]' : 'bg-[#1a1a2e]'
            }`}
            onPress={() => setSortBy('name')}
          >
            <Text className="text-white text-center text-sm">Name</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Grid */}
      <ScrollView className="flex-1 px-6">
        <View className="flex-row flex-wrap justify-between">
          {sortedCards.map((card) => (
            <View
              key={card.id}
              className="bg-[#1a1a2e] rounded-xl p-4 mb-4 border-2"
              style={{ 
                width: '48%',
                borderColor: CARD_RARITIES[card.rarity].color 
              }}
            >
              <View className="items-center mb-3">
                <Ionicons 
                  name={typeIcons[card.type] as any} 
                  size={40} 
                  color={CARD_RARITIES[card.rarity].color} 
                />
              </View>
              
              <Text className="text-white font-bold text-center mb-1" numberOfLines={1}>
                {card.name}
              </Text>
              
              <Text 
                className="text-xs text-center mb-3 capitalize"
                style={{ color: CARD_RARITIES[card.rarity].color }}
              >
                {card.rarity}
              </Text>
              
              <View className="flex-row justify-between mb-1">
                <View className="flex-row items-center">
                  <Ionicons name="flash" size={14} color="#FF6B6B" />
                  <Text className="text-white text-xs ml-1">{card.attack}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="shield" size={14} color="#4ECDC4" />
                  <Text className="text-white text-xs ml-1">{card.defense}</Text>
                </View>
              </View>
              
              <View className="flex-row justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="heart" size={14} color="#FF4444" />
                  <Text className="text-white text-xs ml-1">{card.health}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="water" size={14} color="#14F195" />
                  <Text className="text-white text-xs ml-1">{card.mana}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
