import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GAME_MODES, HAND_SIZE } from '../constants';
import { Match, Card, GameMode } from '../types';
import { useWallet } from '../context/WalletContext';
import { generateStarterDeck } from '../services/cardService';
import { GameService } from '../services/gameService';

const CardComponent = ({ 
  card, 
  onPress, 
  selected = false,
  disabled = false 
}: { 
  card: Card; 
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
}) => {
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
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`bg-[#1a1a2e] rounded-xl p-3 border-2 ${
        selected ? 'border-[#9945FF]' : 'border-[#2a2a3e]'
      } ${disabled ? 'opacity-50' : ''}`}
      style={{ width: 120, marginRight: 8 }}
    >
      <View className="items-center mb-2">
        <Ionicons name={typeIcons[card.type] as any} size={32} color={rarityColors[card.rarity]} />
      </View>
      
      <Text className="text-white font-bold text-sm text-center mb-1" numberOfLines={1}>
        {card.name}
      </Text>
      
      <View className="flex-row justify-between mb-1">
        <View className="flex-row items-center">
          <Ionicons name="flash" size={12} color="#FF6B6B" />
          <Text className="text-white text-xs ml-1">{card.attack}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="shield" size={12} color="#4ECDC4" />
          <Text className="text-white text-xs ml-1">{card.defense}</Text>
        </View>
      </View>
      
      <View className="flex-row justify-between">
        <View className="flex-row items-center">
          <Ionicons name="heart" size={12} color="#FF4444" />
          <Text className="text-white text-xs ml-1">{card.health}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="water" size={12} color="#14F195" />
          <Text className="text-white text-xs ml-1">{card.mana}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function BattleScreen() {
  const wallet = useWallet();
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);

  useEffect(() => {
    if (wallet.connected && playerDeck.length === 0) {
      // Generate starter deck for player
      setPlayerDeck(generateStarterDeck());
    }
  }, [wallet.connected]);

  const startMatchmaking = async (mode: GameMode) => {
    if (!wallet.publicKey) return;
    
    setGameMode(mode);
    setIsSearching(true);
    
    try {
      const gameService = new GameService('https://api.devnet.solana.com');
      const newMatch = await gameService.createMatch(
        wallet.publicKey.toBase58(),
        'Player1',
        playerDeck,
        mode,
        GAME_MODES[mode].entryFee
      );
      
      // Simulate finding opponent
      setTimeout(async () => {
        const opponentDeck = generateStarterDeck();
        const activeMatch = await gameService.joinMatch(
          newMatch,
          'AI_OPPONENT',
          'AI Player',
          opponentDeck
        );
        
        setMatch(activeMatch);
        setIsSearching(false);
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to create match');
      setIsSearching(false);
    }
  };

  const handlePlayCard = (card: Card) => {
    if (!match || match.currentTurn !== wallet.publicKey?.toBase58()) return;
    
    const player = match.player1.publicKey === wallet.publicKey?.toBase58() 
      ? match.player1 
      : match.player2;
    
    if (player.mana < card.mana) {
      Alert.alert('Not Enough Mana', `This card costs ${card.mana} mana`);
      return;
    }
    
    if (player.field.length >= 5) {
      Alert.alert('Field Full', 'You can only have 5 cards on the field');
      return;
    }
    
    setSelectedCard(card);
  };

  const handleAttack = (targetCard?: Card) => {
    if (!match || !selectedCard) return;
    
    const gameService = new GameService('https://api.devnet.solana.com');
    
    if (targetCard) {
      const updatedMatch = gameService.playCard(
        match,
        wallet.publicKey!.toBase58(),
        selectedCard.id,
        targetCard.id
      );
      setMatch(updatedMatch);
    } else {
      const updatedMatch = gameService.attackPlayer(
        match,
        wallet.publicKey!.toBase58(),
        selectedCard.id
      );
      setMatch(updatedMatch);
    }
    
    setSelectedCard(null);
  };

  const handleEndTurn = () => {
    if (!match) return;
    
    const gameService = new GameService('https://api.devnet.solana.com');
    const updatedMatch = gameService.endTurn(match);
    
    const winner = gameService.checkWinner(updatedMatch);
    if (winner) {
      Alert.alert(
        'Match Complete!',
        winner === wallet.publicKey?.toBase58() ? 'You Won!' : 'You Lost!',
        [{ text: 'OK', onPress: () => resetMatch() }]
      );
      return;
    }
    
    setMatch(updatedMatch);
    
    // AI turn simulation
    if (updatedMatch.currentTurn !== wallet.publicKey?.toBase58()) {
      setTimeout(() => {
        const aiMatch = gameService.endTurn(updatedMatch);
        setMatch(aiMatch);
      }, 1500);
    }
  };

  const resetMatch = () => {
    setGameMode(null);
    setMatch(null);
    setIsSearching(false);
    setSelectedCard(null);
  };

  if (!wallet.connected) {
    return (
      <View className="flex-1 bg-[#0a0a1a] items-center justify-center p-6">
        <Ionicons name="wallet" size={64} color={COLORS.primary} />
        <Text className="text-white text-xl font-bold mt-4">Connect Wallet</Text>
        <Text className="text-[#888] text-center mt-2">
          Connect your wallet to start battling
        </Text>
      </View>
    );
  }

  if (!gameMode) {
    return (
      <ScrollView className="flex-1 bg-[#0a0a1a] p-6">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-white mb-2">Choose Game Mode</Text>
          <Text className="text-[#888]">Select your battle type</Text>
        </View>

        {Object.entries(GAME_MODES).map(([key, mode]) => (
          <TouchableOpacity
            key={key}
            className="bg-[#1a1a2e] rounded-xl p-6 mb-4 border border-[#2a2a3e]"
            onPress={() => startMatchmaking(key as GameMode)}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-xl font-bold">{mode.name}</Text>
              {mode.entryFee > 0 && (
                <View className="bg-[#9945FF] rounded-full px-3 py-1">
                  <Text className="text-white font-bold">{mode.entryFee} SOL</Text>
                </View>
              )}
            </View>
            <Text className="text-[#888] mb-2">{mode.description}</Text>
            <View className="flex-row items-center">
              <Ionicons name="time" size={16} color="#888" />
              <Text className="text-[#888] ml-2">{mode.duration / 60} minutes</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  if (isSearching) {
    return (
      <View className="flex-1 bg-[#0a0a1a] items-center justify-center p-6">
        <Ionicons name="search" size={64} color={COLORS.primary} />
        <Text className="text-2xl font-bold text-white mt-4 mb-2">Finding Opponent...</Text>
        <Text className="text-[#888] text-center">This may take a few seconds</Text>
      </View>
    );
  }

  if (match) {
    const isPlayer1 = match.player1.publicKey === wallet.publicKey?.toBase58();
    const player = isPlayer1 ? match.player1 : match.player2;
    const opponent = isPlayer1 ? match.player2 : match.player1;
    const isMyTurn = match.currentTurn === wallet.publicKey?.toBase58();

    return (
      <View className="flex-1 bg-[#0a0a1a]">
        {/* Opponent Area */}
        <View className="bg-[#1a1a2e] p-4 border-b border-[#2a2a3e]">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white font-bold">{opponent.username}</Text>
            <View className="flex-row items-center">
              <Ionicons name="heart" size={16} color="#FF4444" />
              <Text className="text-white ml-1">{opponent.health}</Text>
              <Ionicons name="water" size={16} color="#14F195" className="ml-3" />
              <Text className="text-white ml-1">{opponent.mana}</Text>
            </View>
          </View>
          
          {/* Opponent Field */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {opponent.field.map((card) => (
              <CardComponent
                key={card.id}
                card={card}
                onPress={() => selectedCard && handleAttack(card)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Battle Info */}
        <View className="bg-[#0a0a1a] p-4 items-center">
          <Text className="text-[#888] text-sm">Turn {match.turnNumber}</Text>
          <Text className={`text-xl font-bold ${isMyTurn ? 'text-[#14F195]' : 'text-[#888]'}`}>
            {isMyTurn ? 'Your Turn' : "Opponent's Turn"}
          </Text>
        </View>

        {/* Player Area */}
        <View className="flex-1 bg-[#1a1a2e] p-4 border-t border-[#2a2a3e]">
          {/* Player Field */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {player.field.map((card) => (
              <CardComponent
                key={card.id}
                card={card}
                selected={selectedCard?.id === card.id}
                onPress={() => setSelectedCard(card)}
              />
            ))}
          </ScrollView>

          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white font-bold">{player.username}</Text>
            <View className="flex-row items-center">
              <Ionicons name="heart" size={16} color="#FF4444" />
              <Text className="text-white ml-1">{player.health}</Text>
              <Ionicons name="water" size={16} color="#14F195" className="ml-3" />
              <Text className="text-white ml-1">{player.mana}</Text>
            </View>
          </View>

          {/* Player Hand */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {player.hand.map((card) => (
              <CardComponent
                key={card.id}
                card={card}
                selected={selectedCard?.id === card.id}
                onPress={() => handlePlayCard(card)}
                disabled={!isMyTurn || player.mana < card.mana}
              />
            ))}
          </ScrollView>

          {/* Actions */}
          <View className="flex-row gap-2">
            {selectedCard && player.field.includes(selectedCard) && (
              <TouchableOpacity
                className="flex-1 bg-[#FF4444] rounded-xl p-4"
                onPress={() => handleAttack()}
              >
                <Text className="text-white text-center font-bold">Attack Player</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              className="flex-1 bg-[#9945FF] rounded-xl p-4"
              onPress={handleEndTurn}
              disabled={!isMyTurn}
            >
              <Text className="text-white text-center font-bold">End Turn</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return null;
}
