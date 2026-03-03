import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { COLORS } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is Solana's consensus mechanism?",
    options: ["Proof of Work", "Proof of Stake", "Proof of History", "Proof of Authority"],
    correctAnswer: 2,
    explanation: "Solana uses Proof of History (PoH) combined with Proof of Stake"
  },
  {
    id: 2,
    question: "What is the native token of Solana blockchain?",
    options: ["ETH", "BTC", "SOL", "USDC"],
    correctAnswer: 2,
    explanation: "SOL is the native cryptocurrency of the Solana blockchain"
  },
  {
    id: 3,
    question: "What is the average block time on Solana?",
    options: ["10 minutes", "15 seconds", "400 milliseconds", "1 second"],
    correctAnswer: 2,
    explanation: "Solana has an average block time of approximately 400 milliseconds"
  },
  {
    id: 4,
    question: "What programming language is primarily used for Solana smart contracts?",
    options: ["Solidity", "Rust", "JavaScript", "Python"],
    correctAnswer: 1,
    explanation: "Rust is the primary language for developing Solana smart contracts"
  },
  {
    id: 5,
    question: "What is a Seeker token?",
    options: ["A Bitcoin fork", "A game token on Solana", "An Ethereum token", "A stablecoin"],
    correctAnswer: 1,
    explanation: "Seeker is a gaming token built on the Solana blockchain"
  },
  {
    id: 6,
    question: "What is the maximum theoretical TPS (Transactions Per Second) of Solana?",
    options: ["15 TPS", "1,000 TPS", "50,000 TPS", "65,000+ TPS"],
    correctAnswer: 3,
    explanation: "Solana can theoretically handle 65,000+ transactions per second"
  }
];

const QUIZ_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours
const QUIZ_REWARD = 0.001; // SOL reward for completing quiz
const STORAGE_KEY = 'last_quiz_completion';

// Preload all quiz images for smooth transitions
const QUIZ_IMAGES = {
  bg: require('../../assets/quiz/bg.png'),
  correct: require('../../assets/quiz/correct.png'),
  wrong: require('../../assets/quiz/wrong-ans.png'),
  victory: require('../../assets/quiz/victory.png'),
  loose: require('../../assets/quiz/loose.png'),
};

export default function QuizScreen({ navigation }: any) {
  const wallet = useWallet();
  const { showToast } = useToast();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizState, setQuizState] = useState<'ready' | 'playing' | 'result' | 'cooldown'>('ready');
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [canPlayQuiz, setCanPlayQuiz] = useState(true);
  const [cooldownTime, setCooldownTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(QUIZ_IMAGES.bg);

  useEffect(() => {
    preloadImages();
    checkQuizAvailability();
  }, []);

  const preloadImages = () => {
    // Preload all images using Image.resolveAssetSource to cache them
    // This ensures smooth transitions without loading delays
    try {
      Object.values(QUIZ_IMAGES).forEach(image => {
        Image.resolveAssetSource(image);
      });
      setImagesLoaded(true);
    } catch (error) {
      console.error('Error preloading images:', error);
      setImagesLoaded(true); // Continue anyway
    }
  };

  useEffect(() => {
    if (quizState === 'playing' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && quizState === 'playing') {
      handleTimeout();
    }
  }, [timeRemaining, quizState]);

  const checkQuizAvailability = async () => {
    try {
      // Commented out for testing - uncomment later for production
      /*
      const lastCompletion = await AsyncStorage.getItem(STORAGE_KEY);
      if (lastCompletion) {
        const timeSinceLastQuiz = Date.now() - parseInt(lastCompletion);
        if (timeSinceLastQuiz < QUIZ_COOLDOWN) {
          setCanPlayQuiz(false);
          setQuizState('cooldown');
          updateCooldownTime(QUIZ_COOLDOWN - timeSinceLastQuiz);
        }
      }
      */
    } catch (error) {
      console.error('Error checking quiz availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCooldownTime = (remainingTime: number) => {
    const hours = Math.floor(remainingTime / (60 * 60 * 1000));
    const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
    setCooldownTime(`${hours}h ${minutes}m`);
    
    if (remainingTime > 0) {
      setTimeout(() => updateCooldownTime(remainingTime - 60000), 60000);
    } else {
      setCanPlayQuiz(true);
      setQuizState('ready');
    }
  };

  const startQuiz = () => {
    setQuizState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeRemaining(30);
    setBackgroundImage(QUIZ_IMAGES.bg);
  };

  const handleTimeout = () => {
    setShowExplanation(true);
    setTimeout(() => {
      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        nextQuestion();
      } else {
        finishQuiz(score);
      }
    }, 2000);
  };

  const selectAnswer = (index: number) => {
    if (selectedAnswer !== null || showExplanation) return;
    
    setSelectedAnswer(index);
    const isCorrect = index === QUIZ_QUESTIONS[currentQuestion].correctAnswer;
    
    const newScore = isCorrect ? score + 1 : score;
    
    if (isCorrect) {
      setScore(newScore);
      setBackgroundImage(QUIZ_IMAGES.correct);
    } else {
      setBackgroundImage(QUIZ_IMAGES.wrong);
    }
    
    setShowExplanation(true);
    
    setTimeout(() => {
      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        nextQuestion();
      } else {
        finishQuiz(newScore);
      }
    }, 2000);
  };

  const nextQuestion = () => {
    setCurrentQuestion(currentQuestion + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeRemaining(30);
    setBackgroundImage(QUIZ_IMAGES.bg);
  };

  const finishQuiz = async (finalScore: number) => {
    setQuizState('result');
    
    if (finalScore === QUIZ_QUESTIONS.length) {
      setBackgroundImage(QUIZ_IMAGES.victory);
      try {
        // Commented out for testing - uncomment later for production
        // await AsyncStorage.setItem(STORAGE_KEY, Date.now().toString());
        showToast(`Perfect! You earned ${QUIZ_REWARD} SOL!`, 'success');
        // setCanPlayQuiz(false);
        // updateCooldownTime(QUIZ_COOLDOWN);
      } catch (error) {
        console.error('Error saving quiz completion:', error);
      }
    } else {
      setBackgroundImage(QUIZ_IMAGES.loose);
    }
  };

  const getAnswerStyle = (index: number) => {
    if (!showExplanation) {
      return selectedAnswer === index ? 'border-[#9945FF] bg-[#9945FF]/20' : 'border-[#2a2a3e]';
    }
    
    if (index === QUIZ_QUESTIONS[currentQuestion].correctAnswer) {
      return 'border-[#14F195] bg-[#14F195]/20';
    }
    
    if (selectedAnswer === index && index !== QUIZ_QUESTIONS[currentQuestion].correctAnswer) {
      return 'border-[#FF6B6B] bg-[#FF6B6B]/20';
    }
    
    return 'border-[#2a2a3e]';
  };

  if (isLoading || !imagesLoaded) {
    return (
      <View className="flex-1 bg-[#0f0f1e] items-center justify-center">
        <ActivityIndicator size="large" color="#9945FF" />
        <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg mt-4">
          {!imagesLoaded ? 'Loading Quiz...' : 'Preparing...'}
        </Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={backgroundImage}
      className="flex-1"
      resizeMode="cover"
      fadeDuration={300}
    >
      <View className="flex-1 bg-black/60">
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="p-5 flex-1">
            
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6 mt-2">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="w-10 h-10 bg-[#1a1a2e]/80 rounded-full items-center justify-center"
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl">
                Solana Quiz
              </Text>
              <View className="w-10" />
            </View>

            {/* Ready State */}
            {quizState === 'ready' && (
              <View className="flex-1 justify-center items-center px-5">
                <View className="w-24 h-24 bg-[#9945FF] rounded-full items-center justify-center mb-6">
                  <Ionicons name="school" size={48} color="#fff" />
                </View>
                
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-3xl text-center mb-3">
                Answer {QUIZ_QUESTIONS.length} questions about Solana & Seeker tokens
                </Text>
                
               

                <View className="bg-[#1a1a2e]/80 rounded-2xl p-6 mb-8 w-full border border-[#2a2a3e]">
                  <View className="flex-row items-center mb-4">
                    <Ionicons name="trophy" size={24} color="#FFD700" />
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg ml-3">
                      Rewards
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base mb-2">
                    • Get all answers correct: {QUIZ_REWARD} SOL
                  </Text>
                  <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base mb-2">
                    • 30 seconds per question
                  </Text>
                  <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base">
                    • One attempt every 24 hours
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={startQuiz}
                  className="bg-[#14F195] rounded-2xl py-5 px-12 w-full"
                  style={{
                    shadowColor: '#14F195',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.5,
                    shadowRadius: 10,
                    elevation: 8,
                  }}
                >
                  <Text style={{ fontFamily: 'Bangers' }} className="text-black text-2xl text-center">
                    Start Quiz!
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Playing State */}
            {quizState === 'playing' && (
              <View className="flex-1">
                {/* Progress */}
                <View className="mb-6">
                  <View className="flex-row justify-between mb-2">
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white text-base">
                      Question {currentQuestion + 1}/{QUIZ_QUESTIONS.length}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons name="time" size={18} color={timeRemaining <= 10 ? '#FF6B6B' : '#14F195'} />
                      <Text style={{ fontFamily: 'Bangers' }} className={`text-lg ml-1 ${timeRemaining <= 10 ? 'text-[#FF6B6B]' : 'text-[#14F195]'}`}>
                        {timeRemaining}s
                      </Text>
                    </View>
                  </View>
                  <View className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                    <View 
                      className="h-full bg-[#9945FF]"
                      style={{ width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                    />
                  </View>
                </View>

                {/* Question */}
                <View className="bg-[#1a1a2e]/90 rounded-2xl p-6 mb-6 border border-[#2a2a3e]">
                  <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl leading-7">
                    {QUIZ_QUESTIONS[currentQuestion].question}
                  </Text>
                </View>

                {/* Options */}
                <View className="gap-4 mb-6">
                  {QUIZ_QUESTIONS[currentQuestion].options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => selectAnswer(index)}
                      disabled={selectedAnswer !== null}
                      className={`bg-[#1a1a2e]/90 rounded-xl p-5 border-2 ${getAnswerStyle(index)}`}
                    >
                      <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg">
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Explanation */}
                {showExplanation && (
                  <View className={`rounded-2xl p-5 border-2 ${
                    selectedAnswer === QUIZ_QUESTIONS[currentQuestion].correctAnswer
                      ? 'bg-[#14F195]/20 border-[#14F195]'
                      : 'bg-[#FF6B6B]/20 border-[#FF6B6B]'
                  }`}>
                    <View className="flex-row items-center mb-2">
                      <Ionicons 
                        name={selectedAnswer === QUIZ_QUESTIONS[currentQuestion].correctAnswer ? 'checkmark-circle' : 'close-circle'} 
                        size={24} 
                        color={selectedAnswer === QUIZ_QUESTIONS[currentQuestion].correctAnswer ? '#14F195' : '#FF6B6B'} 
                      />
                      <Text style={{ fontFamily: 'Bangers' }} className={`text-lg ml-2 ${
                        selectedAnswer === QUIZ_QUESTIONS[currentQuestion].correctAnswer ? 'text-[#14F195]' : 'text-[#FF6B6B]'
                      }`}>
                        {selectedAnswer === QUIZ_QUESTIONS[currentQuestion].correctAnswer ? 'Correct!' : 'Wrong!'}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white text-base">
                      {QUIZ_QUESTIONS[currentQuestion].explanation}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Result State */}
            {quizState === 'result' && (
              <View className="flex-1 justify-center items-center px-5">
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-4xl text-center mb-3">
                  {score === QUIZ_QUESTIONS.length ? 'Perfect Score!' : 'Quiz Complete!'}
                </Text>
                
                <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-2xl text-center mb-8">
                  You got {score}/{QUIZ_QUESTIONS.length} correct
                </Text>

                {score === QUIZ_QUESTIONS.length ? (
                  <View className="bg-[#14F195]/20 border-2 border-[#14F195] rounded-2xl p-6 mb-8 w-full">
                    <View className="flex-row items-center justify-center mb-2">
                      <Ionicons name="trophy" size={32} color="#FFD700" />
                      <Text style={{ fontFamily: 'Bangers' }} className="text-[#14F195] text-2xl ml-3">
                        Reward Earned!
                      </Text>
                    </View>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl text-center">
                      +{QUIZ_REWARD} SOL
                    </Text>
                  </View>
                ) : (
                  <View className="bg-[#FF6B6B]/20 border-2 border-[#FF6B6B] rounded-2xl p-6 mb-8 w-full">
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg text-center">
                      Get all answers correct to earn rewards!
                    </Text>
                  </View>
                )}

                <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-base text-center mb-6">
                  Come back in 24 hours for another chance
                </Text>

                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  className="bg-[#9945FF] rounded-2xl py-5 px-12 w-full"
                >
                  <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl text-center">
                    Back to Home
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Cooldown State */}
            {quizState === 'cooldown' && (
              <View className="flex-1 justify-center items-center px-5">
                <View className="w-24 h-24  rounded-full items-center justify-center ">
                  <Ionicons name="time" size={48} color="#FF6B6B" />
                </View>
                
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-3xl text-center mb-3">
                  Quiz-On-Cooldown
                </Text>
                
                <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-xl text-center mb-8">
                  Come back in {cooldownTime}
                </Text>

                <View className="bg-[#1a1a2e]/80 rounded-2xl p-6 mb-8 w-full border border-[#2a2a3e]">
                  <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-base text-center">
                    You can take the quiz once every 24 hours. Use this time to learn more about Solana!
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  className="bg-[#9945FF] rounded-2xl py-5 px-12 w-full"
                >
                  <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl text-center">
                    Back to Home
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}
