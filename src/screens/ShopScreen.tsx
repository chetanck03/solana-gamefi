import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { useWallet } from '../context/WalletContext';
import { generateCard } from '../services/cardService';
import { CardType } from '../types';

interface CardPack {
  id: string;
  name: string;
  price: number;
  cardCount: number;
  guaranteedRarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
}

const CARD_PACKS: CardPack[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    price: 0.01,
    cardCount: 5,
    guaranteedRarity: 'common',
    description: '5 cards with at least 1 rare',
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    price: 0.05,
    cardCount: 10,
    guaranteedRarity: 'rare',
    description: '10 cards with at least 1 epic',
  },
  {
    id: 'legendary',
    name: 'Legendary Pack',
    price: 0.1,
    cardCount: 15,
    guaranteedRarity: 'epic',
    description: '15 cards with guaranteed legendary',
  },
];

export default function ShopScreen() {
  const wallet = useWallet();
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async (pack: CardPack) => {
    if (!wallet.connected) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet first');
      return;
    }

    setPurchasing(true);
    
    try {
      // TODO: Implement actual Solana transaction
      // const transaction = await createPurchaseTransaction(pack);
      // const signature = await wallet.sendTransaction(transaction);
      
      // Simulate purchase
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Purchase Successful!',
        `You received ${pack.cardCount} new cards!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Purchase Failed', 'Please try again');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#0a0a1a]">
      <View className="p-6">
        <Text className="text-3xl font-bold text-white mb-2">Card Shop</Text>
        <Text className="text-[#888] mb-6">Purchase card packs to expand your collection</Text>

        {/* Card Packs */}
        {CARD_PACKS.map((pack) => (
          <View
            key={pack.id}
            className="bg-[#1a1a2e] rounded-xl p-6 mb-4 border border-[#2a2a3e]"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-white text-2xl font-bold">{pack.name}</Text>
                <Text className="text-[#888] mt-1">{pack.description}</Text>
              </View>
              <Ionicons name="cube" size={48} color={COLORS.primary} />
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Ionicons name="albums" size={20} color="#888" />
                <Text className="text-white ml-2">{pack.cardCount} cards</Text>
              </View>
              
              <View className="bg-[#9945FF] rounded-full px-4 py-2">
                <Text className="text-white font-bold">{pack.price} SOL</Text>
              </View>
            </View>

            <TouchableOpacity
              className="bg-[#14F195] rounded-xl p-4"
              onPress={() => handlePurchase(pack)}
              disabled={purchasing}
            >
              <Text className="text-black text-center font-bold text-lg">
                {purchasing ? 'Processing...' : 'Purchase Pack'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Info Section */}
        <View className="bg-[#1a1a2e] rounded-xl p-6 border border-[#2a2a3e] mt-4">
          <View className="flex-row items-center mb-4">
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <Text className="text-white text-xl font-bold ml-2">How It Works</Text>
          </View>

          <View className="mb-3">
            <View className="flex-row items-start mb-2">
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text className="text-[#888] ml-2 flex-1">
                Each pack contains random cards of varying rarities
              </Text>
            </View>
            
            <View className="flex-row items-start mb-2">
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text className="text-[#888] ml-2 flex-1">
                Higher tier packs guarantee better cards
              </Text>
            </View>
            
            <View className="flex-row items-start mb-2">
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text className="text-[#888] ml-2 flex-1">
                All purchases are on-chain and verifiable
              </Text>
            </View>
            
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text className="text-[#888] ml-2 flex-1">
                Cards are NFTs that you truly own
              </Text>
            </View>
          </View>
        </View>

        {/* Rarity Guide */}
        <View className="bg-[#1a1a2e] rounded-xl p-6 border border-[#2a2a3e] mt-4">
          <Text className="text-white text-xl font-bold mb-4">Rarity Guide</Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[#888888]">Common</Text>
              <Text className="text-[#888888]">60% drop rate</Text>
            </View>
            
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[#4ECDC4]">Rare</Text>
              <Text className="text-[#4ECDC4]">25% drop rate</Text>
            </View>
            
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[#9945FF]">Epic</Text>
              <Text className="text-[#9945FF]">12% drop rate</Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-[#FFD700]">Legendary</Text>
              <Text className="text-[#FFD700]">3% drop rate</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
