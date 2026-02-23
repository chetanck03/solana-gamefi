// Utility helper functions

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 1000) + 1;
}

export function xpToNextLevel(xp: number): number {
  return 1000 - (xp % 1000);
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 100) return '💯';
  if (streak >= 30) return '🔥🔥🔥';
  if (streak >= 7) return '🔥🔥';
  if (streak >= 3) return '🔥';
  return '⭐';
}

export function getBadgeRarityColor(rarity: string): string {
  switch (rarity) {
    case 'legendary': return '#FFD700';
    case 'epic': return '#9945FF';
    case 'rare': return '#14F195';
    case 'common': return '#888888';
    default: return '#ffffff';
  }
}
