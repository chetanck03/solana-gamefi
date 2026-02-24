import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onHide: () => void;
}

export default function Toast({ visible, message, type = 'success', onHide }: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: '#14F195',
          bgColor: '#14F195',
        };
      case 'error':
        return {
          icon: 'close-circle' as const,
          color: '#FF6B6B',
          bgColor: '#FF6B6B',
        };
      case 'info':
        return {
          icon: 'information-circle' as const,
          color: '#9945FF',
          bgColor: '#9945FF',
        };
    }
  };

  const config = getConfig();

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View
        className="bg-[#1a1a2e] rounded-2xl p-4 flex-row items-center border-2"
        style={{
          borderColor: config.bgColor,
          shadowColor: config.bgColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.6,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: `${config.bgColor}20` }}
        >
          <Ionicons name={config.icon} size={28} color={config.color} />
        </View>
        <Text className="text-white font-semibold text-base flex-1">
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
