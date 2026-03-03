import { Fighter, FighterType } from '../types';

// Character image mapping
export const CHARACTER_IMAGES = {
  'Fire Mage': require('../../assets/characters/Fire-Mage.png'),
  'Frost Valkyrie': require('../../assets/characters/Frost-Valkyrie.png'),
  'Thunder Breaker': require('../../assets/characters/Thunder-Breaker.png'),
  'Crystal Blade': require('../../assets/characters/Crystal-Blade.png'),
  'Blood Rune Berserker': require('../../assets/characters/Blood-Rune-Berserker.png'),
  'Solar Guardian': require('../../assets/characters/Solar-Guardian.png'),
  'Wind Striker': require('../../assets/characters/Wind-Striker.png'),
  'Shadow Phantom': require('../../assets/characters/Shadow-Phantom.png'),
  'Earth Titan': require('../../assets/characters/Earth-Titan.png'),
  'Ocean Abyss Hunter': require('../../assets/characters/Ocean-Abyss-Hunter.png'),
  'Lunar Witch': require('../../assets/characters/Lunar-Witch.png'),
  'Cyber Pulse Agent': require('../../assets/characters/Cyber-Pulse-Agent.png'),
  'Mirage Trickster': require('../../assets/characters/Mirage-Trickster.png'),
  'Gravity Warlord': require('../../assets/characters/Gravity-Warlord.png'),
  'Toxic Reaper': require('../../assets/characters/Toxic-Reaper.png'),
  'Time Weaver': require('../../assets/characters/Time-Weaver.png'),
};

// Fighter templates for generating fighters
const FIGHTER_TEMPLATES = {
  warrior: [
    { 
      name: 'Crystal Blade', 
      maxHealth: 120, 
      attack: 25, 
      defense: 15, 
      speed: 18,
      specialMove: { name: 'Blade Storm', description: 'Unleash a flurry of sword strikes', damage: 45, cooldown: 5, energyCost: 30 }
    },
    { 
      name: 'Blood Rune Berserker', 
      maxHealth: 140, 
      attack: 30, 
      defense: 20, 
      speed: 15,
      specialMove: { name: 'Berserker Rage', description: 'Devastating power attack', damage: 60, cooldown: 6, energyCost: 40 }
    },
    { 
      name: 'Solar Guardian', 
      maxHealth: 130, 
      attack: 28, 
      defense: 18, 
      speed: 20,
      specialMove: { name: 'Solar Slash', description: 'Perfect sword technique', damage: 50, cooldown: 5, energyCost: 35 }
    },
  ],
  mage: [
    { 
      name: 'Fire Mage', 
      maxHealth: 90, 
      attack: 35, 
      defense: 10, 
      speed: 22,
      specialMove: { name: 'Fireball', description: 'Launch explosive fireball', damage: 55, cooldown: 4, energyCost: 35 }
    },
    { 
      name: 'Frost Valkyrie', 
      maxHealth: 95, 
      attack: 32, 
      defense: 12, 
      speed: 20,
      specialMove: { name: 'Ice Blast', description: 'Freeze and damage opponent', damage: 50, cooldown: 5, energyCost: 30 }
    },
    { 
      name: 'Thunder Breaker', 
      maxHealth: 85, 
      attack: 40, 
      defense: 8, 
      speed: 25,
      specialMove: { name: 'Thunder Strike', description: 'Call down lightning', damage: 65, cooldown: 6, energyCost: 45 }
    },
    { 
      name: 'Lunar Witch', 
      maxHealth: 88, 
      attack: 38, 
      defense: 9, 
      speed: 24,
      specialMove: { name: 'Moon Beam', description: 'Mystical lunar energy', damage: 60, cooldown: 5, energyCost: 40 }
    },
    { 
      name: 'Time Weaver', 
      maxHealth: 92, 
      attack: 36, 
      defense: 11, 
      speed: 23,
      specialMove: { name: 'Time Warp', description: 'Manipulate time itself', damage: 58, cooldown: 6, energyCost: 42 }
    },
  ],
  archer: [
    { 
      name: 'Wind Striker', 
      maxHealth: 100, 
      attack: 30, 
      defense: 12, 
      speed: 28,
      specialMove: { name: 'Arrow Rain', description: 'Multiple arrow barrage', damage: 48, cooldown: 4, energyCost: 30 }
    },
    { 
      name: 'Shadow Phantom', 
      maxHealth: 95, 
      attack: 35, 
      defense: 10, 
      speed: 25,
      specialMove: { name: 'Phantom Shot', description: 'Precise critical strike', damage: 70, cooldown: 7, energyCost: 40 }
    },
    { 
      name: 'Ocean Abyss Hunter', 
      maxHealth: 98, 
      attack: 33, 
      defense: 11, 
      speed: 27,
      specialMove: { name: 'Tidal Wave', description: 'Crushing water arrows', damage: 52, cooldown: 5, energyCost: 35 }
    },
  ],
  tank: [
    { 
      name: 'Earth Titan', 
      maxHealth: 180, 
      attack: 18, 
      defense: 30, 
      speed: 10,
      specialMove: { name: 'Earth Slam', description: 'Ground-shaking impact', damage: 40, cooldown: 5, energyCost: 30 }
    },
    { 
      name: 'Gravity Warlord', 
      maxHealth: 170, 
      attack: 20, 
      defense: 28, 
      speed: 12,
      specialMove: { name: 'Gravity Crush', description: 'Overwhelming force', damage: 45, cooldown: 5, energyCost: 32 }
    },
  ],
  assassin: [
    { 
      name: 'Mirage Trickster', 
      maxHealth: 105, 
      attack: 32, 
      defense: 14, 
      speed: 30,
      specialMove: { name: 'Shadow Strike', description: 'Deadly stealth attack', damage: 58, cooldown: 5, energyCost: 35 }
    },
    { 
      name: 'Toxic Reaper', 
      maxHealth: 100, 
      attack: 35, 
      defense: 12, 
      speed: 32,
      specialMove: { name: 'Poison Blade', description: 'Execute from shadows', damage: 75, cooldown: 8, energyCost: 50 }
    },
    { 
      name: 'Cyber Pulse Agent', 
      maxHealth: 108, 
      attack: 34, 
      defense: 13, 
      speed: 31,
      specialMove: { name: 'Digital Strike', description: 'High-tech assassination', damage: 68, cooldown: 6, energyCost: 45 }
    },
  ],
};

export const generateFighter = (
  type: FighterType,
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
): Fighter => {
  const templates = FIGHTER_TEMPLATES[type];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Rarity multipliers
  const multipliers = {
    common: 1,
    rare: 1.2,
    epic: 1.5,
    legendary: 2,
  };
  
  const multiplier = multipliers[rarity];
  
  return {
    id: `fighter-${Date.now()}-${Math.random()}`,
    name: template.name,
    type,
    rarity,
    maxHealth: Math.floor(template.maxHealth * multiplier),
    attack: Math.floor(template.attack * multiplier),
    defense: Math.floor(template.defense * multiplier),
    speed: Math.floor(template.speed * multiplier),
    specialMove: {
      ...template.specialMove,
      damage: Math.floor(template.specialMove.damage * multiplier),
    },
    imageUrl: CHARACTER_IMAGES[template.name as keyof typeof CHARACTER_IMAGES],
  };
};

export const generateStarterFighters = (): Fighter[] => {
  const fighters: Fighter[] = [];
  
  // Generate 3 common fighters
  const types: FighterType[] = ['warrior', 'mage', 'archer'];
  types.forEach(type => {
    fighters.push(generateFighter(type, 'common'));
  });
  
  // Generate 1 rare fighter
  fighters.push(generateFighter('tank', 'rare'));
  
  return fighters;
};

export const generateRandomFighter = (): Fighter => {
  const types: FighterType[] = ['warrior', 'mage', 'archer', 'tank', 'assassin'];
  const rarities: ('common' | 'rare' | 'epic' | 'legendary')[] = ['common', 'rare', 'epic', 'legendary'];
  
  // Weighted random rarity
  const rand = Math.random();
  let rarity: 'common' | 'rare' | 'epic' | 'legendary';
  if (rand < 0.6) rarity = 'common';
  else if (rand < 0.85) rarity = 'rare';
  else if (rand < 0.97) rarity = 'epic';
  else rarity = 'legendary';
  
  const type = types[Math.floor(Math.random() * types.length)];
  return generateFighter(type, rarity);
};
