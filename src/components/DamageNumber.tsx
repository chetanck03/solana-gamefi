import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface DamageNumberProps {
  damage: number;
  isPlayer: boolean;
  isCritical?: boolean;
  onComplete: () => void;
}

export default function DamageNumber({ damage, isPlayer, isCritical = false, onComplete }: DamageNumberProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: isCritical ? 1.5 : 1,
          useNativeDriver: true,
          friction: 3,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 500,
          delay: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => onComplete());
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale: scaleAnim }],
          opacity: opacityAnim,
          [isPlayer ? 'bottom' : 'top']: '50%',
        },
      ]}
    >
      <Text
        style={[
          styles.damageText,
          {
            color: isCritical ? '#FFD700' : '#FF4444',
            fontSize: isCritical ? 48 : 36,
          },
        ]}
      >
        -{damage}
      </Text>
      {isCritical && (
        <Text style={styles.criticalText}>CRITICAL!</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
  },
  damageText: {
    fontFamily: 'Bangers',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
  criticalText: {
    fontFamily: 'Bangers',
    fontSize: 16,
    color: '#FFD700',
    marginTop: -8,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});
