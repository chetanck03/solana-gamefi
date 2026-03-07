import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GAME_MODES } from '../constants';
import { Match, Fighter, GameMode } from '../types';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { useFight } from '../context/FightContext';
import { generateStarterFighters, generateRandomFighter } from '../services/fighterService';
import { fightService } from '../services/fightService';
import { AnchorService } from '../services/anchorService';
import { ENV } from '../config/env';
import OptimizedImage from '../components/OptimizedImage';
import ActiveFightView from '../components/ActiveFightView';
import BattlefieldSelector from '../components/BattlefieldSelector';
import { LocalStatsService } from '../services/localStatsService';

export default function FightScreen() {
  const wallet = useWallet();
  const { showToast } = useToast();
  const { setIsInActiveFight } = useFight();
  const [isSearching, setIsSearching] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [selectedFighter, setSelectedFighter] = useState<Fighter | null>(null);
  const [playerFighters, setPlayerFighters] = useState<Fighter[]>([]);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [opponentAttacking, setOpponentAttacking] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [opponentHit, setOpponentHit] = useState(false);
  const [attackEffects, setAttackEffects] = useState<Array<{ id: string; type: 'light' | 'heavy' | 'special' | 'hit'; fromPlayer: boolean }>>([]);
  const [damageNumbers, setDamageNumbers] = useState<Array<{ id: string; damage: number; isPlayer: boolean; isCritical: boolean }>>([]);
  const [selectedBattlefield, setSelectedBattlefield] = useState<string>('Floating Sky');
  const [matchKeypair, setMatchKeypair] = useState<any>(null);

  const anchorService = new AnchorService(ENV.SOLANA_RPC_URL);

  useEffect(() => {
    if (wallet.connected && playerFighters.length === 0) {
      setPlayerFighters(generateStarterFighters());
    }
  }, [wallet.connected]);

  // Track active fight status for hiding tab bar
  useEffect(() => {
    if (match && match.status === 'active') {
      setIsInActiveFight(true);
    } else {
      setIsInActiveFight(false);
    }
  }, [match, setIsInActiveFight]);

  useEffect(() => {
    if (match && match.status === 'active') {
      const interval = setInterval(() => {
        setMatch(prevMatch => {
          if (!prevMatch) return null;
          const updated = fightService.regenerateEnergy(prevMatch, 100);
          return fightService.updateCooldowns(updated);
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [match?.status]);

  const startMatchmaking = async (mode: GameMode) => {
    if (!wallet.publicKey || !selectedFighter) {
      showToast('Please select a fighter first!', 'error');
      return;
    }
    
    const entryFee = GAME_MODES[mode].entryFee;
    
    setIsSearching(true);
    setBattleLog([]);
    
    try {
      // Create match on-chain if there's an entry fee
      if (entryFee > 0) {
        addLog(`Creating match with ${entryFee} SOL entry fee...`);
        const { matchKeypair: newMatchKeypair } = await anchorService.createMatch(
          wallet.publicKey,
          entryFee,
          mode,
          wallet.authToken
        );
        setMatchKeypair(newMatchKeypair);
        addLog('Match created on-chain!');
      }
      
      const newMatch = fightService.createFightMatch(
        wallet.publicKey.toString(),
        'Player',
        selectedFighter,
        mode,
        entryFee
      );
      
      // Simulate finding opponent
      setTimeout(() => {
        const opponentFighter = generateRandomFighter();
        const joinedMatch = fightService.joinFightMatch(
          newMatch,
          'opponent-ai',
          'AI Opponent',
          opponentFighter
        );
        setMatch(joinedMatch);
        setIsSearching(false);
        addLog('Fight started! Choose your move!');
      }, 2000);
    } catch (error: any) {
      console.error('Error starting match:', error);
      showToast(error.message || 'Failed to start match', 'error');
      setIsSearching(false);
    }
  };

  const addLog = (message: string) => {
    setBattleLog(prev => [...prev.slice(-4), message]);
  };

  const performAttack = (attackType: 'light' | 'heavy' | 'special') => {
    if (!match || !wallet.publicKey) return;
    
    // Trigger player attack animation
    setPlayerAttacking(true);
    setTimeout(() => setPlayerAttacking(false), 300);
    
    // Add attack effect
    const effectId = `effect-${Date.now()}`;
    setAttackEffects(prev => [...prev, { id: effectId, type: attackType, fromPlayer: true }]);
    
    setTimeout(() => {
      const result = fightService.performAttack(match, wallet.publicKey!.toString(), attackType);
      setMatch(result.match);
      addLog(result.message);
      
      if (result.damage > 0) {
        // Trigger opponent hit animation (opponent gets hit, not player)
        setOpponentHit(true);
        setTimeout(() => setOpponentHit(false), 300);
        
        // Add hit effect on opponent side
        const hitId = `hit-${Date.now()}`;
        setAttackEffects(prev => [...prev, { id: hitId, type: 'hit', fromPlayer: false }]);
        
        // Add damage number on opponent
        const damageId = `damage-${Date.now()}`;
        const isCritical = result.damage > result.match.player1.fighter.attack * 1.5;
        setDamageNumbers(prev => [...prev, { id: damageId, damage: result.damage, isPlayer: false, isCritical }]);
      }
      
      const winner = fightService.checkWinner(result.match);
      if (winner) {
        setTimeout(() => endMatch(winner), 1000);
        return;
      }
      
      setTimeout(() => performAIMove(), 1500);
    }, 300);
  };

  const performBlock = () => {
    if (!match || !wallet.publicKey) return;
    
    const updated = fightService.performBlock(match, wallet.publicKey.toString());
    setMatch(updated);
    addLog('You raise your guard!');
    
    setTimeout(() => performAIMove(), 1000);
  };

  const removeAttackEffect = (id: string) => {
    setAttackEffects(prev => prev.filter(effect => effect.id !== id));
  };

  const removeDamageNumber = (id: string) => {
    setDamageNumbers(prev => prev.filter(num => num.id !== id));
  };

  const performAIMove = () => {
    if (!match) return;
    
    const moves: ('light' | 'heavy' | 'special' | 'block')[] = ['light', 'light', 'heavy', 'special', 'block'];
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    
    if (randomMove === 'block') {
      const updated = fightService.performBlock(match, 'opponent-ai');
      setMatch(updated);
      addLog('Opponent blocks!');
    } else {
      // Trigger opponent attack animation
      setOpponentAttacking(true);
      setTimeout(() => setOpponentAttacking(false), 300);
      
      // Add attack effect
      const effectId = `effect-${Date.now()}`;
      setAttackEffects(prev => [...prev, { id: effectId, type: randomMove, fromPlayer: false }]);
      
      setTimeout(() => {
        const result = fightService.performAttack(match, 'opponent-ai', randomMove);
        setMatch(result.match);
        addLog(result.message);
        
        if (result.damage > 0) {
          // Trigger player hit animation (player gets hit, not opponent)
          setPlayerHit(true);
          setTimeout(() => setPlayerHit(false), 300);
          
          // Add hit effect on player side
          const hitId = `hit-${Date.now()}`;
          setAttackEffects(prev => [...prev, { id: hitId, type: 'hit', fromPlayer: true }]);
          
          // Add damage number on player
          const damageId = `damage-${Date.now()}`;
          const isCritical = result.damage > result.match.player2.fighter.attack * 1.5;
          setDamageNumbers(prev => [...prev, { id: damageId, damage: result.damage, isPlayer: true, isCritical }]);
        }
        
        const winner = fightService.checkWinner(result.match);
        if (winner) {
          setTimeout(() => endMatch(winner), 1000);
        }
      }, 300);
    }
  };

  const endMatch = async (winnerKey: string) => {
    const isPlayerWinner = winnerKey === wallet.publicKey?.toString();
    const isDraw = winnerKey === 'draw';
    
    // Record match result in local storage
    try {
      if (isDraw) {
        await LocalStatsService.recordMatchResult('draw');
      } else if (isPlayerWinner) {
        await LocalStatsService.recordMatchResult('win');
      } else {
        await LocalStatsService.recordMatchResult('loss');
      }
    } catch (error) {
      console.error('Error recording match result:', error);
    }
    
    addLog(isDraw ? '🤝 DRAW!' : isPlayerWinner ? '🎉 VICTORY!' : '💀 DEFEAT!');
    
    showToast(
      isDraw ? 'Match ended in a draw!' : isPlayerWinner ? 'You won!' : 'You lost!', 
      isDraw ? 'info' : isPlayerWinner ? 'success' : 'error'
    );
    
    setTimeout(() => {
      setMatch(null);
      setMatchKeypair(null);
    }, 3000);
  };

  const leaveMatch = () => {
    showToast('Left the match', 'info');
    setMatch(null);
    setMatchKeypair(null);
    setBattleLog([]);
  };

  if (!wallet.connected) {
    return (
      <View className="flex-1 bg-[#0a0a1a] items-center justify-center p-6">
        <Ionicons name="game-controller-outline" size={80} color={COLORS.textSecondary} />
        <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl mt-4 text-center">
          Connect Wallet to Fight
        </Text>
      </View>
    );
  }

  if (!match && !isSearching) {
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
      <ScrollView className="flex-1 bg-[#0a0a1a]" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Game Mode Selection - First */}
          <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl mb-3 text-center">
            CHOOSE GAME MODE
          </Text>
          
          {Object.entries(GAME_MODES)
            .filter(([key]) => key !== 'tournament') // Hide tournament mode
            .map(([key, mode]) => (
            <TouchableOpacity
              key={key}
              onPress={() => startMatchmaking(key as GameMode)}
              disabled={!selectedFighter}
              className={`bg-[#1a1a2e] rounded-xl p-4 mb-3 border-2 ${
                !selectedFighter ? 'border-[#2a2a3e] opacity-50' : 'border-[#2a2a3e]'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl">{mode.name}</Text>
                  <Text className="text-[#888888] text-sm">{mode.description}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-[#14F195] text-lg" style={{ fontFamily: 'Bangers' }}>{mode.entryFee} SOL</Text>
                  <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Battlefield Selection */}
          <BattlefieldSelector
            selectedBattlefield={selectedBattlefield}
            onSelect={setSelectedBattlefield}
          />
          
          {/* Fighter Selection - Second */}
          <Text style={{ fontFamily: 'Bangers' }} className="text-white text-3xl mt-4 mb-4 text-center">
            SELECT YOUR FIGHTER
          </Text>
          
          {/* Fighter Cards Grid */}
          <View className="flex-row flex-wrap justify-center">
            {playerFighters.map((fighter) => (
              <TouchableOpacity
                key={fighter.id}
                onPress={() => setSelectedFighter(fighter)}
                activeOpacity={0.8}
                className="w-[48%] m-1"
              >
                <View 
                  className="rounded-2xl overflow-hidden relative"
                  style={{ 
                    height: 240,
                    borderWidth: selectedFighter?.id === fighter.id ? 3 : 2,
                    borderColor: selectedFighter?.id === fighter.id ? '#14F195' : rarityColors[fighter.rarity],
                    shadowColor: selectedFighter?.id === fighter.id ? '#14F195' : rarityColors[fighter.rarity],
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.6,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  {/* Background Image */}
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
                              size={60} 
                              color={rarityColors[fighter.rarity]} 
                            />
                          </View>
                        }
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center bg-[#0a0a1a]">
                        <Ionicons 
                          name={typeIcons[fighter.type] as any} 
                          size={60} 
                          color={rarityColors[fighter.rarity]} 
                        />
                      </View>
                    )}
                    
                    {/* Gradient Overlay */}
                    <LinearGradient
                      colors={['transparent', 'rgba(10, 10, 26, 0.9)']}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 100,
                      }}
                    />
                  </View>
                  
                  {/* Selected Indicator */}
                  {selectedFighter?.id === fighter.id && (
                    <View className="absolute top-2 right-2 bg-[#14F195] rounded-full p-1">
                      <Ionicons name="checkmark" size={16} color="#0a0a1a" />
                    </View>
                  )}
                  
                  {/* Fighter Info */}
                  <View className="absolute bottom-0 left-0 right-0 p-3">
                    <Text 
                      style={{ 
                        fontFamily: 'Bangers',
                        textShadowColor: 'rgba(0, 0, 0, 0.8)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 3,
                      }} 
                      className="text-white text-lg text-center"
                      numberOfLines={1}
                    >
                      {fighter.name}
                    </Text>
                    <Text 
                      className="text-center text-xs uppercase tracking-wider mb-2"
                      style={{ 
                        color: '#4ECDC4',
                        fontFamily: 'Bangers',
                      }}
                    >
                      {fighter.type}
                    </Text>
                    
                    {/* Stats with Icons */}
                    <View className="space-y-1">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Ionicons name="heart" size={14} color="#FF4444" />
                          <Text className="text-white text-xs ml-1" style={{ fontFamily: 'Bangers' }}>Health</Text>
                        </View>
                        <Text className="text-white text-sm" style={{ fontFamily: 'Bangers' }}>{fighter.maxHealth}</Text>
                      </View>
                      
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Ionicons name="flash" size={14} color="#FF6B6B" />
                          <Text className="text-white text-xs ml-1" style={{ fontFamily: 'Bangers' }}>Attack</Text>
                        </View>
                        <Text className="text-white text-sm" style={{ fontFamily: 'Bangers' }}>{fighter.attack}</Text>
                      </View>
                      
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Ionicons name="shield" size={14} color="#4ECDC4" />
                          <Text className="text-white text-xs ml-1" style={{ fontFamily: 'Bangers' }}>Defense</Text>
                        </View>
                        <Text className="text-white text-sm" style={{ fontFamily: 'Bangers' }}>{fighter.defense}</Text>
                      </View>
                      
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Ionicons name="speedometer" size={14} color="#14F195" />
                          <Text className="text-white text-xs ml-1" style={{ fontFamily: 'Bangers' }}>Speed</Text>
                        </View>
                        <Text className="text-white text-sm" style={{ fontFamily: 'Bangers' }}>{fighter.speed}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  if (isSearching) {
    return (
      <View className="flex-1 bg-[#0a0a1a] items-center justify-center">
        <Ionicons name="search" size={60} color={COLORS.primary} />
        <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl mt-4">
          Finding-Opponent...
        </Text>
      </View>
    );
  }

  if (!match) return null;

  const isPlayerTurn = match.currentTurn === wallet.publicKey?.toString();

  return (
    <ActiveFightView
      match={match}
      isPlayerTurn={isPlayerTurn}
      playerAttacking={playerAttacking}
      opponentAttacking={opponentAttacking}
      playerHit={playerHit}
      opponentHit={opponentHit}
      battleLog={battleLog}
      attackEffects={attackEffects}
      damageNumbers={damageNumbers}
      selectedBattlefield={selectedBattlefield}
      onLightAttack={() => performAttack('light')}
      onHeavyAttack={() => performAttack('heavy')}
      onSpecialAttack={() => performAttack('special')}
      onBlock={performBlock}
      onLeaveMatch={leaveMatch}
      onRemoveAttackEffect={removeAttackEffect}
      onRemoveDamageNumber={removeDamageNumber}
    />
  );
}
