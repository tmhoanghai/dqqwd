import React, { useState, useEffect } from 'react';
import { LanyardData, PortfolioData } from '../types';
import { Heart, Eye, Play, Pause, SkipForward, SkipBack, Facebook, Crown, FolderGit2, Volume2, Volume1, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChessCard } from './ChessCard';
import { ProjectsMenu } from './ProjectsMenu';
import { VolumeCard } from './VolumeCard';
import { useAudio } from '../context/AudioContext';

interface CosmicShowcaseProps {
  lanyardData: LanyardData | null;
  portfolio: PortfolioData;
  onOpenProfile: () => void;
}

export function CosmicShowcase({ lanyardData, portfolio, onOpenProfile }: CosmicShowcaseProps) {
  // Chess card toggle state
  const [showChessCard, setShowChessCard] = useState<boolean>(false);
  // Projects menu toggle state
  const [showProjectsMenu, setShowProjectsMenu] = useState<boolean>(false);
  // Audio volume controller toggle state
  const [showVolumeCard, setShowVolumeCard] = useState<boolean>(false);

  // Background audio controls
  const { volume, isMuted, isPlaying } = useAudio();

  // Stats
  const [likes, setLikes] = useState<number>(() => {
    const saved = localStorage.getItem('cosmic_likes');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [views, setViews] = useState<number>(() => {
    const saved = localStorage.getItem('cosmic_views');
    const current = saved ? parseInt(saved, 10) + 1 : 7;
    localStorage.setItem('cosmic_views', String(current));
    return current;
  });

  const [hasLiked, setHasLiked] = useState<boolean>(() => {
    return localStorage.getItem('cosmic_has_liked') === 'true';
  });

  // Music Player Timeline
  const [currentTime, setCurrentTime] = useState<number>(0);
  const duration = 160; // 2:40 in seconds

  const user = lanyardData?.discord_user;

  // Increment likes
  const handleLike = () => {
    if (hasLiked) {
      setLikes(prev => prev - 1);
      localStorage.setItem('cosmic_likes', String(likes - 1));
      setHasLiked(false);
      localStorage.setItem('cosmic_has_liked', 'false');
    } else {
      setLikes(prev => prev + 1);
      localStorage.setItem('cosmic_likes', String(likes + 1));
      setHasLiked(true);
      localStorage.setItem('cosmic_has_liked', 'true');
    }
  };

  // Music timeline interval
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= duration) {
          return 0; // loop
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const [copied, setCopied] = useState<boolean>(false);
  const [displayText, setDisplayText] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Compute custom status text - ensure NO notes or status text when connecting or empty
  const isConnecting = lanyardData?.discord_user?.username === 'connecting' || lanyardData?.discord_user?.username === 'fetching_user';
  const directCustomStatusText = (lanyardData as any)?.custom_status?.text;
  const customStatusActivity = lanyardData?.activities?.find(act => act.type === 4);
  const rawStatusText = (!isConnecting && (directCustomStatusText || customStatusActivity?.state)) || "";
  const customStatusText = rawStatusText
    .replace(/[\u2600-\u27BF]|\p{Emoji_Presentation}|\p{Emoji_Modifier_Base}|\p{Emoji_Component}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

  // Glitch transition states for custom status
  const [renderedStatus, setRenderedStatus] = useState<string>(customStatusText);
  const [glitchState, setGlitchState] = useState<'idle' | 'glitch-in' | 'glitch-out'>(customStatusText ? 'glitch-in' : 'idle');

  useEffect(() => {
    if (glitchState === 'glitch-in') {
      const timer = setTimeout(() => {
        setGlitchState('idle');
      }, 550);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (customStatusText === renderedStatus) return;

    if (customStatusText && !renderedStatus) {
      // Appearing
      setRenderedStatus(customStatusText);
      setGlitchState('glitch-in');
      const timer = setTimeout(() => {
        setGlitchState('idle');
      }, 550);
      return () => clearTimeout(timer);
    } else if (!customStatusText && renderedStatus) {
      // Disappearing
      setGlitchState('glitch-out');
      const timer = setTimeout(() => {
        setRenderedStatus("");
        setGlitchState('idle');
      }, 550);
      return () => clearTimeout(timer);
    } else {
      // Changing
      setGlitchState('glitch-out');
      const timer1 = setTimeout(() => {
        setRenderedStatus(customStatusText);
        setGlitchState('glitch-in');
        const timer2 = setTimeout(() => {
          setGlitchState('idle');
        }, 550);
        return () => clearTimeout(timer2);
      }, 550);
      return () => clearTimeout(timer1);
    }
  }, [customStatusText]);

  // Synchronize initial display text when user object is loaded
  useEffect(() => {
    if (!copied && user?.username) {
      setDisplayText(`@${user.username}`);
    } else if (!copied) {
      setDisplayText('@themaster');
    }
  }, [user?.username, copied]);

  // Construct Discord CDN Avatar dynamically using user ID and hash
  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  const status = lanyardData?.discord_status || 'online';
  
  let statusClass = 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]';
  let statusFilter = 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.95))';
  
  if (status === 'idle') {
    statusClass = 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.7)]';
    statusFilter = 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.95))';
  } else if (status === 'dnd') {
    statusClass = 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]';
    statusFilter = 'drop-shadow(0 0 5px rgba(244, 63, 94, 0.95))';
  } else if (status === 'offline') {
    statusClass = 'bg-zinc-500 shadow-[0_0_6px_rgba(100,116,139,0.3)]';
    statusFilter = 'drop-shadow(0 0 2px rgba(100, 116, 139, 0.4))';
  }

  const handleCopyUsername = () => {
    if (copied || isAnimating) return;
    const username = user?.username || "themaster";
    
    navigator.clipboard.writeText(username).then(() => {
      // Step 1: Start flipping out
      setIsAnimating(true);
      
      // Step 2: Halfway through flip (200ms), swap text to "Copied! ✓" and mark as copied
      setTimeout(() => {
        setDisplayText("Copied! ✓");
        setCopied(true);
      }, 200);

      // Step 3: Complete flip animation state reset
      setTimeout(() => {
        setIsAnimating(false);
      }, 400);

      // Step 4: After 1.8 seconds, flip back to username
      setTimeout(() => {
        setIsAnimating(true);
        
        setTimeout(() => {
          setDisplayText(`@${user?.username || "themaster"}`);
          setCopied(false);
        }, 200);

        setTimeout(() => {
          setIsAnimating(false);
        }, 400);
      }, 1800);
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px] text-white p-6 font-sans relative -translate-y-24 sm:-translate-y-28 transition-all duration-500">
      
      {/* Pure CSS high performance infinite animation for detaching and merging back (always visible) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cycleTL {
          0%, 50% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          60%, 90% {
            transform: translate(-14px, -14px) scale(1.05) rotate(-4deg);
          }
          100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
        }
        @keyframes cycleTR {
          0%, 50% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          60%, 90% {
            transform: translate(14px, -14px) scale(1.05) rotate(4deg);
          }
          100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
        }
        @keyframes cycleBL {
          0%, 50% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          60%, 90% {
            transform: translate(-14px, 14px) scale(1.05) rotate(4deg);
          }
          100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
        }
        @keyframes cycleBR {
          0%, 50% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          60%, 90% {
            transform: translate(14px, 14px) scale(1.05) rotate(-4deg);
          }
          100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
        }
        @keyframes animeFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes textFlip {
          0% {
            transform: rotateX(0deg) scale(1);
            opacity: 1;
          }
          45% {
            transform: rotateX(90deg) scale(0.85);
            opacity: 0;
          }
          55% {
            transform: rotateX(-90deg) scale(0.85);
            opacity: 0;
          }
          100% {
            transform: rotateX(0deg) scale(1);
            opacity: 1;
          }
        }
        .animate-textFlip {
          animation: textFlip 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }

        @keyframes glitchIn {
          0% {
            opacity: 0;
            transform: translate(-50%, 15px) scale(0.9);
            clip-path: inset(40% 0 61% 0);
            text-shadow: -3px -3px 0px #ff0055, 3px 3px 0px #00ffcc;
          }
          10% {
            opacity: 0.8;
            transform: translate(-48%, -4px) scale(1.05) skewX(10deg);
            clip-path: inset(20% 0 80% 0);
            text-shadow: 4px -2px 0px #ff0055, -4px 2px 0px #00ffcc;
          }
          20% {
            opacity: 0.5;
            transform: translate(-52%, 2px) scale(0.95) skewX(-15deg);
            clip-path: inset(60% 0 10% 0);
          }
          30% {
            opacity: 0.9;
            transform: translate(-49%, -6px) scale(1.02);
            clip-path: inset(0% 0 30% 0);
            text-shadow: -2px 3px 0px #ff0055, 2px -3px 0px #00ffcc;
          }
          40% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1.0) skewX(0);
            clip-path: inset(0 0 0 0);
            text-shadow: none;
          }
          48% {
            transform: translate(-51%, -1px) skewX(-3deg);
            text-shadow: 2px 1px 0px #ff0055, -2px -1px 0px #00ffcc;
          }
          55% {
            transform: translate(-50%, 0) skewX(0);
            text-shadow: none;
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1.0);
          }
        }

        @keyframes glitchInSm {
          0% {
            opacity: 0;
            transform: translate(0, 15px) scale(0.9);
            clip-path: inset(40% 0 61% 0);
            text-shadow: -3px -3px 0px #ff0055, 3px 3px 0px #00ffcc;
          }
          10% {
            opacity: 0.8;
            transform: translate(4px, -4px) scale(1.05) skewX(10deg);
            clip-path: inset(20% 0 80% 0);
            text-shadow: 4px -2px 0px #ff0055, -4px 2px 0px #00ffcc;
          }
          20% {
            opacity: 0.5;
            transform: translate(-4px, 2px) scale(0.95) skewX(-15deg);
            clip-path: inset(60% 0 10% 0);
          }
          30% {
            opacity: 0.9;
            transform: translate(2px, -6px) scale(1.02);
            clip-path: inset(0% 0 30% 0);
            text-shadow: -2px 3px 0px #ff0055, 2px -3px 0px #00ffcc;
          }
          40% {
            opacity: 1;
            transform: translate(0, 0) scale(1.0) skewX(0);
            clip-path: inset(0 0 0 0);
            text-shadow: none;
          }
          48% {
            transform: translate(-2px, -1px) skewX(-3deg);
            text-shadow: 2px 1px 0px #ff0055, -2px -1px 0px #00ffcc;
          }
          55% {
            transform: translate(0, 0) skewX(0);
            text-shadow: none;
          }
          100% {
            opacity: 1;
            transform: translate(0, 0) scale(1.0);
          }
        }

        @keyframes glitchOut {
          0% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1.0);
            clip-path: inset(0 0 0 0);
          }
          15% {
            opacity: 0.9;
            transform: translate(-48%, 2px) scale(1.02) skewX(-8deg);
            clip-path: inset(10% 0 70% 0);
            text-shadow: -4px 2px 0px #ff0055, 4px -2px 0px #00ffcc;
          }
          30% {
            opacity: 0.6;
            transform: translate(-53%, -3px) scale(0.98) skewX(12deg);
            clip-path: inset(50% 0 20% 0);
            text-shadow: 3px -3px 0px #ff0055, -3px 3px 0px #00ffcc;
          }
          45% {
            opacity: 0.3;
            transform: translate(-49%, 4px) scale(0.93) skewX(-5deg);
            clip-path: inset(30% 0 50% 0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -15px) scale(0.8);
            clip-path: inset(80% 0 0% 0);
            text-shadow: none;
          }
        }

        @keyframes glitchOutSm {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1.0);
            clip-path: inset(0 0 0 0);
          }
          15% {
            opacity: 0.9;
            transform: translate(4px, 2px) scale(1.02) skewX(-8deg);
            clip-path: inset(10% 0 70% 0);
            text-shadow: -4px 2px 0px #ff0055, 4px -2px 0px #00ffcc;
          }
          30% {
            opacity: 0.6;
            transform: translate(-6px, -3px) scale(0.98) skewX(12deg);
            clip-path: inset(50% 0 20% 0);
            text-shadow: 3px -3px 0px #ff0055, -3px 3px 0px #00ffcc;
          }
          45% {
            opacity: 0.3;
            transform: translate(2px, 4px) scale(0.93) skewX(-5deg);
            clip-path: inset(30% 0 50% 0);
          }
          100% {
            opacity: 0;
            transform: translate(0, -15px) scale(0.8);
            clip-path: inset(80% 0 0% 0);
            text-shadow: none;
          }
        }

        .glitch-bubble-in {
          animation: glitchIn 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
        .glitch-bubble-out {
          animation: glitchOut 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }

        @media (min-width: 640px) {
          .glitch-bubble-in {
            animation: glitchInSm 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards !important;
          }
          .glitch-bubble-out {
            animation: glitchOutSm 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards !important;
          }
        }
      `}} />

      {/* Decorative Aura Spotlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      
      {/* Main Container */}
      <div className="flex flex-col items-center justify-center w-full select-text">
        
        {/* Row Container to hold Avatar and Name side-by-side perfectly */}
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-10 translate-y-6">
          
          {/* Avatar frame on the left */}
          <div className="relative group select-none">

            {/* Anime-Style Speech Dialogue Bubble (Fades in, floats up and down, pointing to top-right of the avatar) - Elongated, simpler, no emojis */}
            {renderedStatus && (
              <div 
                className={`absolute -top-14 left-[58%] z-40 bg-black/45 border border-cyan-500/25 text-[12px] font-semibold tracking-wider text-cyan-200 px-5 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.12)] backdrop-blur-xl select-none pointer-events-none w-max max-w-[260px] sm:max-w-[400px] text-center flex items-center justify-center break-words ${
                  glitchState === 'glitch-in' 
                    ? 'glitch-bubble-in' 
                    : glitchState === 'glitch-out' 
                      ? 'glitch-bubble-out' 
                      : '-translate-x-1/2 sm:translate-x-0 sm:left-16'
                }`}
                style={{
                  animation: glitchState === 'idle' ? 'animeFloat 4s ease-in-out infinite' : undefined,
                  fontFamily: "'JetBrains Mono', 'Inter', monospace",
                }}
              >
                {/* Dialogue Content - Clean and simple plain text, no truncate bug */}
                <span className="max-w-full leading-relaxed break-words block">
                  {renderedStatus}
                </span>
              </div>
            )}
            
            {/* Animated Glow Halo */}
            <div className="absolute -inset-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-25 transition-opacity duration-500"></div>

            {/* Square Avatar Container (Transparent background so the corners are the actual frame) */}
            <div className="relative w-28 h-28 p-[3px] bg-transparent rounded-2xl z-10 overflow-visible">
              
              {/* Inner background masking content - with a subtle boundary border */}
              <div className="w-full h-full bg-[#090d16] border border-white/5 p-[1px] rounded-[13px] flex items-center justify-center overflow-hidden relative">
                {/* Base Avatar - 100% steady, clean and crisp */}
                <img 
                  src={avatarUrl} 
                  alt="User Avatar" 
                  className="w-full h-full rounded-[11px] object-cover relative z-10 cursor-default select-none pointer-events-none"
                  draggable="false"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Glowing Status Indicator Container (Styled exactly like official Discord status icons, nestled safely inside without sticking out) */}
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-[#090d16] rounded-full z-30 flex items-center justify-center p-[2px] select-none pointer-events-none">
                {status === 'online' && (
                  <div 
                    className="w-full h-full bg-[#23a55a] rounded-full shadow-[0_0_12px_rgba(35,165,90,0.7)]" 
                    style={{ filter: 'drop-shadow(0 0 5px rgba(35, 165, 90, 0.95))' }}
                  />
                )}
                {status === 'idle' && (
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-full h-full text-[#f0b232] fill-current drop-shadow-[0_0_5px_rgba(240,178,50,0.95)]"
                    style={{ filter: 'drop-shadow(0 0 5px rgba(240, 178, 50, 0.95))' }}
                  >
                    <path d="M12.1 22A10 10 0 0 1 2.1 12 10 10 0 0 1 9.89 2.24a1 1 0 0 1 .85 1.6 7 7 0 0 0-.25 1.8 7 7 0 0 0 7.01 6.86 7 7 0 0 0 1.8-.25 1 1 0 0 1 1.6 0.85A10 10 0 0 1 12.1 22Z" />
                  </svg>
                )}
                {status === 'dnd' && (
                  <div 
                    className="w-full h-full bg-[#f23f43] rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(242,63,67,0.7)]" 
                    style={{ filter: 'drop-shadow(0 0 5px rgba(242, 63, 67, 0.95))' }}
                  >
                    <div className="w-3 h-[3px] bg-[#090d16] rounded-full" />
                  </div>
                )}
                {status === 'offline' && (
                  <div 
                    className="w-full h-full border-[4px] border-[#80848e] rounded-full bg-transparent shadow-[0_0_6px_rgba(128,132,142,0.3)]" 
                    style={{ filter: 'drop-shadow(0 0 2px rgba(128, 132, 142, 0.4))' }}
                  />
                )}
              </div>

              {/* Detachable Sci-Fi corners (Every 10s: separates and slides outwards, remains visible, then merges back to frame positions) */}
              <div className="absolute inset-0 pointer-events-none z-20">
                
                {/* Top-Left Corner Bracket (Pure Blue glow) */}
                <div 
                  className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px]"
                  style={{
                    borderColor: '#3b82f6',
                    borderTopLeftRadius: '14px',
                    animation: 'cycleTL 10s cubic-bezier(0.25, 1, 0.2, 1.1) infinite',
                    filter: 'drop-shadow(0 0 5px rgba(59, 130, 246, 0.85))'
                  }}
                />
                
                {/* Top-Right Corner Bracket (Mixed Blue/Purple glow) */}
                <div 
                  className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px]"
                  style={{
                    borderColor: '#6366f1',
                    borderTopRightRadius: '14px',
                    animation: 'cycleTR 10s cubic-bezier(0.25, 1, 0.2, 1.1) infinite',
                    filter: 'drop-shadow(0 0 5px rgba(99, 102, 241, 0.85))'
                  }}
                />

                {/* Bottom-Left Corner Bracket (Mixed Purple/Blue glow) */}
                <div 
                  className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px]"
                  style={{
                    borderColor: '#8b5cf6',
                    borderBottomLeftRadius: '14px',
                    animation: 'cycleBL 10s cubic-bezier(0.25, 1, 0.2, 1.1) infinite',
                    filter: 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.85))'
                  }}
                />

                {/* Bottom-Right Corner Bracket (Pure Purple/Magenta glow) */}
                <div 
                  className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px]"
                  style={{
                    borderColor: '#a855f7',
                    borderBottomRightRadius: '14px',
                    animation: 'cycleBR 10s cubic-bezier(0.25, 1, 0.2, 1.1) infinite',
                    filter: 'drop-shadow(0 0 5px rgba(168, 85, 247, 0.85))'
                  }}
                />

              </div>

            </div>
          </div>

          {/* Discord Name and Copy-on-Click Username on the Right */}
          <div 
            onClick={handleCopyUsername}
            className="flex flex-col items-center sm:items-start text-center sm:text-left relative group/name cursor-pointer py-2 select-text"
            title="Click to copy username"
          >
            {/* Display Name - Heart Emoji Removed */}
            <div className="text-2xl font-black text-white group-hover/name:text-sky-300 transition-colors flex items-center gap-2 font-sans tracking-wide select-none">
              {user?.global_name || "TheMaster"}
            </div>

            {/* @username (Small, to the right of avatar/under the name) - Flips beautifully when clicked */}
            <div className={`text-xs font-semibold mt-1.5 flex items-center gap-1.5 bg-black/20 border transition-all duration-300 px-3.5 py-1.5 rounded-full select-none ${
              copied 
                ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.25)]' 
                : 'border-zinc-800/60 text-zinc-400 group-hover/name:text-zinc-200 group-hover/name:border-zinc-700/60'
            } ${isAnimating ? 'animate-textFlip' : ''}`}>
              <span>{displayText || `@${user?.username || "themaster"}`}</span>
            </div>
          </div>

        </div>

        {/* Brand Buttons Section */}
        <div className="relative flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-10 z-30 translate-y-6 select-none">
          {/* Chess.com Button - Toggles Chess info card underneath */}
          <button
            type="button"
            onClick={() => {
              setShowChessCard(prev => {
                const next = !prev;
                if (next) {
                  setShowProjectsMenu(false);
                  setShowVolumeCard(false);
                }
                return next;
              });
            }}
            title="Chess.com (Click to view stats)"
            className={`group relative flex items-center justify-center w-14 h-14 bg-[#090d16]/80 rounded-full transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.65)] hover:-translate-y-1 overflow-hidden cursor-pointer ${
              showChessCard
                ? 'border border-[#81b64c] shadow-[0_0_25px_rgba(129,182,76,0.6)] ring-2 ring-[#81b64c]/40'
                : 'border border-[#81b64c]/25 hover:border-[#81b64c]/65 hover:shadow-[0_0_25px_rgba(129,182,76,0.45)]'
            }`}
          >
            {/* Hover background gradient glow */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-tr from-[#81b64c]/15 to-[#b5e580]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Hover subtle neon glow outline */}
            <span className="absolute -inset-px border border-[#81b64c]/45 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />

            <img 
              src="/chess.png" 
              alt="Chess.com" 
              className={`w-8 h-8 object-contain transition-transform duration-300 relative z-10 ${
                showChessCard ? 'scale-110 rotate-6' : 'group-hover:rotate-12'
              }`}
              referrerPolicy="no-referrer"
            />
          </button>

          {/* 📂 Project Button - Identical circular size (w-14 h-14) to other buttons */}
          <button
            type="button"
            id="cosmic-projects-btn"
            onClick={() => {
              setShowProjectsMenu(prev => {
                const next = !prev;
                if (next) {
                  setShowChessCard(false);
                  setShowVolumeCard(false);
                }
                return next;
              });
            }}
            title="Projects"
            className={`group relative flex items-center justify-center w-14 h-14 bg-[#090d16]/80 rounded-full transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.65)] hover:-translate-y-1 cursor-pointer overflow-hidden ${
              showProjectsMenu
                ? 'border border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.6)] ring-2 ring-cyan-400/40 text-cyan-300'
                : 'border border-cyan-500/30 hover:border-cyan-400/80 hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] text-cyan-400'
            }`}
          >
            {/* Hover background gradient glow */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Hover subtle neon glow outline */}
            <span className="absolute -inset-px border border-cyan-400/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />

            <FolderGit2 className={`w-7 h-7 text-cyan-400 transition-transform duration-300 relative z-10 ${
              showProjectsMenu ? 'scale-110 rotate-6 text-cyan-300' : 'group-hover:scale-110 group-hover:rotate-6'
            }`} />
          </button>

          {/* Facebook Button */}
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center w-14 h-14 bg-[#090d16]/80 border border-[#1877f2]/25 rounded-full transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.65)] hover:border-[#1877f2]/65 hover:shadow-[0_0_25px_rgba(24,119,242,0.45)] hover:-translate-y-1 overflow-hidden"
          >
            {/* Hover background gradient glow */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-tr from-[#1877f2]/15 to-[#3b5998]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Hover subtle neon glow outline */}
            <span className="absolute -inset-px border border-[#1877f2]/45 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />

            <img 
              src="/facebook.png" 
              alt="Facebook" 
              className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300 relative z-10"
              referrerPolicy="no-referrer"
            />
          </a>

          {/* 🔊 Background Music Volume Button - Identical circular size (w-14 h-14) to other buttons */}
          <button
            type="button"
            id="cosmic-volume-btn"
            onClick={() => {
              setShowVolumeCard(prev => {
                const next = !prev;
                if (next) {
                  setShowChessCard(false);
                  setShowProjectsMenu(false);
                }
                return next;
              });
            }}
            title="volume"
            className={`group relative flex items-center justify-center w-14 h-14 bg-[#090d16]/80 rounded-full transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.65)] hover:-translate-y-1 cursor-pointer overflow-hidden ${
              showVolumeCard
                ? 'border border-[#a855f7] shadow-[0_0_25px_rgba(168,85,247,0.6)] ring-2 ring-[#a855f7]/40 text-purple-300'
                : 'border border-[#a855f7]/30 hover:border-[#a855f7]/80 hover:shadow-[0_0_25px_rgba(168,85,247,0.45)] text-purple-400'
            }`}
          >
            {/* Hover background gradient glow */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-tr from-purple-500/20 via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Hover subtle neon glow outline */}
            <span className="absolute -inset-px border border-[#a855f7]/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />

            {/* Dynamic Speaker Icon */}
            {isMuted || volume === 0 ? (
              <VolumeX className={`w-7 h-7 text-rose-400 transition-transform duration-300 relative z-10 ${
                showVolumeCard ? 'scale-110' : 'group-hover:scale-110'
              }`} />
            ) : volume < 0.5 ? (
              <Volume1 className={`w-7 h-7 text-purple-300 transition-transform duration-300 relative z-10 ${
                showVolumeCard ? 'scale-110' : 'group-hover:scale-110'
              }`} />
            ) : (
              <Volume2 className={`w-7 h-7 text-purple-300 transition-transform duration-300 relative z-10 ${
                showVolumeCard ? 'scale-110' : 'group-hover:scale-110'
              }`} />
            )}
          </button>

          {/* ♟️ Chess Stats Card (Positioned absolutely directly underneath without shifting any parent or sibling elements) */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-5 w-[92vw] max-w-sm pointer-events-none z-50">
            <AnimatePresence>
              {showChessCard && (
                <motion.div
                  key="chess-stats-card"
                  initial={{ opacity: 0, scale: 0.9, y: -8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.9, y: -8, filter: 'blur(4px)' }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-auto"
                >
                  <ChessCard onClose={() => setShowChessCard(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 🎵 Volume / Background Music Card */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-5 w-[92vw] max-w-sm pointer-events-none z-50">
            <AnimatePresence>
              {showVolumeCard && (
                <motion.div
                  key="volume-control-card"
                  initial={{ opacity: 0, scale: 0.9, y: -8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.9, y: -8, filter: 'blur(4px)' }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-auto"
                >
                  <VolumeCard onClose={() => setShowVolumeCard(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 🚀 Projects Menu Card with Web Links & Live Previews */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-5 w-[94vw] max-w-xl pointer-events-none z-50">
            <AnimatePresence>
              {showProjectsMenu && (
                <motion.div
                  key="projects-menu-card"
                  initial={{ opacity: 0, scale: 0.92, y: -10, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.92, y: -10, filter: 'blur(6px)' }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-auto"
                >
                  <ProjectsMenu 
                    portfolio={portfolio} 
                    onClose={() => setShowProjectsMenu(false)} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

    </div>
  );
}
