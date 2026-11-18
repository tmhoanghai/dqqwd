import React, { useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { MusicVisualizer } from './MusicVisualizer';

export interface BackgroundMusicHandle {
  play: () => void;
  pause: () => void;
}

interface BackgroundMusicProps {
  isStarted?: boolean;
}

export const BackgroundMusic = forwardRef<BackgroundMusicHandle, BackgroundMusicProps>(function BackgroundMusic(
  { isStarted = false },
  ref
) {
  const { play, pause } = useAudio();
  const hasTriggeredRef = useRef(false);

  useImperativeHandle(ref, () => ({
    play: () => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        play();
      }
    },
    pause: () => {
      pause();
    }
  }));

  // Trigger play only when isStarted prop becomes true for the first time if not already triggered
  useEffect(() => {
    if (isStarted && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      play();
    }
  }, [isStarted, play]);

  return <MusicVisualizer />;
});

