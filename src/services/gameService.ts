import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Match, MatchResult, PlayerInMatch, Card } from '../types';
import { STARTING_HEALTH, STARTING_MANA, HAND_SIZE } from '../constants';
import { drawCards } from './cardService';

export class GameService {
  private connection: Connection;
  
  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }
  
  async createMatch(
    player1PublicKey: string,
    player1Username: string,
    player1Deck: Card[],
    gameMode: 'quick' | 'ranked' | 'tournament',
    entryFee: number
  ): Promise<Match> {
    const { drawn: player1Hand, remaining: player1DeckRemaining } = drawCards(player1Deck, HAND_SIZE);
    
    const match: Match = {
      id: `match-${Date.now()}-${Math.random()}`,
      player1: {
        publicKey: player1PublicKey,
        username: player1Username,
        health: STARTING_HEALTH,
        mana: STARTING_MANA,
        deck: player1DeckRemaining,
        hand: player1Hand,
        field: [],
        graveyard: [],
      },
      player2: {
        publicKey: '',
        username: 'Waiting...',
        health: STARTING_HEALTH,
        mana: STARTING_MANA,
        deck: [],
        hand: [],
        field: [],
        graveyard: [],
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
  
  async joinMatch(
    match: Match,
    player2PublicKey: string,
    player2Username: string,
    player2Deck: Card[]
  ): Promise<Match> {
    const { drawn: player2Hand, remaining: player2DeckRemaining } = drawCards(player2Deck, HAND_SIZE);
    
    return {
      ...match,
      player2: {
        publicKey: player2PublicKey,
        username: player2Username,
        health: STARTING_HEALTH,
        mana: STARTING_MANA,
        deck: player2DeckRemaining,
        hand: player2Hand,
        field: [],
        graveyard: [],
      },
      status: 'active',
    };
  }
  
  playCard(match: Match, playerKey: string, cardId: string, targetCardId?: string): Match {
    const isPlayer1 = playerKey === match.player1.publicKey;
    const player = isPlayer1 ? match.player1 : match.player2;
    const opponent = isPlayer1 ? match.player2 : match.player1;
    
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return match;
    
    const card = player.hand[cardIndex];
    
    // Check mana
    if (player.mana < card.mana) return match;
    
    // Remove card from hand and add to field
    player.hand.splice(cardIndex, 1);
    player.field.push(card);
    player.mana -= card.mana;
    
    // If attacking a target
    if (targetCardId) {
      const targetIndex = opponent.field.findIndex(c => c.id === targetCardId);
      if (targetIndex !== -1) {
        const target = opponent.field[targetIndex];
        target.health -= Math.max(0, card.attack - target.defense);
        
        // Remove dead cards
        if (target.health <= 0) {
          opponent.field.splice(targetIndex, 1);
          opponent.graveyard.push(target);
        }
      }
    }
    
    return match;
  }
  
  attackPlayer(match: Match, attackerKey: string, cardId: string): Match {
    const isPlayer1 = attackerKey === match.player1.publicKey;
    const attacker = isPlayer1 ? match.player1 : match.player2;
    const defender = isPlayer1 ? match.player2 : match.player1;
    
    const card = attacker.field.find(c => c.id === cardId);
    if (!card) return match;
    
    defender.health -= card.attack;
    
    return match;
  }
  
  endTurn(match: Match): Match {
    const nextPlayer = match.currentTurn === match.player1.publicKey 
      ? match.player2.publicKey 
      : match.player1.publicKey;
    
    const player = nextPlayer === match.player1.publicKey ? match.player1 : match.player2;
    
    // Draw a card
    if (player.deck.length > 0) {
      const drawnCard = player.deck.shift()!;
      player.hand.push(drawnCard);
    }
    
    // Restore mana
    player.mana = Math.min(player.mana + 1, 10);
    
    return {
      ...match,
      currentTurn: nextPlayer,
      turnNumber: match.turnNumber + 1,
    };
  }
  
  checkWinner(match: Match): string | null {
    if (match.player1.health <= 0) return match.player2.publicKey;
    if (match.player2.health <= 0) return match.player1.publicKey;
    return null;
  }
  
  async submitMatchResult(
    winner: PublicKey,
    loser: PublicKey,
    entryFee: number,
    payerKeypair: any
  ): Promise<string> {
    try {
      if (entryFee > 0) {
        const prizeAmount = entryFee * 2 * LAMPORTS_PER_SOL * 0.95; // 5% fee
        
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: payerKeypair.publicKey,
            toPubkey: winner,
            lamports: prizeAmount,
          })
        );
        
        const signature = await this.connection.sendTransaction(transaction, [payerKeypair]);
        await this.connection.confirmTransaction(signature);
        
        return signature;
      }
      
      return 'free-match';
    } catch (error) {
      console.error('Error submitting match result:', error);
      throw error;
    }
  }
}
