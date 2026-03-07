import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_STORAGE_KEY = '@clashgo_player_stats';

export interface PlayerStats {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  longestStreak: number;
  lastMatchDate: string;
}

export class LocalStatsService {
  private static async getStats(): Promise<PlayerStats> {
    try {
      const data = await AsyncStorage.getItem(STATS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading stats data:', error);
    }

    // Default stats
    return {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastMatchDate: '',
    };
  }

  private static async saveStats(stats: PlayerStats): Promise<void> {
    try {
      await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving stats data:', error);
    }
  }

  static async recordMatchResult(result: 'win' | 'loss' | 'draw'): Promise<PlayerStats> {
    const stats = await this.getStats();
    
    stats.totalMatches += 1;
    stats.lastMatchDate = new Date().toISOString();

    if (result === 'win') {
      stats.wins += 1;
      stats.currentStreak += 1;
      
      // Update longest streak
      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }
    } else if (result === 'loss') {
      stats.losses += 1;
      stats.currentStreak = 0; // Reset streak on loss
    } else {
      stats.draws += 1;
      // Draw doesn't break streak but doesn't increase it
    }

    await this.saveStats(stats);
    return stats;
  }

  static async getPlayerStats(): Promise<PlayerStats> {
    return await this.getStats();
  }

  static async resetStats(): Promise<void> {
    const defaultStats: PlayerStats = {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastMatchDate: '',
    };
    await this.saveStats(defaultStats);
  }

  static calculateWinRate(stats: PlayerStats): number {
    if (stats.totalMatches === 0) return 0;
    return Math.round((stats.wins / stats.totalMatches) * 100);
  }
}
