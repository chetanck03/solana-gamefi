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
};

export const XP_PER_LEVEL = 1000;
export const MATCH_DURATION = 60; // seconds
export const FREE_MYSTERY_BOX_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours
export const PREMIUM_BOX_COST = 0.01; // SOL

export const STREAK_REWARDS = {
  7: { xp: 500, badge: '7-day-warrior' },
  30: { xp: 2000, badge: '30-day-legend' },
  100: { xp: 10000, badge: '100-day-master' },
};

export const GAME_TYPES = {
  'tap-speed': {
    name: 'Tap Speed',
    description: 'Tap as fast as you can!',
    icon: '⚡',
  },
  'reaction': {
    name: 'Reaction Time',
    description: 'Test your reflexes',
    icon: '⏱️',
  },
  'trivia': {
    name: 'Web3 Trivia',
    description: 'Answer questions correctly',
    icon: '🧠',
  },
};
