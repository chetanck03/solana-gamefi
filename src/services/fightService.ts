import { Match, PlayerInMatch, Fighter } from '../types';

const STARTING_HEALTH = 100;
const MAX_ENERGY = 100;
const ENERGY_REGEN_RATE = 10; // per second

export class FightService {
  
  createFightMatch(
    player1PublicKey: string,
    player1Username: string,
    player1Fighter: Fighter,
    gameMode: 'quick' | 'ranked' | 'tournament',
    entryFee: number
  ): Match {
    const match: Match = {
      id: `fight-${Date.now()}-${Math.random()}`,
      player1: {
        publicKey: player1PublicKey,
        username: player1Username,
        health: player1Fighter.maxHealth,
        maxHealth: player1Fighter.maxHealth,
        energy: 50,
        maxEnergy: MAX_ENERGY,
        fighter: player1Fighter,
        specialCooldown: 0,
        combo: 0,
        isBlocking: false,
      },
      player2: {
        publicKey: '',
        username: 'Waiting...',
        health: STARTING_HEALTH,
        maxHealth: STARTING_HEALTH,
        energy: 50,
        maxEnergy: MAX_ENERGY,
        fighter: {} as Fighter,
        specialCooldown: 0,
        combo: 0,
        isBlocking: false,
      },
      gameMode,
      entryFee,
      status: 'waiting',
      currentTurn: player1PublicKey,
      turnNumber: 1,
      startTime: Date.now(),
    };
    
    return match;
  }
  
  joinFightMatch(
    match: Match,
    player2PublicKey: string,
    player2Username: string,
    player2Fighter: Fighter
  ): Match {
    match.player2 = {
      publicKey: player2PublicKey,
      username: player2Username,
      health: player2Fighter.maxHealth,
      maxHealth: player2Fighter.maxHealth,
      energy: 50,
      maxEnergy: MAX_ENERGY,
      fighter: player2Fighter,
      specialCooldown: 0,
      combo: 0,
      isBlocking: false,
    };
    match.status = 'active';
    return match;
  }
  
  performAttack(
    match: Match,
    attackerKey: string,
    attackType: 'light' | 'heavy' | 'special'
  ): { match: Match; damage: number; message: string } {
    const isPlayer1 = attackerKey === match.player1.publicKey;
    const attacker = isPlayer1 ? match.player1 : match.player2;
    const defender = isPlayer1 ? match.player2 : match.player1;
    
    let damage = 0;
    let energyCost = 0;
    let message = '';
    
    switch (attackType) {
      case 'light':
        energyCost = 10;
        if (attacker.energy >= energyCost) {
          damage = Math.max(0, attacker.fighter.attack * 0.5 - defender.fighter.defense * 0.2);
          attacker.combo += 1;
          message = `${attacker.username} performs a light attack!`;
        }
        break;
        
      case 'heavy':
        energyCost = 25;
        if (attacker.energy >= energyCost) {
          damage = Math.max(0, attacker.fighter.attack * 1.2 - defender.fighter.defense * 0.3);
          attacker.combo = 0;
          message = `${attacker.username} unleashes a heavy attack!`;
        }
        break;
        
      case 'special':
        energyCost = attacker.fighter.specialMove.energyCost;
        if (attacker.energy >= energyCost && attacker.specialCooldown === 0) {
          damage = Math.max(0, attacker.fighter.specialMove.damage - defender.fighter.defense * 0.2);
          attacker.specialCooldown = attacker.fighter.specialMove.cooldown;
          attacker.combo = 0;
          message = `${attacker.username} uses ${attacker.fighter.specialMove.name}!`;
        } else {
          return { match, damage: 0, message: 'Special move not ready!' };
        }
        break;
    }
    
    if (attacker.energy < energyCost) {
      return { match, damage: 0, message: 'Not enough energy!' };
    }
    
    // Apply combo bonus
    if (attacker.combo > 2) {
      damage *= (1 + attacker.combo * 0.1);
      message += ` ${attacker.combo}x COMBO!`;
    }
    
    // Check if defender is blocking
    if (defender.isBlocking) {
      damage *= 0.3;
      message += ' (Blocked!)';
      defender.isBlocking = false;
    }
    
    // Apply damage
    defender.health = Math.max(0, defender.health - Math.floor(damage));
    attacker.energy = Math.max(0, attacker.energy - energyCost);
    
    return { match, damage: Math.floor(damage), message };
  }
  
  performBlock(match: Match, playerKey: string): Match {
    const isPlayer1 = playerKey === match.player1.publicKey;
    const player = isPlayer1 ? match.player1 : match.player2;
    
    player.isBlocking = true;
    player.combo = 0;
    
    return match;
  }
  
  updateCooldowns(match: Match): Match {
    if (match.player1.specialCooldown > 0) {
      match.player1.specialCooldown--;
    }
    if (match.player2.specialCooldown > 0) {
      match.player2.specialCooldown--;
    }
    return match;
  }
  
  regenerateEnergy(match: Match, deltaTime: number): Match {
    const regenAmount = (ENERGY_REGEN_RATE * deltaTime) / 1000;
    
    match.player1.energy = Math.min(match.player1.maxEnergy, match.player1.energy + regenAmount);
    match.player2.energy = Math.min(match.player2.maxEnergy, match.player2.energy + regenAmount);
    
    return match;
  }
  
  checkWinner(match: Match): string | null {
    if (match.player1.health <= 0) {
      return match.player2.publicKey;
    }
    if (match.player2.health <= 0) {
      return match.player1.publicKey;
    }
    return null;
  }
}

export const fightService = new FightService();
