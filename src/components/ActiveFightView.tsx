import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Match } from '../types';
import FighterCharacter from './FighterCharacter';
import AttackEffect from './AttackEffect';
import ComboDisplay from './ComboDisplay';
import DamageNumber from './DamageNumber';
import OptimizedImage from './OptimizedImage';
import BattleAudio from './BattleAudio';
import ConfirmDialog from './ConfirmDialog';

interface HealthBarProps {
  current: number;
  max: number;
  color: string;
}

const HealthBar = ({ current, max, color }: HealthBarProps) => {
  const percentage = (current / max) * 100;
  
  return (
    <View className="w-full">
      <View className="w-full h-6 bg-[#1a1a2e]/80 rounded-full overflow-hidden border-2 border-[#FF4444]/40 shadow-lg relative">
        <View 
          className="h-full rounded-full relative"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: color,
          }}
        >
          {/* Shine effect */}
          <View className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        </View>
        {/* Health Label inside bar */}
        <Text 
          style={{ fontFamily: 'Bangers' }} 
          className="absolute left-3 top-0 bottom-0 text-white text-base leading-6 drop-shadow-lg"
        >
          HEALTH
        </Text>
        {/* Health Numbers */}
        <Text 
          style={{ fontFamily: 'Bangers' }} 
          className="absolute inset-0 text-center text-white text-sm leading-6 drop-shadow-lg"
        >
          {Math.floor(current)}/{max}
        </Text>
      </View>
    </View>
  );
};

interface EnergyBarProps {
  current: number;
  max: number;
}

const EnergyBar = ({ current, max }: EnergyBarProps) => {
  const percentage = (current / max) * 100;
  
  return (
    <View className="w-full">
      <View className="w-full h-6 bg-[#1a1a2e]/80 rounded-full overflow-hidden border-2 border-[#14F195]/40 shadow-lg relative">
        <View 
          className="h-full rounded-full relative" 
          style={{ width: `${percentage}%`, backgroundColor: '#14F195' }}
        >
          {/* Animated glow effect */}
          <View className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </View>
        {/* Energy Label inside bar */}
        <Text 
          style={{ fontFamily: 'Bangers' }} 
          className="absolute left-3 top-0 bottom-0 text-white text-base leading-6 drop-shadow-lg"
        >
          ENERGY
        </Text>
        {/* Energy Numbers */}
        <Text 
          style={{ fontFamily: 'Bangers' }} 
          className="absolute inset-0 text-center text-white text-sm leading-6 drop-shadow-lg"
        >
          {Math.floor(current)}/{max}
        </Text>
      </View>
    </View>
  );
};

interface FighterInfoProps {
  fighter: Match['player1']['fighter'];
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  isOpponent?: boolean;
}

const FighterInfo = ({ 
  fighter, 
  health, 
  maxHealth,
  energy,
  maxEnergy,
  isOpponent = false 
}: FighterInfoProps) => {
  return (
    <View className="items-center w-full">
      {/* Fighter Name with Glow */}
      <View className="bg-[#1a1a2e]/90 px-4 py-0.5 rounded-full border-2 border-[#14F195]/30 mb-1">
        <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg tracking-wider">
          {fighter.name}
        </Text>
      </View>
      
      <Text className="text-[#14F195] text-base uppercase tracking-widest " style={{ fontFamily: 'Bangers' }}>
        {fighter.type}
      </Text>
      
      {/* Health Bar */}
      <View className="w-full mb-1.5">
        <HealthBar current={health} max={maxHealth} color="#FF4444" />
      </View>
      
      {/* Energy Bar */}
      <View className="w-full mb-2">
        <EnergyBar current={energy} max={maxEnergy} />
      </View>
      
      {/* Stats Row */}
      <View className="flex-row justify-center gap-4">
        <View className="items-center bg-[#1a1a2e]/70 px-3 py-1.5 rounded-lg border border-[#FF6B6B]/30">
          <Ionicons name="flash" size={14} color="#FF6B6B" />
          <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xs mt-0.5">{fighter.attack}</Text>
        </View>
        <View className="items-center bg-[#1a1a2e]/70 px-3 py-1.5 rounded-lg border border-[#4ECDC4]/30">
          <Ionicons name="shield" size={14} color="#4ECDC4" />
          <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xs mt-0.5">{fighter.defense}</Text>
        </View>
        <View className="items-center bg-[#1a1a2e]/70 px-3 py-1.5 rounded-lg border border-[#14F195]/30">
          <Ionicons name="speedometer" size={14} color="#14F195" />
          <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xs mt-0.5">{fighter.speed}</Text>
        </View>
      </View>
    </View>
  );
};

interface ActiveFightViewProps {
  match: Match;
  isPlayerTurn: boolean;
  playerAttacking: boolean;
  opponentAttacking: boolean;
  playerHit: boolean;
  opponentHit: boolean;
  battleLog: string[];
  attackEffects: Array<{ id: string; type: 'light' | 'heavy' | 'special' | 'hit'; fromPlayer: boolean }>;
  damageNumbers: Array<{ id: string; damage: number; isPlayer: boolean; isCritical: boolean }>;
  selectedBattlefield?: string;
  onLightAttack: () => void;
  onHeavyAttack: () => void;
  onSpecialAttack: () => void;
  onBlock: () => void;
  onLeaveMatch: () => void;
  onRemoveAttackEffect: (id: string) => void;
  onRemoveDamageNumber: (id: string) => void;
}

// Battle icon mapping
const BATTLE_ICONS = {
  light: require('../../assets/battle-icons/Light-Attack-Icon.png'),
  heavy: require('../../assets/battle-icons/Heavy-Attack-Icon.png'),
  special: require('../../assets/battle-icons/Solar-Slash-Icon.png'),
  block: require('../../assets/battle-icons/Block-Icon.png'),
};

// Battlefield backgrounds
const BATTLEFIELDS = {
  'Ancient Colosseum': require('../../assets/battle-screen/Ancient-Colosseum-Arena.png'),
  'Dark Forest': require('../../assets/battle-screen/Dark-Forest-Arena.png'),
  'Desert War': require('../../assets/battle-screen/Desert-War-Battlefield.png'),
  'Floating Sky': require('../../assets/battle-screen/Floating-Sky.png'),
  'Frozen Ice': require('../../assets/battle-screen/Frozen-Ice-Arena.png'),
  'Ruined City': require('../../assets/battle-screen/Ruined-City-War-Zone.png'),
  'Storm Lightning': require('../../assets/battle-screen/Storm-Lightning-Battlefield.png'),
  'Volcanic Lava': require('../../assets/battle-screen/Volcanic-Lava-Arena.png'),
};

function ActiveFightView({
  match,
  isPlayerTurn,
  playerAttacking,
  opponentAttacking,
  playerHit,
  opponentHit,
  battleLog,
  attackEffects,
  damageNumbers,
  selectedBattlefield = 'Floating Sky',
  onLightAttack,
  onHeavyAttack,
  onSpecialAttack,
  onBlock,
  onLeaveMatch,
  onRemoveAttackEffect,
  onRemoveDamageNumber,
}: ActiveFightViewProps) {
  const player = match.player1;
  const opponent = match.player2;
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const battlefieldSource = BATTLEFIELDS[selectedBattlefield as keyof typeof BATTLEFIELDS] || BATTLEFIELDS['Floating Sky'];

  const handleLeaveMatch = () => {
    setShowLeaveDialog(false);
    onLeaveMatch();
  };

  return (
    <View className="flex-1">
      {/* Leave Match Confirmation Dialog */}
      <ConfirmDialog
        visible={showLeaveDialog}
        title="LEAVE-MATCH?"
        message="Are you sure you want to leave this battle? You will lose the match!"
        confirmText="YES, LEAVE"
        cancelText="NO, STAY"
        onConfirm={handleLeaveMatch}
        onCancel={() => setShowLeaveDialog(false)}
      />
      
    <View className="flex-1">
      {/* Battle Audio */}
      <BattleAudio 
        isPlaying={isMusicPlaying} 
        source={require('../../assets/battle-audio/clash-go.mp3')} 
      />
      
      {/* Full Screen Battlefield Background */}
      <ImageBackground
        source={battlefieldSource}
        className="flex-1 w-full h-full"
        resizeMode="cover"
      >
        {/* Dark overlay for better visibility */}
        <View className="absolute inset-0 bg-black/40" />
        
        {/* Top Controls */}
        <View className="absolute top-1 left-0 right-0 flex-row justify-between px-4 z-50">
          {/* Leave Match Button */}
          <TouchableOpacity
            onPress={() => setShowLeaveDialog(true)}
            className="w-11 h-11 rounded-full bg-[#1a1a2e]/90 justify-center items-center border-2 border-[#2a2a3e]/80"
            activeOpacity={0.7}
          >
            <Ionicons name="exit-outline" size={22} color="#FF4444" />
          </TouchableOpacity>
          
          {/* Music Toggle Button */}
          <TouchableOpacity
            onPress={() => setIsMusicPlaying(!isMusicPlaying)}
            className="w-11 h-11 rounded-full bg-[#1a1a2e]/90 justify-center items-center border-2 border-[#2a2a3e]/80"
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isMusicPlaying ? "volume-high" : "volume-mute"} 
              size={22} 
              color={isMusicPlaying ? "#14F195" : "#888888"} 
            />
          </TouchableOpacity>
        </View>

        {/* Opponent Info - Top Section */}
        <View className="absolute top-14 left-0 right-0 z-10 px-4">
          <FighterInfo
            fighter={opponent.fighter}
            health={opponent.health}
            maxHealth={opponent.maxHealth}
            energy={opponent.energy}
            maxEnergy={opponent.maxEnergy}
            isOpponent={true}
          />
        </View>
        
        {/* Fighting Arena */}
        <View className="flex-1 justify-center items-center relative pt-24 pb-36">
          {/* Arena Ground Line - Middle of screen */}
          {/* <View className="absolute left-0 right-0 items-center justify-center" style={{ top: '58%' }}>
            <View className="w-[100%] h-1 bg-[#14F195]/30" />
          </View> */}
          
          {/* Battle Log - Center of Battle */}
          <View className="absolute left-0 right-0 z-20 items-center justify-center" style={{ top: '55%' }}>
            <View className="bg-[#1a1a2e]/95 rounded-2xl py-3 px-6 border-2 border-[#14F195]/50 shadow-xl w-[85%] items-center justify-center">
              {battleLog.slice(-2).map((log, index) => (
                <Text key={index} style={{ fontFamily: 'Bangers' }} className="text-white text-center text-base">
                  {log}
                </Text>
              ))}
            </View>
          </View>
          
          {/* Opponent Character - Top half */}
          <View className="absolute z-10" style={{ top: '32%' }}>
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
          </View>
          
          {/* Opponent Combo Display - Positioned separately */}
          <View className="absolute z-20" style={{ top: '28%', right: 20 }}>
            <ComboDisplay combo={opponent.combo} isPlayer={false} />
          </View>
          
          {/* Player Character - Bottom half */}
          <View className="absolute z-10" style={{ bottom: '42%' }}>
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
          </View>
          
          {/* Player Combo Display - Positioned separately */}
          <View className="absolute z-20" style={{ bottom: '38%', left: 20 }}>
            <ComboDisplay combo={player.combo} isPlayer={true} />
          </View>
          
          {/* Attack Effects */}
          {attackEffects.map((effect) => (
            <AttackEffect
              key={effect.id}
              type={effect.type}
              fromPlayer={effect.fromPlayer}
              onComplete={() => onRemoveAttackEffect(effect.id)}
            />
          ))}
          
          {/* Damage Numbers */}
          {damageNumbers.map((dmg) => (
            <DamageNumber
              key={dmg.id}
              damage={dmg.damage}
              isPlayer={dmg.isPlayer}
              isCritical={dmg.isCritical}
              onComplete={() => onRemoveDamageNumber(dmg.id)}
            />
          ))}
        </View>
        
        {/* Player Info - Bottom Section */}
        <View className="absolute bottom-[110px] left-0 right-0 z-10 px-4 pb-2">
          <FighterInfo
            fighter={player.fighter}
            health={player.health}
            maxHealth={player.maxHealth}
            energy={player.energy}
            maxEnergy={player.maxEnergy}
          />
        </View>
        
        {/* Modern Action Buttons - Single Row with Large Icons */}
        <View className="absolute bottom-0 left-0 right-0 flex-row justify-around items-end px-2 py-2 bg-gradient-to-t from-black/60 to-transparent">
          {/* Light Attack */}
          <TouchableOpacity
            onPress={onLightAttack}
            disabled={!isPlayerTurn || player.energy < 10}
            className={`items-center justify-center ${
              (!isPlayerTurn || player.energy < 10) ? 'opacity-40' : 'opacity-100'
            }`}
            activeOpacity={0.7}
          >
            <View className="w-[60px] h-[60px] rounded-full justify-center items-center mb-1 shadow-lg shadow-[#14F195]" style={{ backgroundColor: 'rgba(20, 241, 149, 0.25)' }}>
              <OptimizedImage
                source={BATTLE_ICONS.light}
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
              />
            </View>
            <Text style={{ fontFamily: 'Bangers' }} className="text-white text-base text-center">
              LIGHT
            </Text>
            <Text style={{ fontFamily: 'Bangers' }} className="text-[#14F195] text-base text-center">
              10
            </Text>
          </TouchableOpacity>
          
          {/* Heavy Attack */}
          <TouchableOpacity
            onPress={onHeavyAttack}
            disabled={!isPlayerTurn || player.energy < 25}
            className={`items-center justify-center ${
              (!isPlayerTurn || player.energy < 25) ? 'opacity-40' : 'opacity-100'
            }`}
            activeOpacity={0.7}
          >
            <View className="w-[60px] h-[60px] rounded-full justify-center items-center mb-1 shadow-lg shadow-[#FFB800]" style={{ backgroundColor: 'rgba(255, 184, 0, 0.25)' }}>
              <OptimizedImage
                source={BATTLE_ICONS.heavy}
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
              />
            </View>
            <Text style={{ fontFamily: 'Bangers' }} className="text-white text-base text-center">
              HEAVY
            </Text>
            <Text style={{ fontFamily: 'Bangers' }} className="text-[#FFB800] text-base text-center">
              25
            </Text>
          </TouchableOpacity>
          
          {/* Special Attack */}
          <TouchableOpacity
            onPress={onSpecialAttack}
            disabled={!isPlayerTurn || player.energy < player.fighter.specialMove.energyCost || player.specialCooldown > 0}
            className={`items-center justify-center ${
              (!isPlayerTurn || player.energy < player.fighter.specialMove.energyCost || player.specialCooldown > 0) ? 'opacity-40' : 'opacity-100'
            }`}
            activeOpacity={0.7}
          >
            <View className="w-[60px] h-[60px] rounded-full justify-center items-center mb-1 shadow-lg shadow-[#9945FF]" style={{ backgroundColor: 'rgba(153, 69, 255, 0.25)' }}>
              <OptimizedImage
                source={BATTLE_ICONS.special}
                style={{ width: 100, height: 80 }}
                resizeMode="contain"
              />
            </View>
            <Text style={{ fontFamily: 'Bangers' }} className="text-white text-base text-center">
              SPECIAL
            </Text>
            <Text style={{ fontFamily: 'Bangers' }} className="text-[#9945FF] text-base text-center">
              {player.specialCooldown > 0 ? player.specialCooldown : player.fighter.specialMove.energyCost}
            </Text>
          </TouchableOpacity>
          
          {/* Block */}
          <TouchableOpacity
            onPress={onBlock}
            disabled={!isPlayerTurn}
            className={`items-center justify-center ${
              !isPlayerTurn ? 'opacity-40' : 'opacity-100'
            }`}
            activeOpacity={0.7}
          >
            <View className="w-[60px] h-[60px] rounded-full justify-center items-center mb-1 shadow-lg shadow-[#4ECDC4]" style={{ backgroundColor: 'rgba(78, 205, 196, 0.25)' }}>
              <OptimizedImage
                source={BATTLE_ICONS.block}
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
              />
            </View>
            <Text style={{ fontFamily: 'Bangers' }} className="text-white text-base text-center">
              BLOCK
            </Text>
            <Text style={{ fontFamily: 'Bangers' }} className="text-[#4ECDC4] text-base text-center">
              -
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
    </View>
  );
}

export default ActiveFightView;
