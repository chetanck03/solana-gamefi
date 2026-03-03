// Core Types for Battle Cards Game

export interface PlayerProfile {
  publicKey: string;
  username: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  badges: Badge[];
  deck: Card[];
  createdAt: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl: string;
  mintAddress?: string;
  earnedAt: number;
}

export interface Fighter {
  id: string;
  name: string;
  type: FighterType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  specialMove: SpecialMove;
  imageUrl: string;
  mintAddress?: string;
}

export type FighterType = 'warrior' | 'mage' | 'archer' | 'tank' | 'assassin';

export interface SpecialMove {
  name: string;
  description: string;
  damage: number;
  cooldown: number;
  energyCost: number;
}

// Keep Card for backward compatibility
export interface Card extends Fighter {}
export type CardType = FighterType;
export interface CardAbility extends SpecialMove {
  effect: 'damage' | 'heal' | 'shield' | 'buff' | 'debuff';
  value: number;
}

export interface Match {
  id: string;
  player1: PlayerInMatch;
  player2: PlayerInMatch;
  gameMode: GameMode;
  entryFee: number;
  status: MatchStatus;
  winner?: string;
  currentTurn: string;
  turnNumber: number;
  startTime: number;
  endTime?: number;
}

export interface PlayerInMatch {
  publicKey: string;
  username: string;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  fighter: Fighter;
  specialCooldown: number;
  combo: number;
  isBlocking: boolean;
  // Legacy card fields for backward compatibility
  mana?: number;
  deck?: Card[];
  hand?: Card[];
  field?: Card[];
  graveyard?: Card[];
}

export type GameMode = 'quick' | 'ranked' | 'tournament';
export type MatchStatus = 'waiting' | 'active' | 'completed' | 'cancelled';

export interface MatchResult {
  matchId: string;
  winner: string;
  loser: string;
  xpEarned: number;
  solEarned?: number;
  cardsWon?: Card[];
  signature: string;
}

export interface LeaderboardEntry {
  rank: number;
  publicKey: string;
  username: string;
  xp: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
}
