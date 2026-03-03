import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GAME_MODES } from '../constants';
import { Match, Fighter, GameMode } from '../types';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { generateStarterFighters, generateRandomFighter } from '../services/fighterService';
import { fightService } from '../services/fightService';
import FighterCharacter from '../components/FighterCharacter';
import AttackEffect from '../components/AttackEffect';
import ComboDisplay from '../components/ComboDisplay';
import DamageNumber from '../components/DamageNumber';

const HealthBar = ({ current, max, color }: { current: number; max: number; color: string }) => {
  const percentage = (current / max) * 100;
  
  return (
    <View className="w-full h-6 bg-[#2a2a3e] rounded-full overflow-hidden border-2 border-[#3a3a4e]">
      <View 
        className="h-full rounded-full" 
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
      <Text 
        style={{ fontFamily: 'Bangers' }} 
        className="absolute inset-0 text-center text-white text-sm leading-6"
      >
        {Math.floor(current)}/{max}
      </Text>
    </View>
  );
};

const EnergyBar = ({ current, max }: { current: number; max: number }) => {
  const percentage = (current / max) * 100;
  
  return (
    <View className="w-full h-4 bg-[#2a2a3e] rounded-full overflow-hidden">
      <View 
        className="h-full rounded-full bg-[#14F195]" 
        style={{ width: `${percentage}%` }}
      />
    </View>
  );
};

const FighterInfo = ({ 
  fighter, 
  health, 
  maxHealth,
  energy,
  maxEnergy,
  isOpponent = false 
}: { 
  fighter: Fighter;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  isOpponent?: boolean;
}) => {
  return (
    <View className={`items-center ${isOpponent ? 'mb-2' : 'mt-2'}`}>
      <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl">{fighter.name}</Text>
      <Text className="text-[#888888] text-sm">{fighter.type.toUpperCase()}</Text>
      
      <View className="w-full px-4 mt-2">
        <HealthBar current={health} max={maxHealth} color="#FF4444" />
        <View className="mt-1">
          <EnergyBar current={energy} max={maxEnergy} />
        </View>
      </View>
      
      <View className="flex-row mt-2 space-x-4">
        <View className="items-center">
          <Ionicons name="flash" size={16} color="#FF6B6B" />
          <Text style={{ fontFamily: 'Bangers' }} className="text-white text-sm">{fighter.attack}</Text>
        </View>
        <View className="items-center">
          <Ionicons name="shield" size={16} color="#4ECDC4" />
          <Text style={{ fontFamily: 'Bangers' }} className="text-white text-sm">{fighter.defense}</Text>
        </View>
        <View className="items-center">
          <Ionicons name="speedometer" size={16} color="#14F195" />
          <Text style={{ fontFamily: 'Bangers' }} className="text-white text-sm">{fighter.speed}</Text>
        </View>
      </View>
    </View>
  );
};

export default function FightScreen() {
  const wallet = useWallet();
  const { showToast } = useToast();
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
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
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (wallet.connected && playerFighters.length === 0) {
      setPlayerFighters(generateStarterFighters());
    }
  }, [wallet.connected]);

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
    
    setGameMode(mode);
    setIsSearching(true);
    setBattleLog([]);
    
    const newMatch = fightService.createFightMatch(
      wallet.publicKey.toString(),
      'Player',
      selectedFighter,
      mode,
      GAME_MODES[mode].entryFee
    );
    
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
        // Trigger opponent hit animation
        setOpponentHit(true);
        setTimeout(() => setOpponentHit(false), 300);
        
        // Add hit effect
        const hitId = `hit-${Date.now()}`;
        setAttackEffects(prev => [...prev, { id: hitId, type: 'hit', fromPlayer: true }]);
        
        // Add damage number
        const damageId = `damage-${Date.now()}`;
        const isCritical = result.damage > player.fighter.attack * 1.5;
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
          // Trigger player hit animation
          setPlayerHit(true);
          setTimeout(() => setPlayerHit(false), 300);
          
          // Add hit effect
          const hitId = `hit-${Date.now()}`;
          setAttackEffects(prev => [...prev, { id: hitId, type: 'hit', fromPlayer: false }]);
          
          // Add damage number
          const damageId = `damage-${Date.now()}`;
          const isCritical = result.damage > opponent.fighter.attack * 1.5;
          setDamageNumbers(prev => [...prev, { id: damageId, damage: result.damage, isPlayer: true, isCritical }]);
        }
        
        const winner = fightService.checkWinner(result.match);
        if (winner) {
          setTimeout(() => endMatch(winner), 1000);
        }
      }, 300);
    }
  };

  const endMatch = (winnerKey: string) => {
    const isPlayerWinner = winnerKey === wallet.publicKey?.toString();
    addLog(isPlayerWinner ? '🎉 VICTORY!' : '💀 DEFEAT!');
    showToast(isPlayerWinner ? 'You won!' : 'You lost!', isPlayerWinner ? 'success' : 'error');
    
    setTimeout(() => {
      setMatch(null);
      setGameMode(null);
    }, 3000);
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
    return (
      <View className="flex-1 bg-[#0a0a1a] p-4">
        <Text style={{ fontFamily: 'Bangers' }} className="text-white text-3xl mb-4 text-center">
          SELECT YOUR FIGHTER
        </Text>
        
        <View className="flex-row flex-wrap justify-center mb-6">
          {playerFighters.map((fighter) => (
            <TouchableOpacity
              key={fighter.id}
              onPress={() => setSelectedFighter(fighter)}
              className={`m-2 p-4 rounded-xl border-2 ${
                selectedFighter?.id === fighter.id ? 'border-[#9945FF] bg-[#9945FF]/20' : 'border-[#2a2a3e] bg-[#1a1a2e]'
              }`}
              style={{ width: 160 }}
            >
              <View className="items-center">
                <Ionicons 
                  name={fighter.type === 'warrior' ? 'shield' : fighter.type === 'mage' ? 'flash' : fighter.type === 'archer' ? 'arrow-forward' : fighter.type === 'tank' ? 'cube' : 'eye'} 
                  size={48} 
                  color={COLORS.primary} 
                />
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg mt-2">{fighter.name}</Text>
                <Text className="text-[#888888] text-xs">{fighter.type}</Text>
                <View className="flex-row mt-2 space-x-2">
                  <Text className="text-white text-xs">❤️ {fighter.maxHealth}</Text>
                  <Text className="text-white text-xs">⚔️ {fighter.attack}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl mb-3 text-center">
          CHOOSE GAME MODE
        </Text>
        
        {Object.entries(GAME_MODES).map(([key, mode]) => (
          <TouchableOpacity
            key={key}
            onPress={() => startMatchmaking(key as GameMode)}
            disabled={!selectedFighter}
            className={`bg-[#1a1a2e] rounded-xl p-4 mb-3 border-2 border-[#2a2a3e] ${
              !selectedFighter ? 'opacity-50' : ''
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl">{mode.name}</Text>
                <Text className="text-[#888888] text-sm">{mode.description}</Text>
              </View>
              <View className="items-end">
                <Text className="text-[#14F195] text-lg font-bold">{mode.entryFee} SOL</Text>
                <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  if (isSearching) {
    return (
      <View className="flex-1 bg-[#0a0a1a] items-center justify-center">
        <Ionicons name="search" size={60} color={COLORS.primary} />
        <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl mt-4">
          Finding Opponent...
        </Text>
      </View>
    );
  }

  if (!match) return null;

  const player = match.player1;
  const opponent = match.player2;
  const isPlayerTurn = match.currentTurn === wallet.publicKey?.toString();

  return (
    <View className="flex-1 bg-[#0a0a1a]">
      {/* Opponent Info */}
      <FighterInfo
        fighter={opponent.fighter}
        health={opponent.health}
        maxHealth={opponent.maxHealth}
        energy={opponent.energy}
        maxEnergy={opponent.maxEnergy}
        isOpponent={true}
      />
      
      {/* Fighting Arena */}
      <View className="flex-1 justify-center items-center relative">
        {/* Arena Background */}
        <View className="absolute inset-0 items-center justify-center">
          <View className="w-full h-1 bg-[#2a2a3e]" style={{ position: 'absolute', bottom: '40%' }} />
        </View>
        
        {/* Opponent Character */}
        <View style={{ position: 'absolute', top: '20%' }}>
          <FighterCharacter
            type={opponent.fighter.type}
            isPlayer={false}
            isAttacking={opponentAttacking}
            isBlocking={opponent.isBlocking}
            isHit={opponentHit}
            isDead={opponent.health <= 0}
            rarity={opponent.fighter.rarity}
            imageUrl={opponent.fighter.imageUrl}
          />
          <ComboDisplay combo={opponent.combo} isPlayer={false} />
        </View>
        
        {/* Player Character */}
        <View style={{ position: 'absolute', bottom: '20%' }}>
          <FighterCharacter
            type={player.fighter.type}
            isPlayer={true}
            isAttacking={playerAttacking}
            isBlocking={player.isBlocking}
            isHit={playerHit}
            isDead={player.health <= 0}
            rarity={player.fighter.rarity}
            imageUrl={player.fighter.imageUrl}
          />
          <ComboDisplay combo={player.combo} isPlayer={true} />
        </View>
        
        {/* Attack Effects */}
        {attackEffects.map((effect) => (
          <AttackEffect
            key={effect.id}
            type={effect.type}
            fromPlayer={effect.fromPlayer}
            onComplete={() => removeAttackEffect(effect.id)}
          />
        ))}
        
        {/* Damage Numbers */}
        {damageNumbers.map((dmg) => (
          <DamageNumber
            key={dmg.id}
            damage={dmg.damage}
            isPlayer={dmg.isPlayer}
            isCritical={dmg.isCritical}
            onComplete={() => removeDamageNumber(dmg.id)}
          />
        ))}
        
        {/* Battle Log */}
        <View className="absolute bottom-4 left-4 right-4">
          <View className="bg-[#1a1a2e]/90 rounded-xl p-3 border-2 border-[#2a2a3e]">
            {battleLog.slice(-2).map((log, index) => (
              <Text key={index} style={{ fontFamily: 'Bangers' }} className="text-white text-center text-sm mb-1">
                {log}
              </Text>
            ))}
          </View>
        </View>
      </View>
      
      {/* Player Info */}
      <FighterInfo
        fighter={player.fighter}
        health={player.health}
        maxHealth={player.maxHealth}
        energy={player.energy}
        maxEnergy={player.maxEnergy}
      />
      
      {/* Action Buttons */}
      <View className="p-4">
        <View className="flex-row justify-between mb-3">
          <TouchableOpacity
            onPress={() => performAttack('light')}
            disabled={!isPlayerTurn || player.energy < 10}
            className={`flex-1 bg-[#14F195] rounded-xl p-4 mr-2 ${
              !isPlayerTurn || player.energy < 10 ? 'opacity-50' : ''
            }`}
          >
            <Text style={{ fontFamily: 'Bangers' }} className="text-[#0a0a1a] text-center text-lg">
              LIGHT ATTACK
            </Text>
            <Text className="text-[#0a0a1a] text-center text-xs">10 Energy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => performAttack('heavy')}
            disabled={!isPlayerTurn || player.energy < 25}
            className={`flex-1 bg-[#FFB800] rounded-xl p-4 ml-2 ${
              !isPlayerTurn || player.energy < 25 ? 'opacity-50' : ''
            }`}
          >
            <Text style={{ fontFamily: 'Bangers' }} className="text-[#0a0a1a] text-center text-lg">
              HEAVY ATTACK
            </Text>
            <Text className="text-[#0a0a1a] text-center text-xs">25 Energy</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={() => performAttack('special')}
            disabled={!isPlayerTurn || player.energy < player.fighter.specialMove.energyCost || player.specialCooldown > 0}
            className={`flex-1 bg-[#9945FF] rounded-xl p-4 mr-2 ${
              !isPlayerTurn || player.energy < player.fighter.specialMove.energyCost || player.specialCooldown > 0 ? 'opacity-50' : ''
            }`}
          >
            <Text style={{ fontFamily: 'Bangers' }} className="text-white text-center text-lg">
              {player.fighter.specialMove.name.toUpperCase()}
            </Text>
            <Text className="text-white text-center text-xs">
              {player.specialCooldown > 0 ? `Cooldown: ${player.specialCooldown}` : `${player.fighter.specialMove.energyCost} Energy`}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={performBlock}
            disabled={!isPlayerTurn}
            className={`flex-1 bg-[#4ECDC4] rounded-xl p-4 ml-2 ${
              !isPlayerTurn ? 'opacity-50' : ''
            }`}
          >
            <Text style={{ fontFamily: 'Bangers' }} className="text-[#0a0a1a] text-center text-lg">
              BLOCK
            </Text>
            <Text className="text-[#0a0a1a] text-center text-xs">Reduce Damage</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
