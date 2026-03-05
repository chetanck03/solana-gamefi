// @ts-nocheck
import { Connection, PublicKey, SystemProgram, Keypair, TransactionMessage, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

const PROGRAM_ID = new PublicKey('GhESwjzEv3C3qKQJKjAfhaq5GFK5vDLaku8tPqCKGzYR');

const TREASURY_PUBKEY = new PublicKey('FwBi3MnpHzu2y4Hk78zn47YtBwhmi92onvLPuV6Jn9v3');

const APP_IDENTITY = {
  name: 'ClashGo',
  uri: 'https://clashgo.app',
  icon: 'favicon.ico',
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

        const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
        console.log('Got blockhash:', blockhash);

        // Encode instruction data using Uint8Array (more compatible with React Native)
        const discriminator = new Uint8Array([43, 24, 67, 140, 76, 176, 253, 44]);
        console.log('discriminator:', discriminator);
        
        const fighterNameBytes = new TextEncoder().encode(fighterName);
        console.log('fighterNameBytes:', fighterNameBytes);
        
        const nameLength = new Uint8Array(4);
        new DataView(nameLength.buffer).setUint32(0, fighterNameBytes.length, true); // little-endian
        console.log('nameLength:', nameLength);
        
        const priceBytes = new Uint8Array(8);
        new DataView(priceBytes.buffer).setBigUint64(0, BigInt(Math.floor(price * LAMPORTS_PER_SOL)), true); // little-endian
        console.log('priceBytes:', priceBytes);
        
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
        
        console.log('Final data:', data);

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

        // Serialize and send the signed transaction
        console.log('Sending signed transaction to network...');
        const serializedTransaction = Buffer.from(signedTransactions[0].serialize());
        const signature = await this.connection.sendRawTransaction(serializedTransaction, {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        });
        console.log('Transaction sent:', signature);
        
        return signature;
      });

      console.log('Confirming transaction...');
      await this.connection.confirmTransaction(signature);
      console.log(`✅ Purchased ${fighterName} for ${price} SOL:`, signature);
      return signature;
    } catch (error) {
      console.error('❌ Error purchasing fighter:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
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
      const matchKeypair = Keypair.generate();

      const signature = await transact(async (wallet: Web3MobileWallet) => {
        // Use helper to handle authorization with fallback
        await this.authorizeWallet(wallet, authToken);

        const { blockhash } = await this.connection.getLatestBlockhash();

        // Encode instruction data using Uint8Array
        const discriminator = new Uint8Array([107, 2, 184, 145, 70, 142, 17, 165]);
        
        const entryFeeBytes = new Uint8Array(8);
        new DataView(entryFeeBytes.buffer).setBigUint64(0, BigInt(Math.floor(entryFee * LAMPORTS_PER_SOL)), true);
        
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

        // Create instruction
        const instruction = {
          programId: this.programId,
          keys: [
            { pubkey: matchKeypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: walletPublicKey, isSigner: true, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          data,
        };

        // Create versioned transaction message
        const messageV0 = new TransactionMessage({
          payerKey: walletPublicKey,
          recentBlockhash: blockhash,
          instructions: [instruction],
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);
        
        // Sign with match keypair first
        transaction.sign([matchKeypair]);

        // Sign with wallet and send
        const signedTransactions = await wallet.signTransactions({
          transactions: [transaction],
        });

        // Serialize the signed transaction before sending
        const serializedTransaction = Buffer.from(signedTransactions[0].serialize());
        return await this.connection.sendRawTransaction(serializedTransaction, {
          skipPreflight: false,
        });
      });

      await this.connection.confirmTransaction(signature);
      console.log('Match created:', signature);

      return {
        signature,
        matchKeypair,
      };
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  }

  async initializePlayer(
    walletPublicKey: PublicKey,
    username: string,
    authToken?: string | null
  ): Promise<string> {
    try {
      const [playerPDA] = await this.getPlayerPDA(walletPublicKey);

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
        // Use helper to handle authorization with fallback
        await this.authorizeWallet(wallet, authToken);

        const { blockhash } = await this.connection.getLatestBlockhash();

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

        // Create versioned transaction message
        const messageV0 = new TransactionMessage({
          payerKey: walletPublicKey,
          recentBlockhash: blockhash,
          instructions: [instruction],
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);

        // Sign with wallet
        const signedTransactions = await wallet.signTransactions({
          transactions: [transaction],
        });

        // Serialize the signed transaction before sending
        const serializedTransaction = Buffer.from(signedTransactions[0].serialize());
        return await this.connection.sendRawTransaction(serializedTransaction, {
          skipPreflight: false,
        });
      });

      await this.connection.confirmTransaction(signature);
      console.log('Player initialized:', signature);
      return signature;
    } catch (error) {
      console.error('Error initializing player:', error);
      throw error;
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
