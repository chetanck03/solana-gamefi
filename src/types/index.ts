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

export interface Card {
  id: string;
  name: string;
  type: CardType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  attack: number;
  defense: number;
  health: number;
  mana: number;
  ability?: CardAbility;
  imageUrl: string;
  mintAddress?: string;
}

export type CardType = 'warrior' | 'mage' | 'archer' | 'tank' | 'assassin';

export interface CardAbility {
  name: string;
  description: string;
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
  mana: number;
  deck: Card[];
  hand: Card[];
  field: Card[];
  graveyard: Card[];
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
