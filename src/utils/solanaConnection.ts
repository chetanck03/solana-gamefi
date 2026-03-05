import { Connection, ConnectionConfig } from '@solana/web3.js';

const RPC_ENDPOINTS = [
  process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'https://rpc.ankr.com/solana_devnet',
  'https://devnet.helius-rpc.com',
];

const CONNECTION_CONFIG: ConnectionConfig = {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
  disableRetryOnRateLimit: false,
  httpHeaders: {
    'Content-Type': 'application/json',
  },
  // Use native fetch to bypass Metro bundler proxy
  fetch: (url: RequestInfo | URL, options?: RequestInit) => {
    console.log('Direct fetch to:', url);
    return fetch(url, {
      ...options,
      // Add headers to bypass Metro
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json',
      },
    });
  },
};

/**
 * Creates a Solana connection with fallback RPC endpoints
 * Tries primary endpoint first, falls back to alternatives if it fails
 */
export function createSolanaConnection(): Connection {
  // Try primary endpoint
  try {
    const connection = new Connection(RPC_ENDPOINTS[0], CONNECTION_CONFIG);
    console.log('Using Solana RPC:', RPC_ENDPOINTS[0]);
    return connection;
  } catch (error) {
    console.warn('Primary RPC failed, trying backup:', error);
    // Fallback to secondary endpoint
    const connection = new Connection(RPC_ENDPOINTS[1], CONNECTION_CONFIG);
    console.log('Using backup Solana RPC:', RPC_ENDPOINTS[1]);
    return connection;
  }
}

/**
 * Test connection to Solana RPC
 */
export async function testConnection(connection: Connection): Promise<boolean> {
  try {
    const version = await connection.getVersion();
    console.log('Solana RPC connected. Version:', version);
    return true;
  } catch (error) {
    console.error('Failed to connect to Solana RPC:', error);
    return false;
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if user cancelled
      if (error.message?.includes('cancelled') || error.message?.includes('canceled')) {
        throw error;
      }
      
      // Don't retry if it's a program error (not network)
      if (error.message?.includes('custom program error') || 
          error.message?.includes('CooldownNotExpired')) {
        throw error;
      }
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}
