// Environment configuration
export const ENV = {
  SOLANA_RPC_URL: process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  PROGRAM_ID: process.env.EXPO_PUBLIC_PROGRAM_ID || 'GhESwjzEv3C3qKQJKjAfhaq5GFK5vDLaku8tPqCKGzYR',
  CLUSTER: process.env.EXPO_PUBLIC_CLUSTER || 'devnet',
};
