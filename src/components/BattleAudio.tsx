import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

interface BattleAudioProps {
  isPlaying: boolean;
  source: any;
}

export default function BattleAudio({ isPlaying, source }: BattleAudioProps) {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let isMounted = true;

    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          source,
          { isLooping: true, volume: 0.5 },
          null
        );

        if (isMounted) {
          soundRef.current = sound;
          if (isPlaying) {
            await sound.playAsync();
          }
        }
      } catch (error) {
        console.log('Error loading audio:', error);
      }
    };

    setupAudio();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [source]);

  useEffect(() => {
    const controlPlayback = async () => {
      if (soundRef.current) {
        try {
          if (isPlaying) {
            await soundRef.current.playAsync();
          } else {
            await soundRef.current.pauseAsync();
          }
        } catch (error) {
          console.log('Error controlling playback:', error);
        }
      }
    };

    controlPlayback();
  }, [isPlaying]);

  return null;
}
