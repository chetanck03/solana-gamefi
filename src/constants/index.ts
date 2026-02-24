// App Constants

export const COLORS = {
  background: '#0a0a1a',
  card: '#1a1a2e',
  border: '#2a2a3e',
  primary: '#9945FF',
  secondary: '#14F195',
  text: '#ffffff',
  textSecondary: '#888888',
  success: '#14F195',
  error: '#FF4444',
  warning: '#FFB800',
  warrior: '#FF6B6B',
  mage: '#4ECDC4',
  archer: '#95E1D3',
  tank: '#F38181',
  assassin: '#AA96DA',
};

export const XP_PER_LEVEL = 1000;
export const MATCH_DURATION = 300; // 5 minutes per match
export const TURN_DURATION = 30; // 30 seconds per turn
export const STARTING_HEALTH = 30;
export const STARTING_MANA = 3;
export const MAX_MANA = 10;
export const HAND_SIZE = 5;
export const MAX_FIELD_SIZE = 5;

export const STREAK_REWARDS = {
  7: { xp: 500, badge: '7-day-warrior' },
  30: { xp: 2000, badge: '30-day-legend' },
  100: { xp: 10000, badge: '100-day-master' },
};

export const GAME_MODES = {
  quick: {
    name: 'Quick Match',
    description: 'Fast-paced 1v1 battle',
    entryFee: 0,
    duration: 300,
  },
  ranked: {
    name: 'Ranked Match',
    description: 'Competitive ranked play',
    entryFee: 0.01,
    duration: 600,
  },
  tournament: {
    name: 'Tournament',
    description: 'Multi-player tournament',
    entryFee: 0.05,
    duration: 900,
  },
};

export const CARD_RARITIES = {
  common: { color: '#888888', dropRate: 0.6 },
  rare: { color: '#4ECDC4', dropRate: 0.25 },
  epic: { color: '#9945FF', dropRate: 0.12 },
  legendary: { color: '#FFD700', dropRate: 0.03 },
};
