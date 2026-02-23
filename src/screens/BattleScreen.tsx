import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { COLORS, MATCH_DURATION, GAME_TYPES } from '../constants';
import { GameType } from '../types';

export default function BattleScreen() {
  const [gameType, setGameType] = useState<GameType | null>(null);
  const [matchMode, setMatchMode] = useState<'free' | 'paid' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [inMatch, setInMatch] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MATCH_DURATION);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (inMatch && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (inMatch && timeLeft === 0) {
      handleMatchEnd();
    }
  }, [inMatch, timeLeft]);

  const handleMatchEnd = () => {
    setInMatch(false);
    Alert.alert('Match Complete!', `Your score: ${score}`, [
      { text: 'OK', onPress: () => resetMatch() }
    ]);
  };

  const resetMatch = () => {
    setGameType(null);
    setMatchMode(null);
    setIsSearching(false);
    setTimeLeft(MATCH_DURATION);
    setScore(0);
  };

  const startMatchmaking = (mode: 'free' | 'paid') => {
    setMatchMode(mode);
    setIsSearching(true);
    // Simulate matchmaking
    setTimeout(() => {
      setIsSearching(false);
      setInMatch(true);
    }, 2000);
  };

  if (!gameType) {
    return (
      <View className="flex-1 bg-[#0a0a1a] p-6">
        <Text className="text-3xl font-bold text-white mb-2">Choose Game Mode</Text>
        <Text className="text-[#888] mb-6">Select your battle type</Text>

        {Object.entries(GAME_TYPES).map(([key, game]) => (
          <TouchableOpacity
            key={key}
            className="bg-[#1a1a2e] rounded-xl p-6 mb-4 border border-[#2a2a3e]"
            onPress={() => setGameType(key as GameType)}
          >
            <Text className="text-4xl mb-2">{game.icon}</Text>
            <Text className="text-white text-xl font-bold mb-1">{game.name}</Text>
            <Text className="text-[#888]">{game.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  if (!matchMode) {
    return (
      <View className="flex-1 bg-[#0a0a1a] p-6">
        <TouchableOpacity onPress={() => setGameType(null)} className="mb-6">
          <Text className="text-[#9945FF]">← Back</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-white mb-2">Select Entry Mode</Text>
        <Text className="text-[#888] mb-6">Free or stake SOL for bigger rewards</Text>

        <TouchableOpacity
          className="bg-[#14F195] rounded-xl p-6 mb-4"
          onPress={() => startMatchmaking('free')}
        >
          <Text className="text-black text-2xl font-bold mb-1">🆓 Free Mode</Text>
          <Text className="text-black/70">Earn XP only</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#9945FF] rounded-xl p-6"
          onPress={() => startMatchmaking('paid')}
        >
          <Text className="text-white text-2xl font-bold mb-1">💎 Paid Mode</Text>
          <Text className="text-white/80">0.01 SOL entry • Winner takes all</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isSearching) {
    return (
      <View className="flex-1 bg-[#0a0a1a] items-center justify-center p-6">
        <Text className="text-6xl mb-6">🔍</Text>
        <Text className="text-2xl font-bold text-white mb-2">Finding Opponent...</Text>
        <Text className="text-[#888]">This may take a few seconds</Text>
      </View>
    );
  }

  if (inMatch) {
    return (
      <View className="flex-1 bg-[#0a0a1a] p-6">
        <View className="items-center mb-8">
          <Text className="text-6xl font-bold text-[#9945FF] mb-2">{timeLeft}</Text>
          <Text className="text-[#888]">seconds remaining</Text>
        </View>

        <View className="bg-[#1a1a2e] rounded-xl p-6 mb-6 border border-[#2a2a3e]">
          <Text className="text-[#888] text-center mb-2">Your Score</Text>
          <Text className="text-white text-5xl font-bold text-center">{score}</Text>
        </View>

        {gameType === 'tap-speed' && (
          <TouchableOpacity
            className="bg-[#9945FF] rounded-xl p-12 items-center"
            onPress={() => setScore(score + 1)}
          >
            <Text className="text-white text-3xl font-bold">TAP!</Text>
          </TouchableOpacity>
        )}

        {gameType === 'reaction' && (
          <View className="items-center">
            <Text className="text-white text-xl mb-4">Tap when you see GREEN!</Text>
            <TouchableOpacity
              className="bg-[#14F195] rounded-xl p-12 w-full items-center"
              onPress={() => setScore(score + 100)}
            >
              <Text className="text-black text-3xl font-bold">GO!</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return null;
}
