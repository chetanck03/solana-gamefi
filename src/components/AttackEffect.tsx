import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AttackEffectProps {
  type: 'light' | 'heavy' | 'special' | 'hit';
  fromPlayer: boolean;
  onComplete: () => void;
}

export default function AttackEffect({ type, fromPlayer, onComplete }: AttackEffectProps) {
  const translateX = useRef(new Animated.Value(fromPlayer ? -100 : 100)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (type === 'hit') {
      // Hit impact effect
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onComplete());
    } else {
      // Projectile effect
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: fromPlayer ? 100 : -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => onComplete());
    }
  }, []);

  const getEffectIcon = () => {
    switch (type) {
      case 'light':
        return { name: 'flash-outline', color: '#14F195', size: 32 };
      case 'heavy':
        return { name: 'flame', color: '#FFB800', size: 40 };
      case 'special':
        return { name: 'nuclear', color: '#9945FF', size: 48 };
      case 'hit':
        return { name: 'close-circle', color: '#FF4444', size: 56 };
    }
  };

  const effect = getEffectIcon();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX }, { scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Ionicons name={effect.name as any} size={effect.size} color={effect.color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
