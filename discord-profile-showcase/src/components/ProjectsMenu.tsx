import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  ExternalLink, 
  Globe, 
  X, 
  Copy, 
  Check, 
  RefreshCw, 
  Radio,
  Zap,
  Terminal,
  Maximize2,
  Volume2,
  Volume1,
  VolumeX,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PortfolioData } from '../types';
import { useAudio } from '../context/AudioContext';

interface ProjectLinkItem {
  id: string;
  name: string;
  url: string;
}

const DEFAULT_PROJECT_LINKS: ProjectLinkItem[] = [
  {
    id: "themaster-ai",
    name: "TheMaster AI",
    url: "https://themasters-pi.vercel.app/"
  },
  {
    id: "coding-tutorial",
    name: "Coding tutorial website",
    url: "https://tmcoderthemaster.vercel.app/"
  },
  {
    id: "virtual-trading",
    name: "Virtual trading platform",
    url: "https://adnew-psi.vercel.app/"
  },
  {
    id: "domain-expansion",
    name: "Domain Expansion simulator",
    url: "https://domainexpansion-opal.vercel.app/"
  },
  {
    id: "tm-tier-list",
    name: "TheMaster tier list",
    url: "https://tmtiers.vercel.app/"
  },
  {
    id: "never-give-up-player",
    name: "Never Give Up player",
    url: "https://test1-gamma-navy-38.vercel.app/"
  },
  {
    id: "themasterplayer",
    name: "themasterplayer",
    url: "https://tm-music-player2.vercel.app/"
  },
  {
    id: "the-fur1ous",
    name: "the fur1ous",
    url: "https://thefur1ous.vercel.app/"
  },
  {
    id: "minecraft-anticheat",
    name: "minecraft anticheat",
    url: "https://themasterac.vercel.app/"
  }
];

interface ProjectsMenuProps {
  portfolio: PortfolioData;
  onClose: () => void;
}

export function ProjectsMenu({ portfolio, onClose }: ProjectsMenuProps) {
  const projectList: ProjectLinkItem[] = (portfolio.projects && portfolio.projects.length > 0)
    ? portfolio.projects
        .filter(p => {
          const title = (p.title || '').toLowerCase();
          const url = (p.demoUrl || p.githubUrl || '').toLowerCase().trim();
          if (title.includes('melodia') || title.includes('devspace') || title.includes('portfolio website phong cách discord')) return false;
          if (url === '#' || url === 'https://discord.com' || url === 'https://devspace.com' || !url) return false;
          return true;
        })
        .map((p, idx) => {
          let url = p.demoUrl || p.githubUrl || 'https://themasters-pi.vercel.app/';
          if (url.includes('themasterai-three.vercel.app')) {
            url = 'https://themasters-pi.vercel.app/';
          }
          return {
            id: `p-${idx}`,
            name: p.title,
            url
          };
        })
    : DEFAULT_PROJECT_LINKS;

  // Selected link for embed preview
  const [selectedLink, setSelectedLink] = useState<ProjectLinkItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isGlitching, setIsGlitching] = useState<boolean>(false);
  const [glitchPhase, setGlitchPhase] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showPreviewAudio, setShowPreviewAudio] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(0.5);

  // Helper to identify music player projects ("Never Give Up player" & "themasterplayer")
  const isMusicPlayer = (item: ProjectLinkItem | null) => {
    if (!item) return false;
    const name = (item.name || '').toLowerCase().replace(/[\s\-_]/g, '');
    const url = (item.url || '').toLowerCase();
    const id = (item.id || '').toLowerCase();
    return (
      name.includes('nevergiveup') ||
      name.includes('themasterplayer') ||
      name.includes('music') ||
      name.includes('player') ||
      name.includes('nc') ||
      id.includes('never-give-up') ||
      id.includes('themasterplayer') ||
      id.includes('music') ||
      url.includes('test1-gamma-navy') ||
      url.includes('tm-music-player2') ||
      url.includes('music') ||
      url.includes('player')
    );
  };

  // Helper to check if a project has its own audio and should turn off background music
  // Turn OFF background music when opening "Never Give Up player" or "themasterplayer"
  const shouldPauseBackgroundMusic = (item: ProjectLinkItem | null) => {
    return isMusicPlayer(item);
  };

  // References for preview containers
  const compactScrollRef = useRef<HTMLDivElement | null>(null);
  const fullscreenScrollRef = useRef<HTMLDivElement | null>(null);

  // Background music audio controls
  const { volume, setVolume, isMuted, toggleMute, isPlaying, play, pause } = useAudio();
  const wasPausedByPreviewRef = useRef(false);

  // Actively pause background music whenever Never Give Up player is selected
  useEffect(() => {
    if (selectedLink && shouldPauseBackgroundMusic(selectedLink)) {
      wasPausedByPreviewRef.current = true;
      pause();
    }
  }, [selectedLink, pause]);

  const handleClosePreview = () => {
    setSelectedLink(null);
    if (wasPausedByPreviewRef.current) {
      wasPausedByPreviewRef.current = false;
      if (!isMuted) {
        play();
      }
    }
  };

  const handleCloseModal = () => {
    if (wasPausedByPreviewRef.current) {
      wasPausedByPreviewRef.current = false;
      if (!isMuted) {
        play();
      }
    }
    onClose();
  };

  // Resume background music when modal unmounts ONLY if it was paused by an active preview
  useEffect(() => {
    return () => {
      if (wasPausedByPreviewRef.current) {
        wasPausedByPreviewRef.current = false;
        if (!isMuted) {
          play();
        }
      }
    };
  }, [isMuted, play]);

  // Keyboard shortcut listener (ESC to exit fullscreen, close preview, or close modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else if (selectedLink) {
          handleClosePreview();
        } else {
          handleCloseModal();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, selectedLink, onClose, isPlaying, isMuted, play]);

  // Center the preview vertically on the embed page when preview opens
  useEffect(() => {
    if (selectedLink && compactScrollRef.current) {
      const timer = setTimeout(() => {
        const container = compactScrollRef.current;
        if (container) {
          const { scrollHeight, clientHeight } = container;
          if (scrollHeight > clientHeight) {
            container.scrollTo({
              top: Math.round((scrollHeight - clientHeight) / 2),
              behavior: 'smooth'
            });
          }
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [selectedLink, iframeKey]);

  const handleOpenPreview = (item: ProjectLinkItem) => {
    // "cho cái mh trong domain expansion thì ko có xem trước , click vào nó chuyển sang link"
    const isDomainExpansion = item.name.toLowerCase().includes('domain expansion') || item.url.includes('domainexpansion');
    if (isDomainExpansion) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
      return;
    }

    setSelectedLink(item);
    setIframeKey(prev => prev + 1);

    // "ncmusic player thì zoom ở 70%" - Music player defaults to 70% (0.7), other sites default to 50% (0.5)
    const initialZoom = isMusicPlayer(item) ? 0.7 : 0.5;
    setZoomLevel(initialZoom);

    // Audio management:
    // When previewing "Never Give Up player", turn OFF background music
    // For all other projects (including TheMaster AI, coding tutorial, trading platform, tier list), KEEP background music playing
    if (shouldPauseBackgroundMusic(item)) {
      pause();
    } else {
      // Keep or resume background music for silent websites and TheMaster AI
      if (!isPlaying && !isMuted) {
        play();
      }
    }

    // Trigger intense cyberpunk glitch animation
    setIsGlitching(true);
    setGlitchPhase(prev => prev + 1);
    setTimeout(() => {
      setIsGlitching(false);
    }, 550);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(2.5, Math.round((prev + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(0.2, Math.round((prev - 0.1) * 10) / 10));
  };

  const handleResetZoom = () => {
    if (selectedLink && isMusicPlayer(selectedLink)) {
      setZoomLevel(0.7);
    } else {
      setZoomLevel(0.5);
    }
  };

  // Mute audio for TheMaster AI
  const isSelectedTheMasterAI = Boolean(
    selectedLink && (
      selectedLink.url.includes('themasters-pi') || 
      selectedLink.name.toLowerCase().includes('themaster ai')
    )
  );

  const getIframeSrc = (link: ProjectLinkItem) => {
    const isAI = link.url.includes('themasters-pi') || link.name.toLowerCase().includes('themaster ai');
    if (isAI) {
      return link.url.includes('?') 
        ? `${link.url}&mute=1&sound=0&muted=true` 
        : `${link.url}?mute=1&sound=0&muted=true`;
    }
    return link.url;
  };

  const handleCopy = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 1800);
  };

  const handleRefreshIframe = () => {
    setIsGlitching(true);
    setIframeKey(prev => prev + 1);
    setTimeout(() => setIsGlitching(false), 500);
  };

  return (
    <>
      <style>{`
        @keyframes cyberGlitchIn {
          0% {
            opacity: 0;
            transform: scale(0.93) translate(-6px, 4px) skewX(6deg);
            filter: drop-shadow(4px 0 0 #06b6d4) drop-shadow(-4px 0 0 #ec4899);
            clip-path: inset(20% 0 50% 0);
          }
          18% {
            opacity: 0.9;
            transform: scale(1.02) translate(5px, -3px) skewX(-5deg);
            filter: drop-shadow(-3px 0 0 #06b6d4) drop-shadow(3px 0 0 #3b82f6);
            clip-path: inset(65% 0 10% 0);
          }
          35% {
            opacity: 0.7;
            transform: scale(0.98) translate(-3px, 2px) skewX(3deg);
            filter: drop-shadow(2px 0 0 #a855f7) drop-shadow(-2px 0 0 #06b6d4);
            clip-path: inset(10% 0 70% 0);
          }
          55% {
            opacity: 1;
            transform: scale(1.01) translate(2px, -1px) skewX(-2deg);
            filter: drop-shadow(-1px 0 0 #06b6d4) drop-shadow(1px 0 0 #ec4899);
            clip-path: inset(40% 0 20% 0);
          }
          75% {
            opacity: 0.85;
            transform: scale(1) translate(-1px, 1px) skewX(1deg);
            filter: drop-shadow(1px 0 0 #3b82f6);
            clip-path: inset(5% 0 5% 0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translate(0, 0) skewX(0deg);
            filter: none;
            clip-path: inset(0% 0 0% 0);
          }
        }

        @keyframes glitchScanlines {
          0% { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }

        @keyframes rgbSplitFlicker {
          0%, 100% { transform: translate(0); text-shadow: -1px 0 #00ffff, 1px 0 #ff0077; }
          20% { transform: translate(-2px, 1px); text-shadow: 2px 0 #00ffff, -2px 0 #ff0077; }
          40% { transform: translate(1px, -1px); text-shadow: -2px 0 #00ffff, 2px 0 #00ff66; }
          60% { transform: translate(-1px, 2px); text-shadow: 1px 0 #00ffff, -1px 0 #ff0077; }
          80% { transform: translate(2px, -2px); text-shadow: -1px 0 #00ffff, 1px 0 #a855f7; }
        }

        .glitch-anim-container {
          animation: cyberGlitchIn 0.52s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .rgb-glitch-text {
          animation: rgbSplitFlicker 0.4s steps(2) infinite;
        }

        .glitch-scanlines-overlay {
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0),
            rgba(255,255,255,0) 50%,
            rgba(0, 255, 255, 0.12) 50%,
            rgba(0, 255, 255, 0.12)
          );
          background-size: 100% 4px;
          animation: glitchScanlines 0.2s linear infinite;
        }

        /* Custom Cyber Scrollbar for Preview */
        .preview-scrollbar::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }
        .preview-scrollbar::-webkit-scrollbar-track {
          background: #080c14;
          border-left: 1px solid rgba(6, 182, 212, 0.2);
        }
        .preview-scrollbar::-webkit-scrollbar-thumb {
          background: #0891b2;
          border-radius: 4px;
        }
        .preview-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #22d3ee;
          box-shadow: 0 0 8px #22d3ee;
        }
        .preview-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #0891b2 #080c14;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .scrollbar-none {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      <div className="w-full max-w-lg mx-auto select-none font-mono">
        <div className="relative rounded-2xl bg-black/55 border border-white/15 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300">
          
          {/* Futuristic Corner Brackets */}
          <div className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl opacity-70 pointer-events-none" />
          <div className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 border-cyan-400 rounded-br-2xl opacity-70 pointer-events-none" />

          {/* Minimalist Topbar */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-wider">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>project:</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-cyan-300">
                {projectList.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-7 h-7 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/15 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Đóng menu"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Links List - Pure Links Only */}
          <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1 preview-scrollbar">
            {projectList.map((item, idx) => {
              const isDomainExpansion = item.name.toLowerCase().includes('domain expansion') || item.url.includes('domainexpansion');
              const isSelected = selectedLink?.url === item.url && !isDomainExpansion;

              return (
                <div
                  key={item.id || idx}
                  onClick={() => handleOpenPreview(item)}
                  className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : isDomainExpansion
                      ? 'bg-zinc-900/40 border-zinc-800/80 text-zinc-300 hover:bg-purple-950/30 hover:text-purple-200 hover:border-purple-500/40'
                      : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/60 hover:text-white hover:border-cyan-500/40'
                  }`}
                >
                  {/* Left Link Info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                      isSelected 
                        ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' 
                        : isDomainExpansion
                        ? 'bg-purple-400/80 group-hover:bg-purple-300'
                        : 'bg-zinc-600 group-hover:bg-cyan-400/70'
                    }`} />
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold truncate ${
                          isDomainExpansion ? 'text-zinc-200 group-hover:text-purple-300' : 'text-zinc-200 group-hover:text-cyan-300'
                        }`}>
                          {item.name}
                        </span>
                      </div>
                      <div className={`text-[10px] truncate font-mono ${
                        isDomainExpansion ? 'text-purple-400/80 group-hover:text-purple-300' : 'text-cyan-400/80 group-hover:text-cyan-300'
                      }`}>
                        {item.url}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Copy & Open */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(item.url, e)}
                      className="p-1.5 rounded-md hover:bg-white/5 text-zinc-400 hover:text-cyan-300 transition-colors"
                      title="Sao chép link"
                    >
                      {copiedUrl === item.url ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`p-1.5 rounded-md transition-colors ${
                        isDomainExpansion 
                          ? 'hover:bg-purple-500/10 text-purple-400 hover:text-purple-200' 
                          : 'hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-200'
                      }`}
                      title="Mở tab mới"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Embedded Glitch Preview Window (Hiện ra khi click vào link, không hiện cho domain expansion) */}
          <AnimatePresence>
            {selectedLink && !(selectedLink.name.toLowerCase().includes('domain expansion') || selectedLink.url.includes('domainexpansion')) && (
              <motion.div
                key={`preview-section-${selectedLink.url}-${glitchPhase}`}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="relative rounded-xl bg-black/45 border border-white/15 shadow-[0_8px_25px_rgba(0,0,0,0.7)] backdrop-blur-xl overflow-hidden glitch-anim-container">
                  
                  {/* Glitch Overlay Effect on Load/Refresh */}
                  {isGlitching && (
                    <div className="absolute inset-0 z-30 pointer-events-none glitch-scanlines-overlay opacity-90 flex items-center justify-center bg-cyan-950/20 backdrop-blur-[1px]">
                      <div className="px-3 py-1 bg-black/80 border border-cyan-400 rounded text-cyan-400 text-xs font-mono font-bold rgb-glitch-text flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 animate-pulse" />
                        <span>GLITCH SYNCHRONIZING...</span>
                      </div>
                    </div>
                  )}

                  {/* Browser Window Chrome Topbar */}
                  <div className="flex items-center justify-between px-3 py-2 bg-black/40 border-b border-white/10 text-xs gap-2">
                    {/* Cyber Glitch Address Bar (no dots, no name) */}
                    <div className="flex-1 max-w-sm flex items-center justify-between px-2.5 py-1 rounded-md bg-black/50 border border-white/10 text-[11px] text-zinc-300 font-mono truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <Radio className="w-3 h-3 text-cyan-400 animate-pulse shrink-0" />
                        <span className="truncate text-zinc-300">{selectedLink.url}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleRefreshIframe}
                        className="ml-2 text-zinc-400 hover:text-cyan-300 transition-colors shrink-0 cursor-pointer"
                        title="Tải lại frame"
                      >
                        <RefreshCw className={`w-3 h-3 ${isGlitching ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    {/* Actions: Zoom, Volume button, Fullscreen, Open tab & Close preview */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Zoom controls inside compact view */}
                      <div className="flex items-center gap-0.5 bg-black/50 border border-white/15 rounded-md p-0.5 text-zinc-300">
                        <button
                          type="button"
                          onClick={handleZoomOut}
                          className="p-1 rounded hover:bg-white/10 hover:text-cyan-300 transition-colors cursor-pointer"
                          title="Thu nhỏ (-)"
                        >
                          <ZoomOut className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={handleResetZoom}
                          className="px-1 text-[9px] font-mono font-bold hover:text-cyan-300 cursor-pointer"
                          title="Đặt lại zoom"
                        >
                          {Math.round(zoomLevel * 100)}%
                        </button>
                        <button
                          type="button"
                          onClick={handleZoomIn}
                          className="p-1 rounded hover:bg-white/10 hover:text-cyan-300 transition-colors cursor-pointer"
                          title="Phóng to (+)"
                        >
                          <ZoomIn className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Speaker button to adjust background music */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowPreviewAudio(prev => !prev)}
                          className={`p-1.5 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                            isMuted || volume === 0
                              ? 'bg-rose-950/40 border-rose-500/40 text-rose-400 hover:bg-rose-900/60'
                              : 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/60 hover:text-white'
                          }`}
                          title="volume"
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : volume < 0.5 ? (
                            <Volume1 className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          <span className="text-[10px] font-mono font-bold hidden sm:inline">
                            {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                          </span>
                        </button>

                        {/* Mini Volume Slider Popover */}
                        {showPreviewAudio && (
                          <div className="absolute top-full right-0 mt-2 w-48 p-2.5 rounded-xl bg-black/90 border border-purple-500/50 shadow-[0_0_25px_rgba(0,0,0,0.85)] backdrop-blur-xl z-50 flex flex-col gap-2 font-mono">
                            <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold">
                              <span>volume</span>
                              <button 
                                type="button" 
                                onClick={toggleMute}
                                className="text-zinc-400 hover:text-white underline cursor-pointer"
                              >
                                {isMuted ? 'Bật lại' : 'Tắt'}
                              </button>
                            </div>

                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={isMuted ? 0 : volume}
                              onChange={(e) => setVolume(parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-black/70 rounded appearance-none cursor-pointer accent-purple-400"
                            />

                            <div className="flex justify-between items-center text-[9px] text-zinc-400 font-bold">
                              <button type="button" onClick={() => setVolume(0.25)} className="hover:text-purple-300 cursor-pointer">25%</button>
                              <button type="button" onClick={() => setVolume(0.5)} className="hover:text-purple-300 cursor-pointer">50%</button>
                              <button type="button" onClick={() => setVolume(0.75)} className="hover:text-purple-300 cursor-pointer">75%</button>
                              <button type="button" onClick={() => setVolume(1.0)} className="hover:text-purple-300 cursor-pointer">100%</button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Fullscreen Button */}
                      <button
                        type="button"
                        onClick={() => setIsFullscreen(true)}
                        className="p-1.5 rounded-md hover:bg-cyan-500/20 text-cyan-400 hover:text-white transition-colors cursor-pointer"
                        title="Chế độ toàn màn hình"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Open in new tab */}
                      <a
                        href={selectedLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                        title="Mở tab mới"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {/* Close preview */}
                      <button
                        type="button"
                        onClick={handleClosePreview}
                        className="p-1.5 rounded-md hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Đóng bản xem trước"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Embed Frame Viewport */}
                  <div className="relative w-full h-[340px] sm:h-[400px] flex bg-black/25 overflow-hidden">
                    <div 
                      ref={compactScrollRef}
                      className="relative flex-1 w-full h-full overflow-auto bg-[#07090f]"
                    >
                      <div
                        style={{
                          width: `${100 / zoomLevel}%`,
                          height: `${100 / zoomLevel}%`,
                          marginRight: `${(zoomLevel - 1) * 100 / zoomLevel}%`,
                          marginBottom: `${(zoomLevel - 1) * 100 / zoomLevel}%`,
                          transform: `scale(${zoomLevel})`,
                          transformOrigin: 'top left',
                        }}
                      >
                        <iframe
                          key={`iframe-${selectedLink.url}-${iframeKey}`}
                          src={getIframeSrc(selectedLink)}
                          title={selectedLink.name}
                          style={{ width: '100%', height: '100%' }}
                          className="w-full h-full border-0 bg-white block"
                          allow={isSelectedTheMasterAI ? "autoplay 'none'; camera 'none'; microphone 'none'; fullscreen" : "autoplay; camera; microphone; clipboard-read; clipboard-write; fullscreen"}
                          allowFullScreen
                          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                        />
                      </div>

                      {/* Scanline overlay bar */}
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/[0.03] to-transparent opacity-50" />
                    </div>
                  </div>

                  {/* Footer note with direct link fallback & Fullscreen cue */}
                  <div className="px-3 py-1.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="w-3 h-3 text-cyan-400" />
                      <span className="truncate">{selectedLink.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsFullscreen(true)}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Toàn màn hình</span>
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* FULLSCREEN MODAL OVERLAY (Chế độ Full Màn Hình) */}
      {isFullscreen && selectedLink && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex flex-col p-2 sm:p-4 select-none font-mono">
          {/* Cyber container with translucent dark glass (allows stars to shine through) */}
          <div className="relative w-full h-full flex flex-col rounded-2xl bg-[#07090e]/75 border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden">
            
            {/* Corner Brackets */}
            <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl opacity-80 pointer-events-none" />
            <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-2xl opacity-80 pointer-events-none" />

            {/* Glitch Overlay on Load/Refresh */}
            {isGlitching && (
              <div className="absolute inset-0 z-30 pointer-events-none glitch-scanlines-overlay opacity-90 flex items-center justify-center bg-cyan-950/20 backdrop-blur-[1px]">
                <div className="px-4 py-2 bg-black/80 border border-cyan-400 rounded-lg text-cyan-400 text-sm font-mono font-bold rgb-glitch-text flex items-center gap-2">
                  <Zap className="w-4 h-4 animate-pulse" />
                  <span>GLITCH SYNCHRONIZING...</span>
                </div>
              </div>
            )}

            {/* Header Topbar (No colored dots, no FULLSCREEN text, clean address) */}
            <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 bg-black/40 border-b border-white/10 text-xs gap-3 shrink-0">
              
              {/* Center Address & Live Indicator (No name, only URL) */}
              <div className="flex-1 max-w-xl flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-cyan-300 font-mono truncate">
                <div className="flex items-center gap-2 truncate">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
                  <span className="text-zinc-300 text-xs truncate">{selectedLink.url}</span>
                </div>

                <button
                  type="button"
                  onClick={handleRefreshIframe}
                  className="ml-2 text-zinc-400 hover:text-cyan-300 transition-colors shrink-0 cursor-pointer"
                  title="Tải lại frame"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGlitching ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Action Buttons: Zoom, Volume, Copy, Open new tab, Exit Fullscreen (dấu X) */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Zoom controls in fullscreen */}
                <div className="flex items-center gap-1 bg-black/50 border border-white/15 rounded-lg p-1 text-zinc-300">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-1 rounded hover:bg-white/10 hover:text-cyan-300 transition-colors cursor-pointer"
                    title="Thu nhỏ (-)"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="px-1.5 text-[10px] font-mono font-bold hover:text-cyan-300 cursor-pointer"
                    title="Đặt lại zoom"
                  >
                    {Math.round(zoomLevel * 100)}%
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-1 rounded hover:bg-white/10 hover:text-cyan-300 transition-colors cursor-pointer"
                    title="Phóng to (+)"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Speaker button to adjust background music */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPreviewAudio(prev => !prev)}
                    className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isMuted || volume === 0
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-400 hover:bg-rose-900/60'
                        : 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/60 hover:text-white'
                    }`}
                    title="volume"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : volume < 0.5 ? (
                      <Volume1 className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                    <span className="text-[11px] font-mono font-bold hidden sm:inline">
                      {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                    </span>
                  </button>

                  {/* Mini Volume Popover */}
                  {showPreviewAudio && (
                    <div className="absolute top-full right-0 mt-2 w-52 p-3 rounded-xl bg-black/90 border border-purple-500/50 shadow-[0_0_25px_rgba(0,0,0,0.9)] backdrop-blur-xl z-50 flex flex-col gap-2 font-mono">
                      <div className="flex items-center justify-between text-[11px] text-purple-300 font-bold">
                        <span>volume</span>
                        <button 
                          type="button" 
                          onClick={toggleMute}
                          className="text-zinc-400 hover:text-white underline cursor-pointer text-[10px]"
                        >
                          {isMuted ? 'Bật lại' : 'Tắt'}
                        </button>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-2 bg-black/70 rounded appearance-none cursor-pointer accent-purple-400"
                      />

                      <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold">
                        <button type="button" onClick={() => setVolume(0.25)} className="hover:text-purple-300 cursor-pointer">25%</button>
                        <button type="button" onClick={() => setVolume(0.5)} className="hover:text-purple-300 cursor-pointer">50%</button>
                        <button type="button" onClick={() => setVolume(0.75)} className="hover:text-purple-300 cursor-pointer">75%</button>
                        <button type="button" onClick={() => setVolume(1.0)} className="hover:text-purple-300 cursor-pointer">100%</button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => handleCopy(selectedLink.url, e)}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-900/80 border border-white/15 text-zinc-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                  title="Sao chép link"
                >
                  {copiedUrl === selectedLink.url ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span className="hidden md:inline">Copy</span>
                </button>

                <a
                  href={selectedLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-cyan-300 hover:text-white hover:bg-white/20 transition-all text-xs font-bold"
                  title="Mở tab mới"
                >
                  <span className="hidden sm:inline">Mở tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Exit Fullscreen: Dấu X (Không có chữ FULLSCREEN) */}
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-white/20 text-zinc-300 hover:text-rose-400 hover:border-rose-500/50 hover:bg-rose-950/40 transition-all flex items-center justify-center cursor-pointer"
                  title="Đóng (ESC)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Fullscreen Iframe Viewport */}
            <div className="relative flex-1 w-full h-full flex overflow-hidden bg-black/20">
              <div 
                ref={fullscreenScrollRef}
                className="relative flex-1 w-full h-full overflow-auto bg-[#07090f]"
              >
                <div
                  style={{
                    width: `${100 / zoomLevel}%`,
                    height: `${100 / zoomLevel}%`,
                    marginRight: `${(zoomLevel - 1) * 100 / zoomLevel}%`,
                    marginBottom: `${(zoomLevel - 1) * 100 / zoomLevel}%`,
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <iframe
                    key={`fs-iframe-${selectedLink.url}-${iframeKey}`}
                    src={getIframeSrc(selectedLink)}
                    title={selectedLink.name}
                    style={{ width: '100%', height: '100%' }}
                    className="w-full h-full border-0 bg-white block"
                    allow={isSelectedTheMasterAI ? "autoplay 'none'; camera 'none'; microphone 'none'; fullscreen" : "autoplay; camera; microphone; clipboard-read; clipboard-write; fullscreen"}
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}
