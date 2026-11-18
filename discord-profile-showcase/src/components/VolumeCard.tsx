import React from 'react';
import { 
  Volume2, 
  Volume1, 
  VolumeX, 
  Play, 
  Pause,
  SkipForward, 
  SkipBack,
  X, 
  Music
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface VolumeCardProps {
  onClose: () => void;
}

export function VolumeCard({ onClose }: VolumeCardProps) {
  const { 
    volume, 
    setVolume, 
    isMuted, 
    toggleMute, 
    isPlaying, 
    togglePlay, 
    nextTrack,
    prevTrack,
    playlist
  } = useAudio();

  const volumePercent = isMuted ? 0 : Math.round(volume * 100);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  const handlePreset = (preset: number) => {
    if (preset === 0) {
      if (!isMuted) toggleMute();
    } else {
      setVolume(preset / 100);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto select-none font-mono">
      <div className="relative rounded-2xl bg-[#070b13]/95 border border-purple-500/40 p-4 shadow-[0_0_35px_rgba(168,85,247,0.25)] backdrop-blur-2xl transition-all duration-300">
        
        {/* Futuristic Corner Brackets */}
        <div className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 border-purple-400 rounded-tl-2xl opacity-80 pointer-events-none" />
        <div className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 border-purple-400 rounded-br-2xl opacity-80 pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold tracking-wider uppercase">
            <Music className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>ÂM LƯỢNG & ĐIỀU KHIỂN</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Volume Level & Master Slider */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <span className="font-semibold text-zinc-300">Âm lượng:</span>
            </span>
            <span className="text-purple-300 font-bold font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-xs">
              {volumePercent}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Speaker Mute/Unmute Toggle Button */}
            <button
              type="button"
              onClick={toggleMute}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isMuted || volume === 0
                  ? 'bg-rose-950/50 border-rose-500/40 text-rose-400 hover:bg-rose-900/60'
                  : 'bg-purple-950/50 border-purple-500/40 text-purple-300 hover:bg-purple-900/60'
              }`}
              title={isMuted ? "Bật tiếng" : "Tắt tiếng"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Custom Styled Slider */}
            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleSliderChange}
                className="w-full h-2 bg-black/60 rounded-lg appearance-none cursor-pointer accent-purple-400 border border-purple-500/30 focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #a855f7 0%, #06b6d4 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
            </div>
          </div>
        </div>

        {/* Quick Volume Presets */}
        <div className="grid grid-cols-5 gap-1.5 mb-3.5">
          {[
            { label: 'Tắt', value: 0 },
            { label: '25%', value: 25 },
            { label: '50%', value: 50 },
            { label: '75%', value: 75 },
            { label: '100%', value: 100 },
          ].map(p => {
            const isActive = !isMuted && Math.abs(volume * 100 - p.value) < 3;
            const isMuteActive = (isMuted || volume === 0) && p.value === 0;

            return (
              <button
                key={p.value}
                type="button"
                onClick={() => handlePreset(p.value)}
                className={`py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                  isActive || isMuteActive
                    ? 'bg-purple-900/80 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-purple-500/40 hover:bg-zinc-800/80'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Bottom Playback Controls */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs">
          <div className="flex items-center gap-1.5">
            {/* Prev Track */}
            {playlist.length > 1 && (
              <button
                type="button"
                onClick={prevTrack}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-purple-500/40 transition-colors"
                title="Bài trước"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Play / Pause Toggle */}
            <button
              type="button"
              onClick={togglePlay}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-purple-950/80 border-purple-500/50 text-purple-200 hover:bg-purple-900 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
              title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play</span>
                </>
              )}
            </button>

            {/* Next Track Button */}
            {playlist.length > 1 && (
              <button
                type="button"
                onClick={nextTrack}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-purple-500/40 transition-colors"
                title="Bài tiếp theo"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
            <span>{playlist.length} bài hát</span>
          </div>
        </div>

      </div>
    </div>
  );
}
