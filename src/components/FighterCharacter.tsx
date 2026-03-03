import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FighterType } from '../types';
import OptimizedImage from './OptimizedImage';

interface FighterCharacterProps {
  type: FighterType;
  isPlayer: boolean;
  isAttacking: boolean;
  isBlocking: boolean;
  isHit: boolean;
  isDead: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl?: any;
}

export default function FighterCharacter({
  type,
  isPlayer,
  isAttacking,
  isBlocking,
  isHit,
  isDead,
  rarity,
  imageUrl,
}: FighterCharacterProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const rarityColors = {
    common: '#888888',
    rare: '#4ECDC4',
    epic: '#9945FF',
    legendary: '#FFD700',
  };

  const typeIcons = {
    warrior: 'shield',
    mage: 'flash',
    archer: 'arrow-forward',
    tank: 'cube',
    assassin: 'eye',
  };

  // Idle animation
  useEffect(() => {
    if (!isAttacking && !isBlocking && !isHit && !isDead) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isAttacking, isBlocking, isHit, isDead]);

  // Attack animation
  useEffect(() => {
    if (isAttacking) {
      const direction = isPlayer ? 1 : -1;
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 30 * direction,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: direction * 15,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isAttacking]);

  // Block animation
  useEffect(() => {
    if (isBlocking) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isBlocking]);

  // Hit animation
  useEffect(() => {
    if (isHit) {
      const direction = isPlayer ? -1 : 1;
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 20 * direction,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.5,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isHit]);

  // Death animation
  useEffect(() => {
    if (isDead) {
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: isPlayer ? -90 : 90,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 50,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isDead]);

  const rotation = rotateAnim.interpolate({
    inputRange: [-90, 90],
    outputRange: ['-90deg', '90deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX },
            { translateY },
            { scale: scaleAnim },
            { rotate: rotation },
            { scaleX: isPlayer ? 1 : -1 },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Character Body */}
      <View
        style={[
          styles.body,
          {
            backgroundColor: imageUrl ? 'transparent' : rarityColors[rarity],
            borderColor: isBlocking ? '#3B82F6' : rarityColors[rarity],
            borderWidth: isBlocking ? 4 : 2,
          },
        ]}
      >
        {imageUrl ? (
          <OptimizedImage 
            source={imageUrl}
            style={styles.characterImage}
            resizeMode="cover"
            fallbackIcon={<Ionicons name={typeIcons[type] as any} size={48} color="#fff" />}
          />
        ) : (
          <Ionicons name={typeIcons[type] as any} size={48} color="#fff" />
        )}
      </View>

      {/* Weapon/Effect */}
      {isAttacking && (
        <View
          style={[
            styles.weapon,
            { right: isPlayer ? -20 : undefined, left: isPlayer ? undefined : -20 },
          ]}
        >
          <Ionicons name="flash" size={24} color="#FFD700" />
        </View>
      )}

      {/* Shield Effect */}
      {isBlocking && (
        <View style={styles.shield}>
          <Ionicons name="shield-checkmark" size={32} color="#3B82F6" />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  weapon: {
    position: 'absolute',
    top: 20,
  },
  shield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
