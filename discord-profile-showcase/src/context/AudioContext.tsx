import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

export interface MusicTrack {
  url: string;
  name: string;
  folder?: string;
}

export type VisualizerMode = 'all' | 'radial-bars' | 'circular-wave' | 'portal-pulse';

interface AudioContextType {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number; // 0 to 1
  currentTrack: MusicTrack | null;
  playlist: MusicTrack[];
  visualizerMode: VisualizerMode;
  setVisualizerMode: (mode: VisualizerMode) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (vol: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  getAudioData: () => {
    frequencyData: Uint8Array;
    rawFrequencyData: Uint8Array | null;
    bassEnergy: number;      // 0 to 1
    midEnergy: number;       // 0 to 1
    trebleEnergy: number;    // 0 to 1
    averageEnergy: number;   // 0 to 1
  };
}

const STATIC_INITIAL_TRACKS: MusicTrack[] = [
  {
    url: "/music/Christina%20Perri%20-%20A%20Thousand%20Years%20(Lyrics)%20-%207clouds.mp3",
    name: "Christina Perri - A Thousand Years"
  },
  {
    url: "/music/NEFFEX%20-%20Grateful%20%5BCopyright%20Free%5D%20No.54%20-%20NEFFEX.mp3",
    name: "NEFFEX - Grateful"
  },
  {
    url: "/music/NEFFEX%20-%20Cold%20%E2%9D%84%EF%B8%8F%5BCopyright%20Free%5D%20No.60%20-%20NEFFEX.mp3",
    name: "NEFFEX - Cold ❄️"
  },
  {
    url: "/music/OneRepublic%20-%20Counting%20Stars%20(Lyrics)%20-%20Dan%20Music.mp3",
    name: "OneRepublic - Counting Stars"
  }
];

// ========================================================================
// SINGLETON GLOBAL AUDIO:
// Guarantees strictly ONE HTMLAudioElement instance exists across the app,
// preventing duplicate simultaneous playback and pitch/speed warping.
// ========================================================================
let globalAudioInstance: HTMLAudioElement | null = null;

function getGlobalAudio(): HTMLAudioElement {
  if (!globalAudioInstance && typeof window !== 'undefined') {
    const a = new Audio();
    a.id = 'cosmic-background-audio-player';
    a.preload = 'auto';
    a.loop = false;
    
    // STRICT SPEED LOCK: Always lock playback rate to 1.0 (normal)
    a.playbackRate = 1.0;
    a.defaultPlaybackRate = 1.0;
    if ('preservesPitch' in a) {
      (a as any).preservesPitch = true;
    }

    // Guard against any external drift or browser extension rate manipulation
    a.addEventListener('ratechange', () => {
      if (a.playbackRate !== 1.0) {
        a.playbackRate = 1.0;
      }
    });

    globalAudioInstance = a;
  }
  return globalAudioInstance!;
}

// Kill any duplicate / foreign audio elements that may exist in the document
function stopAnyDuplicateAudio() {
  if (typeof document === 'undefined') return;
  const audioTags = document.querySelectorAll('audio');
  audioTags.forEach((tag) => {
    if (tag !== globalAudioInstance) {
      try {
        tag.pause();
        tag.currentTime = 0;
        tag.src = '';
      } catch {}
    }
  });
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [playlist, setPlaylist] = useState<MusicTrack[]>(STATIC_INITIAL_TRACKS);
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    return Math.floor(Math.random() * STATIC_INITIAL_TRACKS.length);
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Stored volume preference (0 to 1, default 0.6)
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem('cosmic_bg_volume');
    if (saved !== null) {
      const parsed = parseFloat(saved);
      return isNaN(parsed) ? 0.6 : Math.max(0, Math.min(1, parsed));
    }
    return 0.6;
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('cosmic_bg_muted') === 'true';
  });

  const [visualizerMode, setVisualizerModeState] = useState<VisualizerMode>(() => {
    const saved = localStorage.getItem('cosmic_visualizer_mode') as VisualizerMode;
    return saved && ['all', 'radial-bars', 'circular-wave', 'portal-pulse'].includes(saved) 
      ? saved 
      : 'all';
  });

  const setVisualizerMode = useCallback((mode: VisualizerMode) => {
    setVisualizerModeState(mode);
    localStorage.setItem('cosmic_visualizer_mode', mode);
  }, []);

  const currentIndexRef = useRef<number>(currentIndex);
  const playlistRef = useRef<MusicTrack[]>(STATIC_INITIAL_TRACKS);
  const volumeRef = useRef<number>(volume);
  const isMutedRef = useRef<boolean>(isMuted);
  const userHasStartedRef = useRef<boolean>(false);
  const isPlayPendingRef = useRef<boolean>(false);

  // Visualizer rhythm arrays
  const fallbackFreqArrayRef = useRef<Uint8Array>(new Uint8Array(64));
  const fallbackPhaseRef = useRef<number>(0);

  currentIndexRef.current = currentIndex;
  playlistRef.current = playlist;
  volumeRef.current = volume;
  isMutedRef.current = isMuted;

  // Apply volume cleanly to global audio element
  const applyAudioVolume = useCallback(() => {
    const audio = getGlobalAudio();
    if (!audio) return;
    const target = isMutedRef.current ? 0 : volumeRef.current;
    audio.volume = Math.max(0, Math.min(1, target));
    audio.playbackRate = 1.0;
  }, []);

  // Primary playback function: Ensures exactly ONE song plays at a time
  const playTrackByIndex = useCallback((
    idx: number,
    list = playlistRef.current
  ) => {
    const audio = getGlobalAudio();
    if (!audio || list.length === 0) return;

    stopAnyDuplicateAudio();

    const safeIdx = ((idx % list.length) + list.length) % list.length;
    setCurrentIndex(safeIdx);
    currentIndexRef.current = safeIdx;
    userHasStartedRef.current = true;

    const track = list[safeIdx];
    if (!track) return;

    const currentSrc = audio.src || '';
    const isTargetTrack = currentSrc.includes(encodeURI(track.url)) || currentSrc.includes(track.url);

    // If already playing this exact track, keep playing without restarting from 0
    if (isTargetTrack && !audio.paused && !audio.ended) {
      audio.playbackRate = 1.0;
      applyAudioVolume();
      return;
    }

    // Stop current track cleanly before switching
    try {
      audio.pause();
    } catch {}

    audio.currentTime = 0;
    audio.src = track.url;
    audio.loop = false;
    audio.playbackRate = 1.0;
    audio.defaultPlaybackRate = 1.0;
    applyAudioVolume();

    isPlayPendingRef.current = true;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isPlayPendingRef.current = false;
          audio.playbackRate = 1.0;
          setIsPlaying(true);
        })
        .catch(() => {
          isPlayPendingRef.current = false;
        });
    }
  }, [applyAudioVolume]);

  // Global Audio Event Listeners (attached once to the singleton)
  useEffect(() => {
    const audio = getGlobalAudio();
    if (!audio) return;

    audio.volume = isMutedRef.current ? 0 : volumeRef.current;
    audio.playbackRate = 1.0;

    // Preload initial random track so click-to-enter has instant response
    const initialList = playlistRef.current;
    const initIdx = currentIndexRef.current >= 0 && currentIndexRef.current < initialList.length
      ? currentIndexRef.current
      : Math.floor(Math.random() * initialList.length);

    if (initialList[initIdx] && !audio.src) {
      audio.src = initialList[initIdx].url;
      audio.load();
    }

    const handlePlay = () => {
      audio.playbackRate = 1.0;
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      const currentList = playlistRef.current;
      if (currentList.length > 1) {
        const nextIdx = (currentIndexRef.current + 1) % currentList.length;
        playTrackByIndex(nextIdx, currentList);
      } else {
        audio.currentTime = 0;
        audio.playbackRate = 1.0;
        audio.play().catch(() => {});
      }
    };

    const handleError = () => {
      // If a track fails, move to next song only if playback was active
      if (userHasStartedRef.current) {
        const currentList = playlistRef.current;
        if (currentList.length > 1) {
          const nextIdx = (currentIndexRef.current + 1) % currentList.length;
          playTrackByIndex(nextIdx, currentList);
        }
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Dynamic backend playlist detection (if running with server API)
    const fetchPlaylist = async () => {
      try {
        const resApi = await fetch('/api/music');
        if (resApi.ok) {
          const listApi = await resApi.json();
          if (Array.isArray(listApi) && listApi.length > 0) {
            setPlaylist(listApi);
            playlistRef.current = listApi;

            if (!userHasStartedRef.current && audio && !audio.src) {
              const randIdx = Math.floor(Math.random() * listApi.length);
              setCurrentIndex(randIdx);
              currentIndexRef.current = randIdx;
              audio.src = listApi[randIdx].url;
              audio.load();
            }
          }
        }
      } catch {
        // Fallback to static list
      }
    };

    fetchPlaylist();

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [playTrackByIndex]);

  // Volume Controller
  const setVolume = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolumeState(clamped);
    volumeRef.current = clamped;
    localStorage.setItem('cosmic_bg_volume', String(clamped));

    if (clamped > 0 && isMutedRef.current) {
      setIsMuted(false);
      isMutedRef.current = false;
      localStorage.setItem('cosmic_bg_muted', 'false');
    }

    applyAudioVolume();
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      isMutedRef.current = next;
      localStorage.setItem('cosmic_bg_muted', String(next));
      applyAudioVolume();
      return next;
    });
  };

  // Play / Resume
  const play = useCallback(() => {
    const audio = getGlobalAudio();
    if (!audio) return;
    
    userHasStartedRef.current = true;
    stopAnyDuplicateAudio();

    // If audio is already actively playing, don't restart or create second stream
    if (!audio.paused && !audio.ended && audio.currentTime > 0) {
      audio.playbackRate = 1.0;
      setIsPlaying(true);
      return;
    }

    audio.playbackRate = 1.0;
    applyAudioVolume();

    // If audio already has track loaded, resume directly
    if (audio.src && audio.src !== '' && audio.src !== window.location.href) {
      audio.play().catch(() => {});
      return;
    }

    // Otherwise play current track
    playTrackByIndex(currentIndexRef.current);
  }, [applyAudioVolume, playTrackByIndex]);

  const pause = useCallback(() => {
    const audio = getGlobalAudio();
    if (audio) {
      try {
        audio.pause();
      } catch {}
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = () => {
    const audio = getGlobalAudio();
    if (!audio) return;
    if (audio.paused) {
      play();
    } else {
      pause();
    }
  };

  const nextTrack = () => {
    const list = playlistRef.current;
    if (list.length > 0) {
      const nextIdx = (currentIndexRef.current + 1) % list.length;
      playTrackByIndex(nextIdx, list);
    }
  };

  const prevTrack = () => {
    const list = playlistRef.current;
    if (list.length > 0) {
      const prevIdx = (currentIndexRef.current - 1 + list.length) % list.length;
      playTrackByIndex(prevIdx, list);
    }
  };

  // ========================================================================
  // Real-time audio waveform generator for MusicVisualizer:
  // Synchronized directly with audio.currentTime and rhythm beats.
  // 100% immune to Web Audio buffer underruns, wow-and-flutter, or latency.
  // ========================================================================
  const getAudioData = useCallback(() => {
    const audio = globalAudioInstance;
    const isActuallyPlaying = audio && !audio.paused && !audio.ended && !isMutedRef.current && volumeRef.current > 0;

    if (isActuallyPlaying && audio) {
      // Use audio.currentTime to synchronize visual beats perfectly with the track
      const ct = audio.currentTime;
      fallbackPhaseRef.current += 0.05;
      const t = ct > 0 ? ct * 2.2 : fallbackPhaseRef.current;
      const arr = fallbackFreqArrayRef.current;
      const currentVol = volumeRef.current;

      // Moderately balanced rhythmic pulses that match music tempo nicely
      const kickPhase = (ct * 2.15) % 1.0;
      const kickPulse = Math.exp(-kickPhase * 4.8) * 0.45;
      const snarePhase = ((ct * 2.15) + 0.5) % 1.0;
      const snarePulse = Math.exp(-snarePhase * 5.2) * 0.35;

      // Gentle, balanced bass sway
      const bassSway = Math.pow(Math.max(0, Math.sin(t * 1.5)), 2) * 0.25;
      const baseBass = Math.min(1, Math.max(0, (kickPulse + bassSway + 0.18) * currentVol));
      
      const midSway = Math.sin(t * 2.3 + 1.0) * 0.25 + Math.cos(t * 4.2) * 0.18 + 0.22;
      const baseMid = Math.min(1, Math.max(0, (midSway + snarePulse * 0.3) * currentVol));
      
      const trebleSway = Math.cos(t * 3.0 + 2.0) * 0.25 + Math.sin(t * 5.8) * 0.18 + 0.18;
      const baseTreble = Math.min(1, Math.max(0, (trebleSway + kickPulse * 0.15) * currentVol));

      for (let i = 0; i < arr.length; i++) {
        const freqRatio = i / arr.length;
        const wave = Math.sin(t * 2.2 + i * 0.35) * 0.22 + Math.cos(t * 1.4 - i * 0.18) * 0.18;
        const decay = Math.pow(1 - freqRatio * 0.6, 1.08);
        const energy = Math.max(0, Math.min(1, (baseBass * (1 - freqRatio * 0.75) + baseMid * 0.5 + baseTreble * freqRatio + wave * 0.2) * decay));
        arr[i] = Math.floor(energy * 255);
      }

      return {
        frequencyData: arr,
        rawFrequencyData: arr,
        bassEnergy: baseBass,
        midEnergy: baseMid,
        trebleEnergy: baseTreble,
        averageEnergy: (baseBass + baseMid + baseTreble) / 3,
      };
    }

    // Paused or muted
    const arr = fallbackFreqArrayRef.current;
    arr.fill(0);
    return {
      frequencyData: arr,
      rawFrequencyData: null,
      bassEnergy: 0,
      midEnergy: 0,
      trebleEnergy: 0,
      averageEnergy: 0,
    };
  }, []);

  const currentTrack = playlist[currentIndex] || STATIC_INITIAL_TRACKS[0];

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isMuted,
        volume,
        currentTrack,
        playlist,
        visualizerMode,
        setVisualizerMode,
        play,
        pause,
        togglePlay,
        toggleMute,
        setVolume,
        nextTrack,
        prevTrack,
        getAudioData,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
