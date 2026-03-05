import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { getAllShopFighters } from '../services/fighterService';
import { ALL_FIGHTERS } from '../data/fighters';
import { AnchorService } from '../services/anchorService';
import { Fighter, FighterType } from '../types';
import OptimizedImage from '../components/OptimizedImage';

interface FighterPack {
  id: string;
  name: string;
  price: number;
  fighterCount: number;
  guaranteedRarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
}

const FIGHTER_PACKS: FighterPack[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    price: 0.01,
    fighterCount: 3,
    guaranteedRarity: 'common',
    description: '3 fighters with at least 1 rare',
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    price: 0.05,
    fighterCount: 5,
    guaranteedRarity: 'rare',
    description: '5 fighters with at least 1 epic',
  },
  {
    id: 'legendary',
    name: 'Legendary Pack',
    price: 0.1,
    fighterCount: 8,
    guaranteedRarity: 'epic',
    description: '8 fighters with guaranteed legendary',
  },
];

interface ShopFighter {
  fighter: Fighter;
  price: number;
  owned: boolean;
}

interface FighterCardProps {
  shopFighter: ShopFighter;
  onPurchase: (shopFighter: ShopFighter) => void;
  purchasing: boolean;
  isOwned: boolean;
}

const FighterCard: React.FC<FighterCardProps> = ({ shopFighter, onPurchase, purchasing, isOwned }) => {
  const { fighter, price } = shopFighter;
  
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
            height: 320,
          }}
        />
      </View>
      
      {/* Owned Badge */}
      {isOwned && (
        <View 
          className="absolute top-4 right-4 px-4 py-2 rounded-full flex-row items-center"
          style={{ 
            backgroundColor: '#14F195',
            shadowColor: '#14F195',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Ionicons name="checkmark-circle" size={18} color="#000" />
          <Text style={{ fontFamily: 'Bangers' }} className="text-black ml-1">OWNED</Text>
        </View>
      )}
      
      {/* Content Overlay */}
      <View className="flex-1 justify-between p-4">
        {/* Top Section - Price Badge */}
        <View className="flex-row justify-between items-start">
          <View 
            className="px-4 py-2 rounded-full"
            style={{ 
              backgroundColor: 'rgba(153, 69, 255, 0.9)',
              shadowColor: '#9945FF',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text style={{ fontFamily: 'Bangers' }} className="text-white">{price} SOL</Text>
          </View>
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
                <Ionicons name="heart" size={16} color="#FF4444" />
                <Text className="text-white text-sm ml-2" style={{ fontFamily: 'Bangers' }}>Health</Text>
              </View>
              <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl">{fighter.maxHealth}</Text>
            </View>
            
            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center flex-1">
                <Ionicons name="flash" size={16} color="#FF6B6B" />
                <Text className="text-white text-sm ml-2" style={{ fontFamily: 'Bangers' }}>Attack</Text>
              </View>
              <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl">{fighter.attack}</Text>
            </View>
            
            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center flex-1">
                <Ionicons name="shield" size={16} color="#4ECDC4" />
                <Text className="text-white text-sm ml-2" style={{ fontFamily: 'Bangers' }}>Defense</Text>
              </View>
              <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl">{fighter.defense}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <View className="flex-row items-center flex-1">
                <Ionicons name="speedometer" size={16} color="#14F195" />
                <Text className="text-white text-sm ml-2" style={{ fontFamily: 'Bangers' }}>Speed</Text>
              </View>
              <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl">{fighter.speed}</Text>
            </View>
          </View>
          
          {/* Purchase Button */}
          <TouchableOpacity
            className="rounded-xl p-4"
            style={{ 
              backgroundColor: isOwned ? '#888888' : '#14F195',
            }}
            onPress={() => !isOwned && onPurchase(shopFighter)}
            disabled={purchasing || isOwned}
          >
            <Text 
              style={{ fontFamily: 'Bangers' }} 
              className="text-black text-center  text-lg"
            >
              {isOwned ? 'OWNED' : purchasing ? 'PURCHASING...' : 'PURCHASE'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function ShopScreen() {
  const wallet = useWallet();
  const { showToast } = useToast();
  const [purchasing, setPurchasing] = useState(false);
  const [shopFighters, setShopFighters] = useState<ShopFighter[]>([]);
  const [ownedFighters, setOwnedFighters] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'packs' | 'cards'>('packs');
  const [showPackPreview, setShowPackPreview] = useState<string | null>(null);

  const anchorService = new AnchorService('https://api.devnet.solana.com');

  useEffect(() => {
    // Load all fighters from centralized data
    const allFighters: ShopFighter[] = [];
    const allFighterTemplates = getAllShopFighters();
    
    allFighterTemplates.forEach(fighter => {
      const template = ALL_FIGHTERS.find(f => f.name === fighter.name);
      if (template) {
        allFighters.push({
          fighter,
          price: template.price,
          owned: template.isFree, // Free fighters are automatically owned
        });
      }
    });
    
    setShopFighters(allFighters);
    
    // Load owned fighters from blockchain
    const loadOwnedFighters = async () => {
      if (wallet.connected && wallet.publicKey) {
        try {
          const owned = await anchorService.getOwnedFighters(wallet.publicKey);
          const ownedSet = new Set<string>(owned);
          
          // Add free fighters
          allFighters.filter(sf => sf.price === 0).forEach(sf => ownedSet.add(sf.fighter.name));
          
          setOwnedFighters(ownedSet);
          console.log('Owned fighters loaded from blockchain:', Array.from(ownedSet));
        } catch (error) {
          console.error('Error loading owned fighters:', error);
          // Fallback: just mark free fighters as owned
          const owned = new Set<string>();
          allFighters.filter(sf => sf.price === 0).forEach(sf => owned.add(sf.fighter.name));
          setOwnedFighters(owned);
        }
      }
    };
    
    loadOwnedFighters();
  }, [wallet.connected, wallet.publicKey]);

  const handlePurchaseFighter = async (shopFighter: ShopFighter) => {
    if (!wallet.connected || !wallet.publicKey) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    if (shopFighter.owned || ownedFighters.has(shopFighter.fighter.name)) {
      showToast('You already own this fighter', 'info');
      return;
    }

    setPurchasing(true);
    
    try {
      // Purchase fighter through Anchor service
      const signature = await anchorService.purchaseFighter(
        wallet.publicKey,
        shopFighter.fighter.name,
        shopFighter.price,
        wallet.authToken
      );
      
      if (signature !== 'free-fighter') {
        showToast(`Transaction confirmed: ${signature.slice(0, 8)}...`, 'success');
      }
      
      // Mark as owned
      setOwnedFighters(prev => new Set(prev).add(shopFighter.fighter.name));
      showToast(`${shopFighter.fighter.name} added to your collection!`, 'success');
    } catch (error: any) {
      console.error('Purchase error:', error);
      if (error.message?.includes('User rejected') || error.message?.includes('cancelled')) {
        showToast('Purchase cancelled', 'info');
      } else {
        showToast(error.message || 'Purchase failed. Please try again', 'error');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handlePurchase = async (pack: FighterPack) => {
    if (!wallet.connected) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    setPurchasing(true);
    
    try {
      // TODO: Implement actual Solana transaction
      // const transaction = await createPurchaseTransaction(pack);
      // const signature = await wallet.sendTransaction(transaction);
      
      // Simulate purchase
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast(`You received ${pack.fighterCount} new fighters!`, 'success');
    } catch (error) {
      showToast('Purchase failed. Please try again', 'error');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0a0a1a]">
      <View className="p-6 pb-4">
        <Text style={{ fontFamily: 'Bangers' }} className="text-3xl  text-white mb-2">Fighter Shop</Text>
        <Text style={{ fontFamily: 'Bangers' }} className="text-[#888] mb-6">Purchase fighter cards to expand your roster</Text>

        {/* Tab Selector */}
        <View className="flex-row mb-6 bg-[#1a1a2e] rounded-xl p-1">
          <TouchableOpacity
            className="flex-1 py-3 rounded-lg"
            style={{
              backgroundColor: activeTab === 'packs' ? '#9945FF' : 'transparent',
            }}
            onPress={() => setActiveTab('packs')}
          >
            <Text 
              style={{ fontFamily: 'Bangers' }}
              className={`text-center text-lg ${activeTab === 'packs' ? 'text-white' : 'text-[#888]'}`}
            >
              FIGHTER PACKS
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-1 py-3 rounded-lg"
            style={{
              backgroundColor: activeTab === 'cards' ? '#9945FF' : 'transparent',
            }}
            onPress={() => setActiveTab('cards')}
          >
            <Text 
              style={{ fontFamily: 'Bangers' }}
              className={`text-center text-lg ${activeTab === 'cards' ? 'text-white' : 'text-[#888]'}`}
            >
              INDIVIDUAL CARDS
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {activeTab === 'cards' ? (
          /* Individual Fighter Cards */
          <View className="px-6 pb-6">
            <View className="items-center">
              {shopFighters.map((shopFighter, index) => (
                <FighterCard
                  key={`${shopFighter.fighter.name}-${shopFighter.fighter.rarity}-${index}`}
                  shopFighter={shopFighter}
                  onPurchase={handlePurchaseFighter}
                  purchasing={purchasing}
                  isOwned={ownedFighters.has(shopFighter.fighter.name)}
                />
              ))}
            </View>
          </View>
        ) : (
          /* Fighter Packs */
          <View className="px-6 pb-6">
            {FIGHTER_PACKS.map((pack) => (
              <View
                key={pack.id}
                className="bg-[#1a1a2e] rounded-xl p-6 mb-4 border border-[#2a2a3e]"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl ">{pack.name}</Text>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-[#888] mt-1">{pack.description}</Text>
                  </View>
                  <Ionicons name="people" size={48} color={COLORS.primary} />
                </View>

                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <Ionicons name="person" size={20} color="#888" />
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white ml-2">{pack.fighterCount} fighters</Text>
                  </View>
                  
                  <View className="bg-[#9945FF] rounded-full px-4 py-2">
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white ">{pack.price} SOL</Text>
                  </View>
                </View>

                {/* View Cards Button */}
                <TouchableOpacity
                  className="bg-[#2a2a3e] rounded-xl p-3 mb-3 flex-row items-center justify-center"
                  onPress={() => setShowPackPreview(showPackPreview === pack.id ? null : pack.id)}
                >
                  <Ionicons 
                    name={showPackPreview === pack.id ? "chevron-up" : "grid-outline"} 
                    size={20} 
                    color="#14F195" 
                  />
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#14F195] ml-2 text-base">
                    {showPackPreview === pack.id ? 'HIDE-DETAILS' : 'VIEW-DETAILS'}
                  </Text>
                </TouchableOpacity>

                {/* Pack Preview */}
                {showPackPreview === pack.id && (
                  <View className="bg-[#0a0a1a] rounded-xl p-4 mb-3">
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg mb-3">
                      Possible Cards in this Pack:
                    </Text>
                    <View className="space-y-2">
                      <View className="flex-row items-center mb-2">
                        <View className="w-3 h-3 rounded-full bg-[#888888] mr-2" />
                        <Text style={{ fontFamily: 'Bangers' }} className="text-[#888888]">
                          Common fighters (60% chance)
                        </Text>
                      </View>
                      {pack.guaranteedRarity !== 'common' && (
                        <View className="flex-row items-center mb-2">
                          <View className="w-3 h-3 rounded-full bg-[#4ECDC4] mr-2" />
                          <Text style={{ fontFamily: 'Bangers' }} className="text-[#4ECDC4]">
                            Rare fighters (25% chance)
                          </Text>
                        </View>
                      )}
                      {(pack.guaranteedRarity === 'epic' || pack.guaranteedRarity === 'legendary') && (
                        <View className="flex-row items-center mb-2">
                          <View className="w-3 h-3 rounded-full bg-[#9945FF] mr-2" />
                          <Text style={{ fontFamily: 'Bangers' }} className="text-[#9945FF]">
                            Epic fighters (12% chance)
                          </Text>
                        </View>
                      )}
                      {pack.guaranteedRarity === 'legendary' && (
                        <View className="flex-row items-center mb-2">
                          <View className="w-3 h-3 rounded-full bg-[#FFD700] mr-2" />
                          <Text style={{ fontFamily: 'Bangers' }} className="text-[#FFD700]">
                            Legendary fighters (3% chance)
                          </Text>
                        </View>
                      )}
                      <View className="mt-3 pt-3 border-t border-[#2a2a3e]">
                        <Text style={{ fontFamily: 'Bangers' }} className="text-[#14F195] text-sm">
                          ✓ Guaranteed {pack.guaranteedRarity} or better
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  className="bg-[#14F195] rounded-xl p-4"
                  onPress={() => handlePurchase(pack)}
                  disabled={purchasing}
                >
                  <Text style={{ fontFamily: 'Bangers' }} className="text-black text-center  text-lg">
                    {purchasing ? 'Processing...' : 'Purchase Pack'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Info Section */}
            <View className="bg-[#1a1a2e] rounded-xl p-6 border border-[#2a2a3e] mt-4">
              <View className="flex-row items-center mb-4">
                <Ionicons name="information-circle" size={24} color={COLORS.primary} />
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl  ml-2">SHOP-INFO:</Text>
              </View>

              <View className="mb-3">
                <View className="flex-row items-start mb-2">
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#fff] ml-2 flex-1">
                    Purchase packs for random fighters or buy individual cards
                  </Text>
                </View>
                
                <View className="flex-row items-start mb-2">
                  <Ionicons  name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#fff] ml-2 flex-1">
                    Higher tier packs guarantee better rarities
                  </Text>
                </View>
                
                <View className="flex-row items-start mb-2">
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#fff] ml-2 flex-1">
                    All purchases are on-chain and verifiable
                  </Text>
                </View>
                
                <View className="flex-row items-start">
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#fff] ml-2 flex-1">
                    Cards are NFTs that you truly own
                  </Text>
                </View>
              </View>
            </View>

            {/* Rarity Guide */}
            <View className="bg-[#1a1a2e] rounded-xl p-6 border border-[#2a2a3e] mt-4 mb-6">
              
              <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl  mb-4">Rarity-Guide:</Text>
              
              <View className="space-y-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#fff]">Common</Text>
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#fff]">0.01 SOL</Text>
                </View>
                
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#4ECDC4]">Rare</Text>
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#4ECDC4]">0.03 SOL</Text>
                </View>
                
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#9945FF]">Epic</Text>
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#9945FF]">0.08 SOL</Text>
                </View>
                
                <View className="flex-row items-center justify-between">
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#FFD700]">Legendary</Text>
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#FFD700]">0.2 SOL</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
