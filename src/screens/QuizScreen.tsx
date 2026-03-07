import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { useFight } from '../context/FightContext';
import OptimizedImage from '../components/OptimizedImage';
import ConfirmDialog from '../components/ConfirmDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import quizData from '../data/quizQuestions.json';
import { QuizService } from '../services/quizService';
import { PublicKey } from '@solana/web3.js';

const ALL_QUESTIONS = quizData.questions;
const QUESTIONS_PER_QUIZ = 6;

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
  const { setIsInActiveFight } = useFight();
  
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
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [showQuitDialog, setShowQuitDialog] = useState(false);

  // Hide tab bar when in quiz
  useEffect(() => {
    if (quizState === 'playing') {
      setIsInActiveFight(true);
    } else {
      setIsInActiveFight(false);
    }
    
    return () => {
      setIsInActiveFight(false);
    };
  }, [quizState, setIsInActiveFight]);

  useEffect(() => {
    preloadImages();
    checkQuizAvailability();
    loadUsedQuestions();
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

  const loadUsedQuestions = async () => {
    try {
      const usedQuestionsStr = await AsyncStorage.getItem('used_quiz_questions');
      const usedQuestions = usedQuestionsStr ? JSON.parse(usedQuestionsStr) : [];
      
      // Get available questions (not used yet)
      let availableQuestions = ALL_QUESTIONS.filter(
        q => !usedQuestions.includes(q.id)
      );
      
      // If less than 6 questions available, reset the used questions
      if (availableQuestions.length < QUESTIONS_PER_QUIZ) {
        availableQuestions = ALL_QUESTIONS;
        await AsyncStorage.setItem('used_quiz_questions', JSON.stringify([]));
      }
      
      // Shuffle and select random 6 questions
      const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, QUESTIONS_PER_QUIZ);
      
      setQuizQuestions(selectedQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
      // Fallback to random 6 questions
      const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5);
      setQuizQuestions(shuffled.slice(0, QUESTIONS_PER_QUIZ));
    }
  };

  const saveUsedQuestions = async (questions: any[]) => {
    try {
      const usedQuestionsStr = await AsyncStorage.getItem('used_quiz_questions');
      const usedQuestions = usedQuestionsStr ? JSON.parse(usedQuestionsStr) : [];
      
      const newUsedQuestions = [...usedQuestions, ...questions.map(q => q.id)];
      await AsyncStorage.setItem('used_quiz_questions', JSON.stringify(newUsedQuestions));
    } catch (error) {
      console.error('Error saving used questions:', error);
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
      if (!wallet.publicKey || !wallet.connection) {
        setIsLoading(false);
        return;
      }

      const programId = new PublicKey(process.env.EXPO_PUBLIC_PROGRAM_ID || 'GhESwjzEv3C3qKQJKjAfhaq5GFK5vDLaku8tPqCKGzYR');
      const quizService = new QuizService(wallet.connection, programId);
      const canTake = await quizService.canTakeQuiz(wallet.publicKey);
      
      if (!canTake) {
        const timeRemaining = await quizService.getTimeUntilNextQuiz(wallet.publicKey);
        setCanPlayQuiz(false);
        setQuizState('cooldown');
        updateCooldownTime(timeRemaining * 1000); // Convert to milliseconds
      }
    } catch (error) {
      console.error('Error checking quiz availability:', error);
      // Don't block quiz if check fails - let user try
      setCanPlayQuiz(true);
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

  const startQuiz = async () => {
    // Load fresh random questions
    await loadUsedQuestions();
    
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
      if (currentQuestion < quizQuestions.length - 1) {
        nextQuestion();
      } else {
        finishQuiz(score);
      }
    }, 2000);
  };

  const selectAnswer = (index: number) => {
    if (selectedAnswer !== null || showExplanation) return;
    
    setSelectedAnswer(index);
    const isCorrect = index === quizQuestions[currentQuestion].correctAnswer;
    
    const newScore = isCorrect ? score + 1 : score;
    
    if (isCorrect) {
      setScore(newScore);
      setBackgroundImage(QUIZ_IMAGES.correct);
    } else {
      setBackgroundImage(QUIZ_IMAGES.wrong);
    }
    
    setShowExplanation(true);
    
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
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
    setIsInActiveFight(false); // Show tab bar again
    
    // Save used questions to avoid repeats
    await saveUsedQuestions(quizQuestions);
    
    const allCorrect = finalScore === quizQuestions.length;
    
    if (allCorrect) {
      setBackgroundImage(QUIZ_IMAGES.victory);
      
      // Store locally that reward is pending claim (always store, regardless of blockchain)
      await AsyncStorage.setItem('pending_quiz_reward', QUIZ_REWARD.toString());
      
      // Try to submit to blockchain when all answers are correct
      if (wallet.publicKey && wallet.connection && wallet.connected) {
        try {
          const programId = new PublicKey(process.env.EXPO_PUBLIC_PROGRAM_ID || 'GhESwjzEv3C3qKQJKjAfhaq5GFK5vDLaku8tPqCKGzYR');
          const quizService = new QuizService(wallet.connection, programId);
          
          // Initialize quiz state if needed
          const quizState = await quizService.getQuizState(wallet.publicKey);
          if (!quizState) {
            console.log('Initializing quiz state...');
            await quizService.initializeQuiz(wallet.publicKey, wallet.authToken);
          }
          
          // Submit quiz result to blockchain
          console.log('Submitting quiz to blockchain...');
          await quizService.submitQuiz(wallet.publicKey, true, wallet.authToken);
          
          showToast(`Perfect! You earned ${QUIZ_REWARD} SOL! Go to Rewards to claim.`, 'success');
        } catch (error: any) {
          console.error('Blockchain submission error:', error);
          
          // Show user-friendly error message but still keep local reward
          if (error.message?.includes('Network request failed')) {
            showToast(`Perfect! Reward saved. Network error - claim later.`, 'success');
          } else if (error.message?.includes('CooldownNotExpired')) {
            showToast('You already completed quiz today. Come back in 24 hours!', 'error');
            // Remove local reward if cooldown not expired
            await AsyncStorage.removeItem('pending_quiz_reward');
          } else if (error.message?.includes('cancelled')) {
            showToast(`Perfect! You earned ${QUIZ_REWARD} SOL! Go to Rewards to claim.`, 'success');
          } else {
            showToast(`Perfect! You earned ${QUIZ_REWARD} SOL! Go to Rewards to claim.`, 'success');
          }
        }
      } else {
        showToast(`Perfect! You earned ${QUIZ_REWARD} SOL! Go to Rewards to claim.`, 'success');
      }
      
      setCanPlayQuiz(false);
      updateCooldownTime(QUIZ_COOLDOWN);
    } else {
      // Store incomplete quiz locally, don't submit to blockchain
      setBackgroundImage(QUIZ_IMAGES.loose);
      
      // Store locally only - no blockchain submission for incomplete quiz
      await AsyncStorage.setItem('last_quiz_attempt', JSON.stringify({
        score: finalScore,
        total: quizQuestions.length,
        timestamp: Date.now()
      }));
      
      showToast(`You got ${finalScore}/${quizQuestions.length}. Get all correct to earn rewards!`, 'info');
      
      setCanPlayQuiz(false);
      updateCooldownTime(QUIZ_COOLDOWN);
    }
  };

  const handleBackPress = () => {
    if (quizState === 'playing') {
      setShowQuitDialog(true);
    } else {
      navigation.goBack();
    }
  };

  const handleQuitQuiz = () => {
    setShowQuitDialog(false);
    setQuizState('ready');
    setIsInActiveFight(false);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setBackgroundImage(QUIZ_IMAGES.bg);
  };

  const getAnswerStyle = (index: number) => {
    if (!showExplanation) {
      return selectedAnswer === index ? 'border-[#9945FF] bg-[#9945FF]/20' : 'border-[#2a2a3e]';
    }
    
    if (index === quizQuestions[currentQuestion]?.correctAnswer) {
      return 'border-[#14F195] bg-[#14F195]/20';
    }
    
    if (selectedAnswer === index && index !== quizQuestions[currentQuestion]?.correctAnswer) {
      return 'border-[#FF6B6B] bg-[#FF6B6B]/20';
    }
    
    return 'border-[#2a2a3e]';
  };

  if (isLoading || !imagesLoaded || quizQuestions.length === 0) {
    return (
      <View className="flex-1 bg-[#0f0f1e] items-center justify-center">
        <ActivityIndicator size="large" color="#9945FF" />
        <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg mt-4">
          {!imagesLoaded ? 'Loading Quiz...' : 'Preparing Questions...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Quit Quiz Confirmation Dialog */}
      <ConfirmDialog
        visible={showQuitDialog}
        title="QUIT-QUIZT!!"
        message="Are you sure you want to quit? Your progress will be lost!"
        confirmText="YES, QUIT"
        cancelText="NO, CONTINUE"
        onConfirm={handleQuitQuiz}
        onCancel={() => setShowQuitDialog(false)}
      />
      
      <OptimizedImage
        source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
        showLoader={false}
      />
      <View className="flex-1 bg-black/60">
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="p-5 flex-1">
            
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6 mt-2">
              <TouchableOpacity
                onPress={handleBackPress}
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
                <View className="w-24 h-24 bg-[#14F195] rounded-full items-center justify-center mb-6" style={{
                  shadowColor: '#14F195',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.6,
                  shadowRadius: 12,
                  elevation: 8,
                }}>
                  <Ionicons name="flash" size={48} color="#0f0f1e" />
                </View>
                
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-3xl text-center mb-3">
                Answer {QUESTIONS_PER_QUIZ} questions about Solana & Seeker tokens
                </Text>
                
               

                <View className="bg-[#1a1a2e]/80 rounded-2xl p-6 mb-8 w-full border border-[#2a2a3e]">
                  <View className="flex-row items-center mb-4">
                    <Ionicons name="trophy" size={24} color="#FFD700" />
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg ml-3">
                      Rewards:
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
              <View className="flex-1" key={currentQuestion}>
                {/* Progress */}
                <View className="mb-6">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="bg-[#14F195]/20 border-2 border-[#14F195] rounded-xl px-3 py-1.5">
                      <Text 
                        style={{ fontFamily: 'Bangers' }} 
                        className="text-[#14F195] text-base"
                        numberOfLines={1}
                      >
                        {`${currentQuestion + 1}/${quizQuestions.length}`}
                      </Text>
                    </View>
                    <View className="flex-row items-center bg-[#1a1a2e]/80 rounded-xl px-4 py-2 border border-[#2a2a3e]">
                      <Ionicons name="time" size={20} color={timeRemaining <= 10 ? '#FF6B6B' : '#14F195'} />
                      <Text style={{ fontFamily: 'Bangers' }} className={`text-xl ml-2 ${timeRemaining <= 10 ? 'text-[#FF6B6B]' : 'text-[#14F195]'}`}>
                        {timeRemaining}s
                      </Text>
                    </View>
                  </View>
                  <View className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                    <View 
                      className="h-full bg-[#14F195]"
                      style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </View>
                </View>

                {/* Question */}
                <View className="bg-[#14F195]/10 rounded-2xl p-6 mb-6 border-2 border-[#14F195]">
                  <Text style={{ fontFamily: 'Bangers' }} className="text-[#14F195] text-sm mb-2 uppercase tracking-wider">
                    Question {currentQuestion + 1}
                  </Text>
                  <Text style={{ fontFamily: 'Bangers' }} className="text-white text-2xl leading-8">
                    {quizQuestions[currentQuestion]?.question}
                  </Text>
                </View>

                {/* Options */}
                <View className="gap-4 mb-6">
                  {quizQuestions[currentQuestion]?.options.map((option: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => selectAnswer(index)}
                      disabled={selectedAnswer !== null}
                      className={`bg-[#0a0a1a] rounded-xl p-5 border-2 ${getAnswerStyle(index)}`}
                    >
                      <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-[#14F195]/20 border-2 border-[#14F195] items-center justify-center mr-3">
                          <Text style={{ fontFamily: 'Bangers' }} className="text-[#14F195] text-base">
                            {String.fromCharCode(65 + index)}
                          </Text>
                        </View>
                        <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg flex-1">
                          {option}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Explanation */}
                {showExplanation && (
                  <View className={`rounded-2xl p-5 border-2 ${
                    selectedAnswer === quizQuestions[currentQuestion]?.correctAnswer
                      ? 'bg-[#14F195]/20 border-[#14F195]'
                      : 'bg-[#FF6B6B]/20 border-[#FF6B6B]'
                  }`}>
                    <View className="flex-row items-center mb-2">
                      <Ionicons 
                        name={selectedAnswer === quizQuestions[currentQuestion]?.correctAnswer ? 'checkmark-circle' : 'close-circle'} 
                        size={24} 
                        color={selectedAnswer === quizQuestions[currentQuestion]?.correctAnswer ? '#14F195' : '#FF6B6B'} 
                      />
                      <Text style={{ fontFamily: 'Bangers' }} className={`text-lg ml-2 ${
                        selectedAnswer === quizQuestions[currentQuestion]?.correctAnswer ? 'text-[#14F195]' : 'text-[#FF6B6B]'
                      }`}>
                        {selectedAnswer === quizQuestions[currentQuestion]?.correctAnswer ? 'Correct!' : 'Wrong!'}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white text-base">
                      {quizQuestions[currentQuestion]?.explanation}
                    </Text>
                  </View>
                )}


              </View>
            )}

            {/* Result State */}
            {quizState === 'result' && (
              <View className="flex-1 justify-center items-center px-5">
                <Text style={{ fontFamily: 'Bangers' }} className="text-white text-4xl text-center mb-3">
                  {score === quizQuestions.length ? 'Perfect Score!' : 'Quiz Complete!'}
                </Text>
                
                <Text style={{ fontFamily: 'Bangers' }} className="text-gray-300 text-2xl text-center mb-8">
                  You got {score}/{quizQuestions.length} correct
                </Text>

                {score === quizQuestions.length ? (
                  <View className="bg-[#14F195]/20 border-2 border-[#14F195] rounded-2xl p-6 mb-6 w-full">
                    <View className="flex-row items-center justify-center mb-2">
                      <Ionicons name="trophy" size={32} color="#FFD700" />
                      <Text style={{ fontFamily: 'Bangers' }} className="text-[#14F195] text-2xl ml-3">
                        Reward Earned!
                      </Text>
                    </View>
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white text-xl text-center mb-4">
                      +{QUIZ_REWARD} SOL
                    </Text>
                    
                    {/* Claim Reward Button */}
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Rewards')}
                      className="bg-[#14F195] rounded-xl py-4 mt-2"
                      style={{
                        shadowColor: '#14F195',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.5,
                        shadowRadius: 8,
                        elevation: 5,
                      }}
                    >
                      <View className="flex-row items-center justify-center">
                        <Ionicons name="gift" size={24} color="#000" />
                        <Text style={{ fontFamily: 'Bangers' }} className="text-black text-xl ml-2">
                          CLAIM REWARD NOW!
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="bg-[#FF6B6B]/20 border-2 border-[#FF6B6B] rounded-2xl p-6 mb-8 w-full">
                    <Text style={{ fontFamily: 'Bangers' }} className="text-white text-lg text-center">
                      Get all answers correct to earn rewards!
                    </Text>
                  </View>
                )}

                <Text style={{ fontFamily: 'Bangers' }} className="text-gray-400 text-base text-center mb-6">
                  {score === quizQuestions.length ? 'Reward added to your account!' : 'Come back in 24 hours for another chance'}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});
