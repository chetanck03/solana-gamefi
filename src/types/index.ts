// Core Types for ClashGo

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
  badges: Badge[];
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

export interface Match {
  id: string;
  player1: string;
  player2: string;
  gameType: GameType;
  entryFee: number;
  status: MatchStatus;
  winner?: string;
  startTime: number;
  endTime?: number;
}

export type GameType = 'tap-speed' | 'reaction' | 'trivia';
export type MatchStatus = 'waiting' | 'active' | 'completed' | 'cancelled';

export interface MatchResult {
  matchId: string;
  winner: string;
  loser: string;
  xpEarned: number;
  solEarned?: number;
  signature: string;
}

export interface Prediction {
  id: string;
  player: string;
  predictionType: 'price' | 'trivia' | 'fee';
  prediction: string;
  stake: number;
  result?: boolean;
  xpEarned?: number;
  createdAt: number;
}

export interface MysteryBox {
  id: string;
  player: string;
  boxType: 'free' | 'premium';
  rewards: BoxReward[];
  claimedAt: number;
}

export interface BoxReward {
  type: 'xp' | 'badge' | 'streak-boost';
  value: number | Badge;
}

export interface LeaderboardEntry {
  rank: number;
  publicKey: string;
  username: string;
  xp: number;
  wins: number;
  streak: number;
}
