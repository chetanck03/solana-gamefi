import { Connection, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { retryWithBackoff } from '../utils/solanaConnection';

const APP_IDENTITY = {
  name: 'ClashGo',
  uri: 'https://clashgo.app',
  icon: 'favicon.ico',
};

export interface QuizState {
  user: PublicKey;
  lastAttempt: number;
  totalAttempts: number;
  correctAttempts: number;
  lastRewardClaimed: number;
  pendingReward: number;
  bump: number;
}

export class QuizService {
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

  async getQuizStatePDA(userPublicKey: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('quiz'), userPublicKey.toBuffer()],
      this.programId
    );
  }

  async getQuizConfigPDA(): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('quiz_config')],
      this.programId
    );
  }

  async initializeQuiz(
    walletPublicKey: PublicKey,
    authToken?: string | null
  ): Promise<string> {
    return retryWithBackoff(async () => {
      try {
        const [quizStatePDA] = await this.getQuizStatePDA(walletPublicKey);

        const signature = await transact(async (wallet: Web3MobileWallet) => {
          await this.authorizeWallet(wallet, authToken);

          const { blockhash } = await this.connection.getLatestBlockhash();

          // Discriminator for initialize_quiz
          const discriminator = new Uint8Array([175, 175, 109, 31, 13, 152, 155, 237]);

          const instruction = {
            programId: this.programId,
            keys: [
              { pubkey: quizStatePDA, isSigner: false, isWritable: true },
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
          return await this.connection.sendRawTransaction(serializedTransaction, {
            skipPreflight: false,
          });
        });

        await this.connection.confirmTransaction(signature);
        console.log('Quiz initialized:', signature);
        return signature;
      } catch (error) {
        console.error('Error initializing quiz:', error);
        throw error;
      }
    }, 3, 2000); // 3 retries with 2 second base delay
  }

  async submitQuiz(
    walletPublicKey: PublicKey,
    allCorrect: boolean,
    authToken?: string | null
  ): Promise<string> {
    return retryWithBackoff(async () => {
      try {
        const [quizStatePDA] = await this.getQuizStatePDA(walletPublicKey);
        const [quizConfigPDA] = await this.getQuizConfigPDA();

        const signature = await transact(async (wallet: Web3MobileWallet) => {
          await this.authorizeWallet(wallet, authToken);

          const { blockhash } = await this.connection.getLatestBlockhash();

          // Discriminator for submit_quiz
          const discriminator = new Uint8Array([68, 142, 127, 219, 158, 216, 108, 228]);
          const allCorrectByte = new Uint8Array([allCorrect ? 1 : 0]);

          const data = new Uint8Array(discriminator.length + allCorrectByte.length);
          data.set(discriminator, 0);
          data.set(allCorrectByte, discriminator.length);

          const instruction = {
            programId: this.programId,
            keys: [
              { pubkey: quizStatePDA, isSigner: false, isWritable: true },
              { pubkey: quizConfigPDA, isSigner: false, isWritable: false },
              { pubkey: walletPublicKey, isSigner: true, isWritable: true },
            ],
            data: Buffer.from(data),
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
          return await this.connection.sendRawTransaction(serializedTransaction, {
            skipPreflight: false,
          });
        });

        await this.connection.confirmTransaction(signature);
        console.log('Quiz submitted:', signature);
        return signature;
      } catch (error: any) {
        if (error.message?.includes('CooldownNotExpired')) {
          throw new Error('Please wait 24 hours before taking the quiz again');
        }
        console.error('Error submitting quiz:', error);
        throw error;
      }
    }, 3, 2000); // 3 retries with 2 second base delay
  }

  async getQuizState(userPublicKey: PublicKey): Promise<QuizState | null> {
    try {
      const [quizStatePDA] = await this.getQuizStatePDA(userPublicKey);
      const account = await this.connection.getAccountInfo(quizStatePDA);
      
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

      // Parse lastAttempt (i64 - 8 bytes)
      const lastAttempt = Number(data.readBigInt64LE(offset));
      offset += 8;

      // Parse totalAttempts (u32 - 4 bytes)
      const totalAttempts = data.readUInt32LE(offset);
      offset += 4;

      // Parse correctAttempts (u32 - 4 bytes)
      const correctAttempts = data.readUInt32LE(offset);
      offset += 4;

      // Parse lastRewardClaimed (i64 - 8 bytes)
      const lastRewardClaimed = Number(data.readBigInt64LE(offset));
      offset += 8;

      // Parse pendingReward (u64 - 8 bytes)
      const pendingReward = Number(data.readBigUInt64LE(offset));
      offset += 8;

      // Parse bump (u8 - 1 byte)
      const bump = data.readUInt8(offset);

      return {
        user,
        lastAttempt,
        totalAttempts,
        correctAttempts,
        lastRewardClaimed,
        pendingReward,
        bump,
      };
    } catch (error) {
      console.log('Quiz state not found, needs initialization');
      return null;
    }
  }

  async canTakeQuiz(userPublicKey: PublicKey): Promise<boolean> {
    const quizState = await this.getQuizState(userPublicKey);
    if (!quizState) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastAttempt = currentTime - quizState.lastAttempt;
    const cooldownPeriod = 86400; // 24 hours

    return timeSinceLastAttempt >= cooldownPeriod;
  }

  async getTimeUntilNextQuiz(userPublicKey: PublicKey): Promise<number> {
    const quizState = await this.getQuizState(userPublicKey);
    if (!quizState || quizState.lastAttempt === 0) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastAttempt = currentTime - quizState.lastAttempt;
    const cooldownPeriod = 86400; // 24 hours
    const timeRemaining = cooldownPeriod - timeSinceLastAttempt;

    return timeRemaining > 0 ? timeRemaining : 0;
  }

  async claimReward(
    walletPublicKey: PublicKey,
    authToken?: string | null
  ): Promise<string> {
    return retryWithBackoff(async () => {
      try {
        const [quizStatePDA] = await this.getQuizStatePDA(walletPublicKey);
        const [quizConfigPDA] = await this.getQuizConfigPDA();

        const signature = await transact(async (wallet: Web3MobileWallet) => {
          await this.authorizeWallet(wallet, authToken);

          const { blockhash } = await this.connection.getLatestBlockhash();

          // Discriminator for claim_reward
          const discriminator = new Uint8Array([149, 95, 181, 242, 94, 90, 158, 162]);

          const instruction = {
            programId: this.programId,
            keys: [
              { pubkey: quizStatePDA, isSigner: false, isWritable: true },
              { pubkey: quizConfigPDA, isSigner: false, isWritable: true },
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
          return await this.connection.sendRawTransaction(serializedTransaction, {
            skipPreflight: false,
          });
        });

        await this.connection.confirmTransaction(signature);
        console.log('Reward claimed:', signature);
        return signature;
      } catch (error: any) {
        if (error.message?.includes('NoRewardAvailable')) {
          throw new Error('No reward available to claim');
        }
        console.error('Error claiming reward:', error);
        throw error;
      }
    }, 3, 2000);
  }
}
