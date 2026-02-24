import { Connection, PublicKey, SystemProgram, Keypair, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, Idl } from '@coral-xyz/anchor';
import idl from '../idl/battle_cards_game.json';

const PROGRAM_ID = new PublicKey('GhESwjzEv3C3qKQJKjAfhaq5GFK5vDLaku8tPqCKGzYR');

type BattleCardsProgram = Program<any>;

export class AnchorService {
  private connection: Connection;
  private programId: PublicKey;

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.programId = PROGRAM_ID;
  }

  getProgram(wallet: any): BattleCardsProgram {
    const provider = new AnchorProvider(
      this.connection,
      wallet,
      { commitment: 'confirmed' }
    );
    return new Program(idl as any, provider);
  }

  async getPlayerPDA(authority: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('player'), authority.toBuffer()],
      this.programId
    );
  }

  async initializePlayer(
    wallet: any,
    username: string
  ): Promise<string> {
    try {
      const program = this.getProgram(wallet);
      const [playerPDA] = await this.getPlayerPDA(wallet.publicKey);

      // Check if player already exists
      try {
        const playerAccount = await (program.account as any).player.fetch(playerPDA);
        if (playerAccount) {
          console.log('Player already initialized');
          return 'player-exists';
        }
      } catch (e) {
        // Player doesn't exist, continue with initialization
      }

      const tx = await (program.methods as any)
        .initializePlayer(username)
        .accounts({
          player: playerPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await this.connection.confirmTransaction(tx);
      console.log('Player initialized:', tx);
      return tx;
    } catch (error) {
      console.error('Error initializing player:', error);
      throw error;
    }
  }

  async createMatch(
    wallet: any,
    entryFee: number,
    gameMode: 'quick' | 'ranked' | 'tournament'
  ): Promise<{ signature: string; matchKeypair: Keypair }> {
    try {
      const program = this.getProgram(wallet);
      const matchKeypair = Keypair.generate();

      // Convert game mode to enum
      const gameModeEnum = gameMode === 'quick' 
        ? { quick: {} } 
        : gameMode === 'ranked' 
        ? { ranked: {} } 
        : { tournament: {} };

      const entryFeeLamports = new BN(entryFee * LAMPORTS_PER_SOL);

      const tx = await (program.methods as any)
        .createMatch(entryFeeLamports, gameModeEnum)
        .accounts({
          matchAccount: matchKeypair.publicKey,
          player1: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([matchKeypair])
        .rpc();

      await this.connection.confirmTransaction(tx);
      console.log('Match created:', tx);
      
      return {
        signature: tx,
        matchKeypair,
      };
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  }

  async joinMatch(
    wallet: any,
    matchPublicKey: PublicKey
  ): Promise<string> {
    try {
      const program = this.getProgram(wallet);

      const tx = await (program.methods as any)
        .joinMatch()
        .accounts({
          matchAccount: matchPublicKey,
          player2: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await this.connection.confirmTransaction(tx);
      console.log('Joined match:', tx);
      return tx;
    } catch (error) {
      console.error('Error joining match:', error);
      throw error;
    }
  }

  async completeMatch(
    wallet: any,
    matchPublicKey: PublicKey,
    player1PublicKey: PublicKey,
    player2PublicKey: PublicKey,
    winnerPublicKey: PublicKey
  ): Promise<string> {
    try {
      const program = this.getProgram(wallet);
      
      const [player1PDA] = await this.getPlayerPDA(player1PublicKey);
      const [player2PDA] = await this.getPlayerPDA(player2PublicKey);

      const tx = await (program.methods as any)
        .completeMatch(winnerPublicKey)
        .accounts({
          matchAccount: matchPublicKey,
          player1: player1PDA,
          player2: player2PDA,
        })
        .rpc();

      await this.connection.confirmTransaction(tx);
      console.log('Match completed:', tx);
      return tx;
    } catch (error) {
      console.error('Error completing match:', error);
      throw error;
    }
  }

  async getPlayerProfile(playerPublicKey: PublicKey): Promise<any> {
    try {
      const program = this.getProgram({ publicKey: playerPublicKey });
      const [playerPDA] = await this.getPlayerPDA(playerPublicKey);

      const playerAccount = await (program.account as any).player.fetch(playerPDA);
      
      return {
        publicKey: playerPublicKey.toBase58(),
        username: playerAccount.username,
        xp: playerAccount.xp.toNumber(),
        level: playerAccount.level,
        wins: playerAccount.wins,
        losses: playerAccount.losses,
        draws: playerAccount.draws,
        currentStreak: playerAccount.currentStreak,
        longestStreak: playerAccount.longestStreak,
        totalMatches: playerAccount.totalMatches,
        createdAt: playerAccount.createdAt.toNumber(),
      };
    } catch (error) {
      console.error('Error fetching player profile:', error);
      return null;
    }
  }

  async getMatch(matchPublicKey: PublicKey): Promise<any> {
    try {
      const program = this.getProgram({ publicKey: matchPublicKey });
      const matchAccount = await (program.account as any).match.fetch(matchPublicKey);
      
      return {
        player1: matchAccount.player1.toBase58(),
        player2: matchAccount.player2.toBase58(),
        entryFee: matchAccount.entryFee.toNumber() / LAMPORTS_PER_SOL,
        gameMode: Object.keys(matchAccount.gameMode)[0],
        status: Object.keys(matchAccount.status)[0],
        winner: matchAccount.winner.toBase58(),
        createdAt: matchAccount.createdAt.toNumber(),
      };
    } catch (error) {
      console.error('Error fetching match:', error);
      return null;
    }
  }

  async getAllPlayers(limit: number = 100): Promise<any[]> {
    try {
      const program = this.getProgram({ publicKey: PROGRAM_ID });
      const players = await (program.account as any).player.all();
      
      return players
        .map((p: any) => ({
          publicKey: p.account.authority.toBase58(),
          username: p.account.username,
          xp: p.account.xp.toNumber(),
          level: p.account.level,
          wins: p.account.wins,
          losses: p.account.losses,
          draws: p.account.draws,
          currentStreak: p.account.currentStreak,
          longestStreak: p.account.longestStreak,
          totalMatches: p.account.totalMatches,
          createdAt: p.account.createdAt.toNumber(),
        }))
        .sort((a: any, b: any) => b.xp - a.xp)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching all players:', error);
      return [];
    }
  }

  async getLeaderboard(limit: number = 100): Promise<any[]> {
    try {
      const players = await this.getAllPlayers(limit);
      
      return players.map((player, index) => ({
        rank: index + 1,
        publicKey: player.publicKey,
        username: player.username,
        xp: player.xp,
        wins: player.wins,
        losses: player.losses,
        winRate: player.totalMatches > 0 
          ? Math.round((player.wins / player.totalMatches) * 100) 
          : 0,
        streak: player.currentStreak,
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  async getActiveMatches(): Promise<any[]> {
    try {
      const program = this.getProgram({ publicKey: PROGRAM_ID });
      const matches = await (program.account as any).match.all();
      
      return matches
        .filter((m: any) => 
          Object.keys(m.account.status)[0] === 'waiting' || 
          Object.keys(m.account.status)[0] === 'active'
        )
        .map((m: any) => ({
          publicKey: m.publicKey.toBase58(),
          player1: m.account.player1.toBase58(),
          player2: m.account.player2.toBase58(),
          entryFee: m.account.entryFee.toNumber() / LAMPORTS_PER_SOL,
          gameMode: Object.keys(m.account.gameMode)[0],
          status: Object.keys(m.account.status)[0],
          createdAt: m.account.createdAt.toNumber(),
        }));
    } catch (error) {
      console.error('Error fetching active matches:', error);
      return [];
    }
  }

  async checkPlayerExists(playerPublicKey: PublicKey): Promise<boolean> {
    try {
      const [playerPDA] = await this.getPlayerPDA(playerPublicKey);
      const program = this.getProgram({ publicKey: playerPublicKey });
      const playerAccount = await (program.account as any).player.fetch(playerPDA);
      return !!playerAccount;
    } catch (error) {
      return false;
    }
  }
}
