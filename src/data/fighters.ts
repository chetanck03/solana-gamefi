// Centralized Fighter Data Configuration
// All fighters with balanced stats and proper power levels

export interface FighterTemplate {
  name: string;
  type: 'warrior' | 'mage' | 'archer' | 'tank' | 'assassin';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  specialMove: {
    name: string;
    description: string;
    damage: number;
    cooldown: number;
    energyCost: number;
  };
  price: number; // SOL price
  isFree: boolean; // Only 2 fighters are free
}

// All fighters with differentiated power levels
export const ALL_FIGHTERS: FighterTemplate[] = [
  // FREE FIGHTERS (Only 2)
  {
    name: 'Crystal Blade',
    type: 'warrior',
    rarity: 'common',
    maxHealth: 100,
    attack: 20,
    defense: 12,
    speed: 15,
    specialMove: {
      name: 'Blade Storm',
      description: 'Unleash a flurry of sword strikes',
      damage: 35,
      cooldown: 5,
      energyCost: 30,
    },
    price: 0,
    isFree: true,
  },
  {
    name: 'Fire Mage',
    type: 'mage',
    rarity: 'common',
    maxHealth: 80,
    attack: 28,
    defense: 8,
    speed: 18,
    specialMove: {
      name: 'Fireball',
      description: 'Launch explosive fireball',
      damage: 45,
      cooldown: 4,
      energyCost: 35,
    },
    price: 0,
    isFree: true,
  },

  // COMMON FIGHTERS (Purchasable)
  {
    name: 'Wind Striker',
    type: 'archer',
    rarity: 'common',
    maxHealth: 90,
    attack: 24,
    defense: 10,
    speed: 22,
    specialMove: {
      name: 'Arrow Rain',
      description: 'Multiple arrow barrage',
      damage: 38,
      cooldown: 4,
      energyCost: 30,
    },
    price: 0.01,
    isFree: false,
  },
  {
    name: 'Shadow Phantom',
    type: 'assassin',
    rarity: 'common',
    maxHealth: 85,
    attack: 26,
    defense: 9,
    speed: 25,
    specialMove: {
      name: 'Phantom Shot',
      description: 'Precise critical strike',
      damage: 50,
      cooldown: 6,
      energyCost: 35,
    },
    price: 0.01,
    isFree: false,
  },

  // RARE FIGHTERS
  {
    name: 'Frost Valkyrie',
    type: 'mage',
    rarity: 'rare',
    maxHealth: 110,
    attack: 35,
    defense: 14,
    speed: 20,
    specialMove: {
      name: 'Ice Blast',
      description: 'Freeze and damage opponent',
      damage: 55,
      cooldown: 5,
      energyCost: 35,
    },
    price: 0.03,
    isFree: false,
  },
  {
    name: 'Blood Rune Berserker',
    type: 'warrior',
    rarity: 'rare',
    maxHealth: 130,
    attack: 32,
    defense: 18,
    speed: 14,
    specialMove: {
      name: 'Berserker Rage',
      description: 'Devastating power attack',
      damage: 60,
      cooldown: 6,
      energyCost: 40,
    },
    price: 0.03,
    isFree: false,
  },
  {
    name: 'Solar Guardian',
    type: 'warrior',
    rarity: 'rare',
    maxHealth: 120,
    attack: 30,
    defense: 16,
    speed: 17,
    specialMove: {
      name: 'Solar Slash',
      description: 'Perfect sword technique',
      damage: 52,
      cooldown: 5,
      energyCost: 35,
    },
    price: 0.03,
    isFree: false,
  },
  {
    name: 'Earth Titan',
    type: 'tank',
    rarity: 'rare',
    maxHealth: 160,
    attack: 22,
    defense: 28,
    speed: 10,
    specialMove: {
      name: 'Earth Slam',
      description: 'Ground-shaking impact',
      damage: 45,
      cooldown: 5,
      energyCost: 32,
    },
    price: 0.03,
    isFree: false,
  },

  // EPIC FIGHTERS
  {
    name: 'Thunder Breaker',
    type: 'mage',
    rarity: 'epic',
    maxHealth: 125,
    attack: 48,
    defense: 12,
    speed: 24,
    specialMove: {
      name: 'Thunder Strike',
      description: 'Call down lightning',
      damage: 75,
      cooldown: 6,
      energyCost: 45,
    },
    price: 0.05,
    isFree: false,
  },
  {
    name: 'Ocean Abyss Hunter',
    type: 'archer',
    rarity: 'epic',
    maxHealth: 135,
    attack: 42,
    defense: 16,
    speed: 26,
    specialMove: {
      name: 'Tidal Wave',
      description: 'Crushing water arrows',
      damage: 65,
      cooldown: 5,
      energyCost: 40,
    },
    price: 0.05,
    isFree: false,
  },
  {
    name: 'Mirage Trickster',
    type: 'assassin',
    rarity: 'epic',
    maxHealth: 115,
    attack: 45,
    defense: 14,
    speed: 30,
    specialMove: {
      name: 'Shadow Strike',
      description: 'Deadly stealth attack',
      damage: 70,
      cooldown: 5,
      energyCost: 38,
    },
    price: 0.05,
    isFree: false,
  },
  {
    name: 'Gravity Warlord',
    type: 'tank',
    rarity: 'epic',
    maxHealth: 180,
    attack: 28,
    defense: 32,
    speed: 12,
    specialMove: {
      name: 'Gravity Crush',
      description: 'Overwhelming force',
      damage: 55,
      cooldown: 5,
      energyCost: 35,
    },
    price: 0.05,
    isFree: false,
  },

  // LEGENDARY FIGHTERS
  {
    name: 'Lunar Witch',
    type: 'mage',
    rarity: 'legendary',
    maxHealth: 150,
    attack: 60,
    defense: 18,
    speed: 28,
    specialMove: {
      name: 'Moon Beam',
      description: 'Mystical lunar energy',
      damage: 95,
      cooldown: 6,
      energyCost: 50,
    },
    price: 0.1,
    isFree: false,
  },
  {
    name: 'Time Weaver',
    type: 'mage',
    rarity: 'legendary',
    maxHealth: 145,
    attack: 58,
    defense: 20,
    speed: 26,
    specialMove: {
      name: 'Time Warp',
      description: 'Manipulate time itself',
      damage: 90,
      cooldown: 6,
      energyCost: 48,
    },
    price: 0.1,
    isFree: false,
  },
  {
    name: 'Toxic Reaper',
    type: 'assassin',
    rarity: 'legendary',
    maxHealth: 130,
    attack: 55,
    defense: 16,
    speed: 35,
    specialMove: {
      name: 'Poison Blade',
      description: 'Execute from shadows',
      damage: 100,
      cooldown: 7,
      energyCost: 52,
    },
    price: 0.1,
    isFree: false,
  },
  {
    name: 'Cyber Pulse Agent',
    type: 'assassin',
    rarity: 'legendary',
    maxHealth: 135,
    attack: 52,
    defense: 18,
    speed: 32,
    specialMove: {
      name: 'Digital Strike',
      description: 'High-tech assassination',
      damage: 88,
      cooldown: 6,
      energyCost: 48,
    },
    price: 0.1,
    isFree: false,
  },
];

// Helper functions
export const getFreeFighters = (): FighterTemplate[] => {
  return ALL_FIGHTERS.filter(f => f.isFree);
};

export const getPurchasableFighters = (): FighterTemplate[] => {
  return ALL_FIGHTERS.filter(f => !f.isFree);
};

export const getFighterByName = (name: string): FighterTemplate | undefined => {
  return ALL_FIGHTERS.find(f => f.name === name);
};

export const getFightersByRarity = (rarity: 'common' | 'rare' | 'epic' | 'legendary'): FighterTemplate[] => {
  return ALL_FIGHTERS.filter(f => f.rarity === rarity);
};

export const getFightersByType = (type: 'warrior' | 'mage' | 'archer' | 'tank' | 'assassin'): FighterTemplate[] => {
  return ALL_FIGHTERS.filter(f => f.type === type);
};
