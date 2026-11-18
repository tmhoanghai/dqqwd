import React, { useState, useEffect } from 'react';
import { LanyardData, PortfolioData, DiscordActivity } from '../types';
import { Music, Play, Laptop, ExternalLink, Mail, Check, MessageSquare, AlertCircle } from 'lucide-react';

interface DiscordProfileModalProps {
  lanyardData: LanyardData | null;
  portfolio: PortfolioData;
  isLoading: boolean;
  onSendMessage?: () => void;
}

export function DiscordProfileModal({ lanyardData, portfolio, isLoading, onSendMessage }: DiscordProfileModalProps) {
  const [spotifyProgress, setSpotifyProgress] = useState<number>(0);
  const [spotifyTimer, setSpotifyTimer] = useState<string>('0:00');
  const [spotifyTotal, setSpotifyTotal] = useState<string>('0:00');

  const user = lanyardData?.discord_user;
  const status = lanyardData?.discord_status || 'offline';
  const customStatus = lanyardData?.activities.find(act => act.type === 4);
  const gameActivity = lanyardData?.activities.find(act => act.type === 0);
  const spotify = lanyardData?.spotify;

  // Track Spotify audio progress
  useEffect(() => {
    if (!spotify) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const start = spotify.timestamps.start;
      const end = spotify.timestamps.end;
      const total = end - start;
      const current = now - start;

      if (current >= total) {
        setSpotifyProgress(100);
        clearInterval(interval);
        return;
      }

      const percent = Math.min(100, Math.max(0, (current / total) * 100));
      setSpotifyProgress(percent);

      const formatTime = (ms: number) => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      };

      setSpotifyTimer(formatTime(current));
      setSpotifyTotal(formatTime(total));
    }, 1000);

    return () => clearInterval(interval);
  }, [spotify]);

  const getStatusColor = (statusStr: string) => {
    switch (statusStr) {
      case 'online': return 'bg-emerald-500';
      case 'idle': return 'bg-amber-500';
      case 'dnd': return 'bg-rose-500';
      case 'offline': return 'bg-zinc-500';
      case 'streaming': return 'bg-purple-500';
      default: return 'bg-zinc-500';
    }
  };

  const getStatusName = (statusStr: string) => {
    switch (statusStr) {
      case 'online': return 'Trực tuyến';
      case 'idle': return 'Chờ';
      case 'dnd': return 'Không làm phiền';
      case 'offline': return 'Ngoại tuyến';
      case 'streaming': return 'Đang phát trực tiếp';
      default: return 'Ngoại tuyến';
    }
  };

  // Get Discord Badge SVGs/images or styled tags
  const renderBadges = () => {
    return (
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-950/40 rounded-lg border border-zinc-800/50">
        {portfolio.customBadges.map((badge, idx) => {
          let badgeColor = "bg-[#5865F2]/20 text-[#5865F2]";
          if (badge.includes("Bravery")) badgeColor = "bg-purple-500/20 text-purple-400 border border-purple-500/30";
          if (badge.includes("Active")) badgeColor = "bg-green-500/20 text-green-400 border border-green-500/30";
          if (badge.includes("Nitro")) badgeColor = "bg-pink-500/20 text-pink-400 border border-pink-500/30";
          if (badge.includes("Early")) badgeColor = "bg-amber-500/20 text-amber-400 border border-amber-500/30";

          return (
            <span 
              key={idx} 
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeColor} select-none`}
              title={badge}
            >
              {badge}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-[360px] bg-[#1e1f22] text-[#dbdee1] rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col font-sans">
      {/* Banner */}
      <div 
        className="h-28 w-full relative bg-[#5865f2] bg-cover bg-center transition-all duration-300"
        style={{ backgroundImage: user?.banner ? `url(${user.banner})` : undefined }}
      >
        {/* Decorative Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10"></div>
      </div>

      {/* Profile Info Container */}
      <div className="px-4 pb-4 relative flex flex-col">
        {/* Avatar Area */}
        <div className="absolute -top-12 left-3">
          <div className="relative">
            <img 
              src={user?.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
              alt="Avatar" 
              className="w-22 h-22 rounded-full border-6 border-[#1e1f22] object-cover bg-zinc-700"
              referrerPolicy="no-referrer"
            />
            {/* Status indicator badge with cutout shape styling */}
            <div className={`absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full border-4 border-[#1e1f22] ${getStatusColor(status)} flex items-center justify-center`}>
              {status === 'idle' && (
                <div className="w-2 h-2 rounded-full bg-[#1e1f22] absolute -top-0.5 -left-0.5"></div>
              )}
              {status === 'dnd' && (
                <div className="w-2.5 h-1 bg-[#1e1f22] rounded-full"></div>
              )}
            </div>
          </div>
        </div>

        {/* Badges Align Right of Avatar */}
        <div className="flex justify-end pt-3 min-h-12">
          {renderBadges()}
        </div>

        {/* Username Details */}
        <div className="mt-2.5 bg-[#111214] p-3 rounded-lg border border-zinc-800/30">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-white flex items-center gap-1.5 tracking-wide">
              {user?.global_name || "Guest Account"}
            </h2>
            <span className="text-xs text-zinc-400 font-mono tracking-tight mt-0.5">
              @{user?.username || "guest_account"}
            </span>
          </div>

          {/* Custom Status */}
          {portfolio.customStatusText && (
            <div className="mt-3 pt-3 border-t border-zinc-800 text-xs italic text-zinc-300 flex items-center gap-1.5">
              <span>{customStatus?.emoji?.name || "💬"}</span>
              <span>{portfolio.customStatusText}</span>
            </div>
          )}
        </div>

        {/* About Me Segment */}
        <div className="mt-4 flex flex-col gap-1.5">
          <h3 className="text-xxs font-bold text-zinc-400 uppercase tracking-wider">Về mình</h3>
          <p className="text-xs text-zinc-300 leading-relaxed font-light whitespace-pre-line bg-[#111214]/50 p-2.5 rounded-md border border-zinc-800/20">
            {portfolio.bio}
          </p>
        </div>

        {/* Live Spotify Session Segment */}
        {spotify && (
          <div className="mt-4 bg-[#111214] border border-emerald-500/20 rounded-xl p-3 flex flex-col relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 p-1.5 text-emerald-400">
              <Music className="w-4 h-4 animate-bounce" />
            </div>

            <h3 className="text-xxs font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Đang nghe Spotify
            </h3>

            <div className="flex gap-3">
              <img 
                src={spotify.album_art_url} 
                alt="Spotify Album Art" 
                className="w-14 h-14 rounded-lg object-cover border border-zinc-800"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col justify-center min-w-0 flex-1">
                <a 
                  href={`https://open.spotify.com/track/${spotify.track_id}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-white hover:underline truncate flex items-center gap-1"
                >
                  {spotify.song}
                  <ExternalLink className="w-3 h-3 text-zinc-400 shrink-0" />
                </a>
                <span className="text-xs text-zinc-300 truncate mt-0.5">by {spotify.artist}</span>
                <span className="text-[11px] text-zinc-500 truncate mt-0.5">album: {spotify.album}</span>
              </div>
            </div>

            {/* Spotify Audio Progress Bar */}
            <div className="mt-3 flex flex-col gap-1">
              <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${spotifyProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono mt-0.5">
                <span>{spotifyTimer}</span>
                <span>{spotifyTotal}</span>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Activity / Game Segment */}
        {gameActivity && (
          <div className="mt-4 bg-[#111214] rounded-xl p-3 border border-indigo-500/20 flex flex-col">
            <h3 className="text-xxs font-bold text-indigo-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
              Đang chơi
            </h3>

            <div className="flex gap-3">
              {gameActivity.assets?.large_image ? (
                <div className="relative">
                  <img 
                    src={gameActivity.assets.large_image.startsWith('mp:external') 
                      ? gameActivity.assets.large_image.replace(/mp:external\/[^\/]+\/https?\//, 'https://')
                      : gameActivity.assets.large_image
                    } 
                    alt={gameActivity.assets.large_text || "Game image"} 
                    className="w-14 h-14 rounded-lg object-cover border border-zinc-800"
                    referrerPolicy="no-referrer"
                  />
                  {gameActivity.assets?.small_image && (
                    <img 
                      src={gameActivity.assets.small_image.startsWith('mp:external') 
                        ? gameActivity.assets.small_image.replace(/mp:external\/[^\/]+\/https?\//, 'https://')
                        : gameActivity.assets.small_image
                      } 
                      alt={gameActivity.assets.small_text || "Status icon"} 
                      className="w-6 h-6 rounded-full border-2 border-[#111214] absolute -bottom-1 -right-1 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              ) : (
                <div className="w-14 h-14 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <Laptop className="w-7 h-7" />
                </div>
              )}

              <div className="flex flex-col justify-center min-w-0 flex-1">
                <span className="text-sm font-semibold text-white truncate">{gameActivity.name}</span>
                {gameActivity.details && (
                  <span className="text-xs text-zinc-300 truncate mt-0.5">{gameActivity.details}</span>
                )}
                {gameActivity.state && (
                  <span className="text-[11px] text-zinc-400 truncate mt-0.5">{gameActivity.state}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Message Action Button */}
        <button 
          id="send-message-btn"
          onClick={onSendMessage}
          className="mt-4 w-full bg-[#5865f2] hover:bg-[#4752c4] active:bg-[#3c45a5] text-white py-2 rounded-md font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-black/20"
        >
          <MessageSquare className="w-4 h-4" />
          Gửi tin nhắn trực tiếp
        </button>
      </div>
    </div>
  );
}
