import { Card, CardType } from '../types';

// Card templates for generating cards
const CARD_TEMPLATES = {
  warrior: [
    { name: 'Blade Warrior', attack: 5, defense: 3, health: 8, mana: 3 },
    { name: 'Battle Champion', attack: 7, defense: 4, health: 10, mana: 5 },
    { name: 'Sword Master', attack: 6, defense: 5, health: 9, mana: 4 },
    { name: 'Berserker', attack: 9, defense: 2, health: 7, mana: 5 },
  ],
  mage: [
    { name: 'Fire Mage', attack: 7, defense: 2, health: 6, mana: 4 },
    { name: 'Ice Wizard', attack: 6, defense: 3, health: 7, mana: 4 },
    { name: 'Arcane Sorcerer', attack: 8, defense: 2, health: 5, mana: 5 },
    { name: 'Lightning Caster', attack: 9, defense: 1, health: 5, mana: 6 },
  ],
  archer: [
    { name: 'Swift Archer', attack: 6, defense: 2, health: 6, mana: 3 },
    { name: 'Sniper', attack: 8, defense: 1, health: 5, mana: 4 },
    { name: 'Ranger', attack: 5, defense: 3, health: 7, mana: 3 },
    { name: 'Crossbow Expert', attack: 7, defense: 2, health: 6, mana: 4 },
  ],
  tank: [
    { name: 'Iron Guardian', attack: 3, defense: 8, health: 12, mana: 4 },
    { name: 'Stone Defender', attack: 4, defense: 7, health: 11, mana: 4 },
    { name: 'Shield Bearer', attack: 2, defense: 9, health: 13, mana: 5 },
    { name: 'Fortress Knight', attack: 5, defense: 6, health: 10, mana: 4 },
  ],
  assassin: [
    { name: 'Shadow Blade', attack: 8, defense: 2, health: 6, mana: 4 },
    { name: 'Night Stalker', attack: 9, defense: 1, health: 5, mana: 5 },
    { name: 'Silent Killer', attack: 7, defense: 3, health: 7, mana: 4 },
    { name: 'Poison Dagger', attack: 6, defense: 2, health: 6, mana: 3 },
  ],
};

export const generateCard = (
  type: CardType,
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
): Card => {
  const templates = CARD_TEMPLATES[type];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Rarity multipliers
  const multipliers = {
    common: 1,
    rare: 1.2,
    epic: 1.5,
    legendary: 2,
  };
  
  const mult = multipliers[rarity];
  
  return {
    id: `${type}-${Date.now()}-${Math.random()}`,
    name: template.name,
    type,
    rarity,
    attack: Math.floor(template.attack * mult),
    defense: Math.floor(template.defense * mult),
    health: Math.floor(template.health * mult),
    mana: template.mana,
    imageUrl: '',
  };
};

export const generateStarterDeck = (): Card[] => {
  const deck: Card[] = [];
  
  // 10 common cards
  for (let i = 0; i < 10; i++) {
    const types: CardType[] = ['warrior', 'mage', 'archer', 'tank', 'assassin'];
    const type = types[Math.floor(Math.random() * types.length)];
    deck.push(generateCard(type, 'common'));
  }
  
  // 5 rare cards
  for (let i = 0; i < 5; i++) {
    const types: CardType[] = ['warrior', 'mage', 'archer', 'tank', 'assassin'];
    const type = types[Math.floor(Math.random() * types.length)];
    deck.push(generateCard(type, 'rare'));
  }
  
  return deck;
};

export const drawCards = (deck: Card[], count: number): { drawn: Card[]; remaining: Card[] } => {
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  const drawn = shuffled.slice(0, count);
  const remaining = shuffled.slice(count);
  return { drawn, remaining };
};
