import { Fighter, FighterType } from '../types';
import { ALL_FIGHTERS, getFreeFighters, getPurchasableFighters, getFighterByName } from '../data/fighters';

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

// Convert fighter template to Fighter instance
export const createFighterFromTemplate = (template: typeof ALL_FIGHTERS[0]): Fighter => {
  return {
    id: `fighter-${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    name: template.name,
    type: template.type,
    rarity: template.rarity,
    maxHealth: template.maxHealth,
    attack: template.attack,
    defense: template.defense,
    speed: template.speed,
    specialMove: template.specialMove,
    imageUrl: CHARACTER_IMAGES[template.name as keyof typeof CHARACTER_IMAGES],
  };
};

// Get all available fighters for shop
export const getAllShopFighters = (): Fighter[] => {
  return ALL_FIGHTERS.map(template => createFighterFromTemplate(template));
};

// Get the 6 free starter fighters
export const generateStarterFighters = (): Fighter[] => {
  const freeTemplates = getFreeFighters();
  return freeTemplates.map(template => createFighterFromTemplate(template));
};

// Get a random fighter for AI opponents (weighted by rarity)
export const generateRandomFighter = (): Fighter => {
  const rand = Math.random();
  let rarity: 'common' | 'rare' | 'epic' | 'legendary';
  
  if (rand < 0.5) rarity = 'common';
  else if (rand < 0.8) rarity = 'rare';
  else if (rand < 0.95) rarity = 'epic';
  else rarity = 'legendary';
  
  const fightersOfRarity = ALL_FIGHTERS.filter(f => f.rarity === rarity);
  const template = fightersOfRarity[Math.floor(Math.random() * fightersOfRarity.length)];
  
  return createFighterFromTemplate(template);
};

// Get fighter by name
export const getFighterByNameFromService = (name: string): Fighter | null => {
  const template = getFighterByName(name);
  return template ? createFighterFromTemplate(template) : null;
};
