import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_STORAGE_KEY = '@clashgo_daily_streak';

export interface LocalStreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string; // ISO date string (YYYY-MM-DD)
  totalCheckIns: number;
}

export class LocalStreakService {
  private static async getStreakData(): Promise<LocalStreakData> {
    try {
      const data = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading streak data:', error);
    }

    // Default data
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: '',
      totalCheckIns: 0,
    };
  }

  private static async saveStreakData(data: LocalStreakData): Promise<void> {
    try {
      await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving streak data:', error);
    }
  }

  private static getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  private static getYesterdayDateString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  static async checkAndUpdateStreak(): Promise<LocalStreakData> {
    const data = await this.getStreakData();
    const today = this.getTodayDateString();
    const yesterday = this.getYesterdayDateString();

    // Already checked in today
    if (data.lastCheckInDate === today) {
      return data;
    }

    // Check if streak continues (checked in yesterday)
    if (data.lastCheckInDate === yesterday) {
      data.currentStreak += 1;
      data.totalCheckIns += 1;
    } 
    // Streak broken or first time
    else {
      data.currentStreak = 1;
      data.totalCheckIns += 1;
    }

    // Update longest streak
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }

    data.lastCheckInDate = today;
    await this.saveStreakData(data);

    return data;
  }

  static async getStreak(): Promise<LocalStreakData> {
    return await this.getStreakData();
  }

  static async hasCheckedInToday(): Promise<boolean> {
    const data = await this.getStreakData();
    const today = this.getTodayDateString();
    return data.lastCheckInDate === today;
  }

  static async resetStreak(): Promise<void> {
    const defaultData: LocalStreakData = {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: '',
      totalCheckIns: 0,
    };
    await this.saveStreakData(defaultData);
  }
}
