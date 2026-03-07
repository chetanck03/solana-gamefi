// @ts-nocheck
import { Connection, PublicKey, SystemProgram, Keypair, TransactionMessage, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

const PROGRAM_ID = new PublicKey('GhESwjzEv3C3qKQJKjAfhaq5GFK5vDLaku8tPqCKGzYR');

const TREASURY_PUBKEY = new PublicKey('FwBi3MnpHzu2y4Hk78zn47YtBwhmi92onvLPuV6Jn9v3');

const APP_IDENTITY = {
  name: 'ClashGo',
  uri: 'https://clashgo.app',
  icon: 'clashgo.png',
};

export class AnchorService {
  private connection: Connection;
  private programId: PublicKey;
  private treasuryPubkey: PublicKey;

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.programId = PROGRAM_ID;
    this.treasuryPubkey = TREASURY_PUBKEY;
  }

  /**
   * Helper to handle authorization with fallback
   * Tries reauthorize first, falls back to authorize if needed
   */
  private async authorizeWallet(wallet: Web3MobileWallet, authToken?: string | null): Promise<void> {
    try {
      if (authToken) {
        console.log('Attempting reauthorization...');
        await wallet.reauthorize({
          auth_token: authToken,
          identity: APP_IDENTITY,
        });
        console.log('✓ Reauthorization successful (no popup)');
      } else {
        throw new Error('No auth token');
      }
    } catch (error) {
      console.log('Reauthorization failed, requesting full authorization...');
      await wallet.authorize({
        cluster: 'devnet',
        identity: APP_IDENTITY,
      });
      console.log('✓ Authorization successful');
    }
  }

  async getPlayerPDA(authority: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('player'), authority.toBuffer()],
      this.programId
    );
  }

  async getFighterOwnershipPDA(buyer: PublicKey, fighterName: string): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('fighter'), buyer.toBuffer(), Buffer.from(fighterName)],
      this.programId
    );
  }

  /**
   * Purchase a fighter using the Anchor program
   * This stores ownership on-chain
   */
  async purchaseFighter(
    walletPublicKey: PublicKey,
    fighterName: string,
    price: number,
    authToken?: string | null
  ): Promise<string> {
    try {
      console.log('=== Purchase Fighter Started ===');
      console.log('Wallet:', walletPublicKey.toBase58());
      console.log('Fighter:', fighterName);
      console.log('Price:', price, 'SOL');
      
      if (price === 0) {
        console.log('Fighter is free, no purchase needed');
        return 'free-fighter';
      }

      const [fighterOwnershipPDA] = await this.getFighterOwnershipPDA(walletPublicKey, fighterName);
      console.log('Fighter Ownership PDA:', fighterOwnershipPDA.toBase58());

      const signature = await transact(async (wallet: Web3MobileWallet) => {
        console.log('Inside transact...');
        
        // Use helper to handle authorization with fallback
        await this.authorizeWallet(wallet, authToken);

        // Get latest blockhash with retry
        let blockhash, lastValidBlockHeight;
        let retries = 3;
        while (retries > 0) {
          try {
            const result = await this.connection.getLatestBlockhash('finalized');
            blockhash = result.blockhash;
            lastValidBlockHeight = result.lastValidBlockHeight;
            console.log('Got blockhash:', blockhash);
            break;
          } catch (error) {
            retries--;
            if (retries === 0) throw new Error('Failed to get blockhash. Network issue.');
            console.log(`Retrying blockhash... (${retries} left)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // Encode instruction data using Uint8Array (more compatible with React Native)
        const discriminator = new Uint8Array([43, 24, 67, 140, 76, 176, 253, 44]);
        
        const fighterNameBytes = new TextEncoder().encode(fighterName);
        
        const nameLength = new Uint8Array(4);
        new DataView(nameLength.buffer).setUint32(0, fighterNameBytes.length, true); // little-endian
        
        const priceBytes = new Uint8Array(8);
        new DataView(priceBytes.buffer).setBigUint64(0, BigInt(Math.floor(price * LAMPORTS_PER_SOL)), true); // little-endian
        
        // Combine all arrays
        const totalLength = discriminator.length + nameLength.length + fighterNameBytes.length + priceBytes.length;
        const data = new Uint8Array(totalLength);
        let offset = 0;
        
        data.set(discriminator, offset);
        offset += discriminator.length;
        
        data.set(nameLength, offset);
        offset += nameLength.length;
        
        data.set(fighterNameBytes, offset);
        offset += fighterNameBytes.length;
        
        data.set(priceBytes, offset);
        
        console.log('Instruction data prepared');

        // Create instruction
        const instruction = {
          programId: this.programId,
          keys: [
            { pubkey: fighterOwnershipPDA, isSigner: false, isWritable: true },
            { pubkey: walletPublicKey, isSigner: true, isWritable: true },
            { pubkey: this.treasuryPubkey, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          data,
        };
        console.log('Instruction created');

        // Create versioned transaction message
        const messageV0 = new TransactionMessage({
          payerKey: walletPublicKey,
          recentBlockhash: blockhash,
          instructions: [instruction],
        }).compileToV0Message();
        console.log('Message compiled');

        const transaction = new VersionedTransaction(messageV0);
        console.log('Transaction created');

        // Sign transaction with wallet (shows confirmation UI)
        console.log('Requesting wallet to sign transaction...');
        const signedTransactions = await wallet.signTransactions({
          transactions: [transaction],
        });
        console.log('Transaction signed by wallet');

        // Serialize and send the signed transaction with retry
        console.log('Sending signed transaction to network...');
        const serializedTransaction = Buffer.from(signedTransactions[0].serialize());
        
        let signature;
        retries = 3;
        while (retries > 0) {
          try {
            signature = await this.connection.sendRawTransaction(serializedTransaction, {
              skipPreflight: false,
              preflightCommitment: 'confirmed',
              maxRetries: 3,
            });
            console.log('Transaction sent:', signature);
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
        
        return signature;
      });

      console.log('Confirming transaction...');
      
      // Confirm with timeout and retry
      const confirmPromise = this.connection.confirmTransaction(signature, 'confirmed');
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction confirmation timeout')), 30000)
      );
      
      await Promise.race([confirmPromise, timeoutPromise]);
      
      console.log(`✅ Purchased ${fighterName} for ${price} SOL:`, signature);
      return signature;
    } catch (error: any) {
      console.error('❌ Error purchasing fighter:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('timeout') || error.message?.includes('Network')) {
        throw new Error('Network connection issue. Please check your internet and try again.');
      } else if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient SOL balance for this purchase.');
      } else if (error.message?.includes('User rejected') || error.message?.includes('cancelled')) {
        throw new Error('Transaction cancelled by user.');
      } else if (error.message?.includes('blockhash')) {
        throw new Error('Network is slow. Please try again.');
      } else {
        throw new Error(error.message || 'Purchase failed. Please try again.');
      }
    }
  }

  /**
   * Check if a fighter is owned by a wallet
   */
  async checkFighterOwnership(walletPublicKey: PublicKey, fighterName: string): Promise<boolean> {
    try {
      const [fighterOwnershipPDA] = await this.getFighterOwnershipPDA(walletPublicKey, fighterName);
      const account = await this.connection.getAccountInfo(fighterOwnershipPDA);
      return account !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all fighters owned by a wallet
   */
  async getOwnedFighters(walletPublicKey: PublicKey): Promise<string[]> {
    try {
      // Query all accounts owned by the program that match the fighter ownership structure
      const accounts = await this.connection.getProgramAccounts(this.programId, {
        filters: [
          {
            memcmp: {
              offset: 8, // After discriminator
              bytes: walletPublicKey.toBase58(),
            },
          },
        ],
      });

      const ownedFighters: string[] = [];
      
      for (const account of accounts) {
        try {
          // Parse the account data to get fighter name
          // Skip discriminator (8 bytes) + owner pubkey (32 bytes) = 40 bytes
          const data = account.account.data;
          
          // Read string length (4 bytes at offset 40)
          const nameLength = data.readUInt32LE(40);
          
          // Read fighter name (starts at offset 44)
          const fighterName = data.slice(44, 44 + nameLength).toString('utf-8');
          
          ownedFighters.push(fighterName);
        } catch (e) {
          console.error('Error parsing fighter ownership account:', e);
        }
      }
      
      return ownedFighters;
    } catch (error) {
      console.error('Error getting owned fighters:', error);
      return [];
    }
  }

  async createMatch(
    walletPublicKey: PublicKey,
    entryFee: number,
    gameMode: 'quick' | 'ranked' | 'tournament',
    authToken?: string | null
  ): Promise<{ signature: string; matchKeypair: Keypair }> {
    try {
      console.log('=== Create Match Started ===');
      console.log('Wallet:', walletPublicKey.toBase58());
      console.log('Entry Fee:', entryFee, 'SOL');
      console.log('Game Mode:', gameMode);

      const matchKeypair = Keypair.generate();
      console.log('Match Account:', matchKeypair.publicKey.toBase58());

      const signature = await transact(async (wallet: Web3MobileWallet) => {
        console.log('Inside transact...');
        
        // Use helper to handle authorization with fallback
        await this.authorizeWallet(wallet, authToken);

        // Get latest blockhash with retry
        let blockhash: string = '';
        let retries = 3;
        while (retries > 0) {
          try {
            const result = await this.connection.getLatestBlockhash('finalized');
            blockhash = result.blockhash;
            console.log('Got blockhash:', blockhash);
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

        // Encode instruction data using Uint8Array
        const discriminator = new Uint8Array([107, 2, 184, 145, 70, 142, 17, 165]);
        
        // Entry fee in lamports
        const entryFeeBytes = new Uint8Array(8);
        new DataView(entryFeeBytes.buffer).setBigUint64(0, BigInt(Math.floor(entryFee * LAMPORTS_PER_SOL)), true);
        
        // Game mode enum: Quick = 0, Ranked = 1, Tournament = 2
        const gameModeIndex = gameMode === 'quick' ? 0 : gameMode === 'ranked' ? 1 : 2;
        const gameModeBytes = new Uint8Array([gameModeIndex]);
        
        // Combine arrays
        const totalLength = discriminator.length + entryFeeBytes.length + gameModeBytes.length;
        const data = new Uint8Array(totalLength);
        let offset = 0;
        
        data.set(discriminator, offset);
        offset += discriminator.length;
        
        data.set(entryFeeBytes, offset);
        offset += entryFeeBytes.length;
        
        data.set(gameModeBytes, offset);

        console.log('Instruction data prepared');

        // Create instruction according to IDL
        const instruction = {
          programId: this.programId,
          keys: [
            { pubkey: matchKeypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: walletPublicKey, isSigner: true, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          data,
        };
        console.log('Instruction created');

        // Create versioned transaction message
        const messageV0 = new TransactionMessage({
          payerKey: walletPublicKey,
          recentBlockhash: blockhash,
          instructions: [instruction],
        }).compileToV0Message();
        console.log('Message compiled');

        const transaction = new VersionedTransaction(messageV0);
        console.log('Transaction created');
        
        // Sign with match keypair first (this is a local keypair, not from wallet)
        transaction.sign([matchKeypair]);
        console.log('Transaction signed with match keypair');

        // Sign with wallet (shows confirmation UI)
        console.log('Requesting wallet to sign transaction...');
        const signedTransactions = await wallet.signTransactions({
          transactions: [transaction],
        });
        console.log('Transaction signed by wallet');

        // Serialize and send the signed transaction with retry
        console.log('Sending signed transaction to network...');
        const serializedTransaction = Buffer.from(signedTransactions[0].serialize());
        
        let txSignature: string = '';
        retries = 3;
        while (retries > 0) {
          try {
            txSignature = await this.connection.sendRawTransaction(serializedTransaction, {
              skipPreflight: false,
              preflightCommitment: 'confirmed',
              maxRetries: 3,
            });
            console.log('Transaction sent:', txSignature);
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

      console.log('Confirming transaction...');
      
      // Confirm with timeout
      const confirmPromise = this.connection.confirmTransaction(signature, 'confirmed');
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Transaction confirmation timeout')), 30000)
      );
      
      await Promise.race([confirmPromise, timeoutPromise]);
      
      console.log('✅ Match created:', signature);

      return {
        signature,
        matchKeypair,
      };
    } catch (error: any) {
      console.error('❌ Error creating match:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('timeout') || error.message?.includes('Network')) {
        throw new Error('Network connection issue. Please check your internet and try again.');
      } else if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient SOL balance to create match.');
      } else if (error.message?.includes('User rejected') || error.message?.includes('cancelled')) {
        throw new Error('Transaction cancelled by user.');
      } else if (error.message?.includes('blockhash')) {
        throw new Error('Network is slow. Please try again.');
      } else {
        throw new Error(error.message || 'Failed to create match. Please try again.');
      }
    }
  }

  async initializePlayer(
    walletPublicKey: PublicKey,
    username: string,
    authToken?: string | null
  ): Promise<string> {
    try {
      console.log('=== Initialize Player Started ===');
      console.log('Wallet:', walletPublicKey.toBase58());
      console.log('Username:', username);

      const [playerPDA] = await this.getPlayerPDA(walletPublicKey);
      console.log('Player PDA:', playerPDA.toBase58());

      // Check if player already exists
      try {
        const playerAccount = await this.connection.getAccountInfo(playerPDA);
        if (playerAccount) {
          console.log('Player already initialized');
          return 'player-exists';
        }
      } catch (e) {
        // Player doesn't exist, continue
      }

      const signature = await transact(async (wallet: Web3MobileWallet) => {
        console.log('Inside transact...');
        
        // Use helper to handle authorization with fallback
        await this.authorizeWallet(wallet, authToken);

        // Get latest blockhash with retry
        let blockhash: string = '';
        let retries = 3;
        while (retries > 0) {
          try {
            const result = await this.connection.getLatestBlockhash('finalized');
            blockhash = result.blockhash;
            console.log('Got blockhash:', blockhash);
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

        // Encode instruction data using Uint8Array
        const discriminator = new Uint8Array([79, 249, 88, 177, 220, 62, 56, 128]);
        
        const usernameBytes = new TextEncoder().encode(username);
        
        const usernameLength = new Uint8Array(4);
        new DataView(usernameLength.buffer).setUint32(0, usernameBytes.length, true);
        
        // Combine arrays
        const totalLength = discriminator.length + usernameLength.length + usernameBytes.length;
        const data = new Uint8Array(totalLength);
        let offset = 0;
        
        data.set(discriminator, offset);
        offset += discriminator.length;
        
        data.set(usernameLength, offset);
        offset += usernameLength.length;
        
        data.set(usernameBytes, offset);

        console.log('Instruction data prepared');

        // Create instruction
        const instruction = {
          programId: this.programId,
          keys: [
            { pubkey: playerPDA, isSigner: false, isWritable: true },
            { pubkey: walletPublicKey, isSigner: true, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          data,
        };
        console.log('Instruction created');

        // Create versioned transaction message
        const messageV0 = new TransactionMessage({
          payerKey: walletPublicKey,
          recentBlockhash: blockhash,
          instructions: [instruction],
        }).compileToV0Message();
        console.log('Message compiled');

        const transaction = new VersionedTransaction(messageV0);
        console.log('Transaction created');

        // Sign with wallet
        console.log('Requesting wallet to sign transaction...');
        const signedTransactions = await wallet.signTransactions({
          transactions: [transaction],
        });
        console.log('Transaction signed by wallet');

        // Serialize and send the signed transaction with retry
        console.log('Sending signed transaction to network...');
        const serializedTransaction = Buffer.from(signedTransactions[0].serialize());
        
        let txSignature: string = '';
        retries = 3;
        while (retries > 0) {
          try {
            txSignature = await this.connection.sendRawTransaction(serializedTransaction, {
              skipPreflight: false,
              preflightCommitment: 'confirmed',
              maxRetries: 3,
            });
            console.log('Transaction sent:', txSignature);
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

      console.log('Confirming transaction...');
      
      // Confirm with timeout
      const confirmPromise = this.connection.confirmTransaction(signature, 'confirmed');
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Transaction confirmation timeout')), 30000)
      );
      
      await Promise.race([confirmPromise, timeoutPromise]);
      
      console.log('✅ Player initialized:', signature);
      return signature;
    } catch (error: any) {
      console.error('❌ Error initializing player:', error);
      
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
        throw new Error(error.message || 'Failed to initialize player. Please try again.');
      }
    }
  }

  async getPlayerProfile(playerPublicKey: PublicKey): Promise<any> {
    try {
      const [playerPDA] = await this.getPlayerPDA(playerPublicKey);
      const playerAccount = await this.connection.getAccountInfo(playerPDA);

      if (!playerAccount) {
        return null;
      }

      // Parse account data (simplified - you'd need proper deserialization)
      return {
        publicKey: playerPublicKey.toBase58(),
        // Add proper parsing here
      };
    } catch (error) {
      console.error('Error fetching player profile:', error);
      return null;
    }
  }

  async checkPlayerExists(playerPublicKey: PublicKey): Promise<boolean> {
    try {
      const [playerPDA] = await this.getPlayerPDA(playerPublicKey);
      const playerAccount = await this.connection.getAccountInfo(playerPDA);
      return playerAccount !== null;
    } catch (error) {
      return false;
    }
  }
}
