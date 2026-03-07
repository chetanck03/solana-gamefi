import { Connection, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

const APP_IDENTITY = {
  name: 'ClashGo',
  uri: 'https://clashgo.app',
  icon: 'favicon.ico',
};

export interface StreakState {
  user: PublicKey;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: number;
  totalCheckIns: number;
  pendingRewards: number;
  lastRewardClaimed: number;
  bump: number;
}

export class StreakService {
  private connection: Connection;
  private programId: PublicKey;

  constructor(connection: Connection, programId: PublicKey) {
    this.connection = connection;
    this.programId = programId;
  }

  private async authorizeWallet(wallet: Web3MobileWallet, authToken?: string | null): Promise<void> {
    try {
      if (authToken) {
        await wallet.reauthorize({
          auth_token: authToken,
          identity: APP_IDENTITY,
        });
      } else {
        throw new Error('No auth token');
      }
    } catch (error) {
      await wallet.authorize({
        cluster: 'devnet',
        identity: APP_IDENTITY,
      });
    }
  }

  async getStreakStatePDA(userPublicKey: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('streak'), userPublicKey.toBuffer()],
      this.programId
    );
  }

  async getStreakConfigPDA(): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('streak_config')],
      this.programId
    );
  }

  async initializeStreak(
    walletPublicKey: PublicKey,
    authToken?: string | null
  ): Promise<string> {
    try {
      const [streakStatePDA] = await this.getStreakStatePDA(walletPublicKey);

      // Check if already initialized
      try {
        const existing = await this.connection.getAccountInfo(streakStatePDA);
        if (existing) {
          console.log('Streak already initialized');
          return 'streak-exists';
        }
      } catch (e) {
        // Continue with initialization
      }

      const signature = await transact(async (wallet: Web3MobileWallet) => {
        await this.authorizeWallet(wallet, authToken);

        // Get blockhash with retry
        let blockhash: string = '';
        let retries = 3;
        while (retries > 0) {
          try {
            const result = await this.connection.getLatestBlockhash('finalized');
            blockhash = result.blockhash;
            console.log('Got blockhash for streak init');
            break;
          } catch (error) {
            retries--;
            if (retries === 0) throw new Error('Failed to get blockhash. Network issue.');
            console.log(`Retrying blockhash... (${retries} left)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (!blockhash) {
          throw new Error('Failed to get blockhash after retries');
        }

        // Discriminator for initialize_streak
        const discriminator = new Uint8Array([95, 135, 192, 196, 242, 129, 230, 68]);

        const instruction = {
          programId: this.programId,
          keys: [
            { pubkey: streakStatePDA, isSigner: false, isWritable: true },
            { pubkey: walletPublicKey, isSigner: true, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          data: Buffer.from(discriminator),
        };

        const messageV0 = new TransactionMessage({
          payerKey: walletPublicKey,
          recentBlockhash: blockhash,
          instructions: [instruction],
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);

        const signedTransactions = await wallet.signTransactions({
          transactions: [transaction],
        });

        const serializedTransaction = Buffer.from(signedTransactions[0].serialize());
        
        // Send with retry
        let txSignature: string = '';
        retries = 3;
        while (retries > 0) {
          try {
            txSignature = await this.connection.sendRawTransaction(serializedTransaction, {
              skipPreflight: false,
              preflightCommitment: 'confirmed',
              maxRetries: 3,
            });
            console.log('Streak init transaction sent:', txSignature);
            break;
          } catch (error: any) {
            retries--;
            if (retries === 0) {
              throw new Error(`Failed to send transaction: ${error.message || 'Network error'}`);
            }
            console.log(`Retrying send... (${retries} left)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (!txSignature) {
          throw new Error('Failed to send transaction after retries');
        }
        
        return txSignature;
      });

      // Confirm with timeout
      const confirmPromise = this.connection.confirmTransaction(signature, 'confirmed');
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Transaction confirmation timeout')), 30000)
      );
      
      await Promise.race([confirmPromise, timeoutPromise]);
      
      console.log('Streak initialized:', signature);
      return signature;
    } catch (error: any) {
      console.error('Error initializing streak:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('timeout') || error.message?.includes('Network')) {
        throw new Error('Network connection issue. Please check your internet and try again.');
      } else if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient SOL balance.');
      } else if (error.message?.includes('User rejected') || error.message?.includes('cancelled')) {
        throw new Error('Transaction cancelled by user.');
      } else if (error.message?.includes('blockhash')) {
        throw new Error('Network is slow. Please try again.');
      } else {
        throw new Error(error.message || 'Failed to initialize streak. Please try again.');
      }
    }
  }

  async checkIn(
    walletPublicKey: PublicKey,
    authToken?: string | null
  ): Promise<string> {
    try {
      const [streakStatePDA] = await this.getStreakStatePDA(walletPublicKey);
      const [streakConfigPDA] = await this.getStreakConfigPDA();

      const signature = await transact(async (wallet: Web3MobileWallet) => {
        await this.authorizeWallet(wallet, authToken);

        // Get blockhash with retry
        let blockhash: string = '';
        let retries = 3;
        while (retries > 0) {
          try {
            const result = await this.connection.getLatestBlockhash('finalized');
            blockhash = result.blockhash;
            console.log('Got blockhash for check-in');
            break;
          } catch (error) {
            retries--;
            if (retries === 0) throw new Error('Failed to get blockhash. Network issue.');
            console.log(`Retrying blockhash... (${retries} left)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (!blockhash) {
          throw new Error('Failed to get blockhash after retries');
        }

        // Discriminator for check_in
        const discriminator = new Uint8Array([184, 249, 133, 178, 91, 169, 85, 147]);

        const instruction = {
          programId: this.programId,
          keys: [
            { pubkey: streakStatePDA, isSigner: false, isWritable: true },
            { pubkey: streakConfigPDA, isSigner: false, isWritable: false },
            { pubkey: walletPublicKey, isSigner: true, isWritable: true },
          ],
          data: Buffer.from(discriminator),
        };

        const messageV0 = new TransactionMessage({
          payerKey: walletPublicKey,
          recentBlockhash: blockhash,
          instructions: [instruction],
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);

        const signedTransactions = await wallet.signTransactions({
          transactions: [transaction],
        });

        const serializedTransaction = Buffer.from(signedTransactions[0].serialize());
        
        // Send with retry
        let txSignature: string = '';
        retries = 3;
        while (retries > 0) {
          try {
            txSignature = await this.connection.sendRawTransaction(serializedTransaction, {
              skipPreflight: false,
              preflightCommitment: 'confirmed',
              maxRetries: 3,
            });
            console.log('Check-in transaction sent:', txSignature);
            break;
          } catch (error: any) {
            retries--;
            if (retries === 0) {
              throw new Error(`Failed to send transaction: ${error.message || 'Network error'}`);
            }
            console.log(`Retrying send... (${retries} left)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (!txSignature) {
          throw new Error('Failed to send transaction after retries');
        }
        
        return txSignature;
      });

      // Confirm with timeout
      const confirmPromise = this.connection.confirmTransaction(signature, 'confirmed');
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Transaction confirmation timeout')), 30000)
      );
      
      await Promise.race([confirmPromise, timeoutPromise]);
      
      console.log('Check-in successful:', signature);
      return signature;
    } catch (error: any) {
      if (error.message?.includes('CheckInTooSoon')) {
        throw new Error('You have already checked in today. Come back tomorrow!');
      }
      
      // Provide user-friendly error messages
      if (error.message?.includes('timeout') || error.message?.includes('Network')) {
        throw new Error('Network connection issue. Please check your internet and try again.');
      } else if (error.message?.includes('User rejected') || error.message?.includes('cancelled')) {
        throw new Error('Check-in cancelled by user.');
      } else if (error.message?.includes('blockhash')) {
        throw new Error('Network is slow. Please try again.');
      }
      
      console.error('Error checking in:', error);
      throw error;
    }
  }

  async getStreakState(userPublicKey: PublicKey): Promise<StreakState | null> {
    try {
      const [streakStatePDA] = await this.getStreakStatePDA(userPublicKey);
      const account = await this.connection.getAccountInfo(streakStatePDA);
      
      if (!account) {
        return null;
      }

      // Parse the account data
      const data = account.data;
      // Skip discriminator (8 bytes)
      let offset = 8;

      // Parse user pubkey (32 bytes)
      const user = new PublicKey(data.slice(offset, offset + 32));
      offset += 32;

      // Parse currentStreak (u32 - 4 bytes)
      const currentStreak = data.readUInt32LE(offset);
      offset += 4;

      // Parse longestStreak (u32 - 4 bytes)
      const longestStreak = data.readUInt32LE(offset);
      offset += 4;

      // Parse lastCheckIn (i64 - 8 bytes)
      const lastCheckIn = Number(data.readBigInt64LE(offset));
      offset += 8;

      // Parse totalCheckIns (u32 - 4 bytes)
      const totalCheckIns = data.readUInt32LE(offset);
      offset += 4;

      // Parse pendingRewards (u64 - 8 bytes)
      const pendingRewards = Number(data.readBigUInt64LE(offset));
      offset += 8;

      // Parse lastRewardClaimed (i64 - 8 bytes)
      const lastRewardClaimed = Number(data.readBigInt64LE(offset));
      offset += 8;

      // Parse bump (u8 - 1 byte)
      const bump = data.readUInt8(offset);

      return {
        user,
        currentStreak,
        longestStreak,
        lastCheckIn,
        totalCheckIns,
        pendingRewards,
        lastRewardClaimed,
        bump,
      };
    } catch (error) {
      console.log('Streak state not found, needs initialization');
      return null;
    }
  }

  async canCheckIn(userPublicKey: PublicKey): Promise<boolean> {
    const streakState = await this.getStreakState(userPublicKey);
    if (!streakState) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastCheckIn = currentTime - streakState.lastCheckIn;
    const oneDayInSeconds = 86400;

    return timeSinceLastCheckIn >= oneDayInSeconds;
  }

  async getTimeUntilNextCheckIn(userPublicKey: PublicKey): Promise<number> {
    const streakState = await this.getStreakState(userPublicKey);
    if (!streakState || streakState.lastCheckIn === 0) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastCheckIn = currentTime - streakState.lastCheckIn;
    const oneDayInSeconds = 86400;
    const timeRemaining = oneDayInSeconds - timeSinceLastCheckIn;

    return timeRemaining > 0 ? timeRemaining : 0;
  }

  async isStreakAtRisk(userPublicKey: PublicKey): Promise<boolean> {
    const streakState = await this.getStreakState(userPublicKey);
    if (!streakState || streakState.lastCheckIn === 0) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastCheckIn = currentTime - streakState.lastCheckIn;
    const checkInWindow = 100800; // 28 hours

    return timeSinceLastCheckIn > 86400 && timeSinceLastCheckIn < checkInWindow;
  }
}
