import React, { useState, useEffect } from 'react';

export interface ChessData {
  username: string;
  name: string;
  avatar: string;
  views: number;
  viewsFormatted: string;
  url: string;
  rapid: number | string;
  blitz: number | string;
  bullet: number | string;
}

const INITIAL_CHESS_DATA: ChessData = {
  username: "tm_kingreal",
  name: "nguyễn hoàng hải",
  avatar: "https://images.chesscomfiles.com/uploads/v1/user/120765782.9ad67b84.200x200o.b5c00118059b.jpg",
  views: 9488,
  viewsFormatted: "9,488",
  url: "https://www.chess.com/member/tm_kingreal",
  rapid: 964,
  blitz: 782,
  bullet: 342,
};

interface ChessCardProps {
  onClose?: () => void;
}

export function ChessCard({ onClose }: ChessCardProps) {
  const [data, setData] = useState<ChessData>(INITIAL_CHESS_DATA);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchChessInfo() {
      setLoading(true);
      try {
        // 1. Fetch live player profile and stats from public API
        const [profileRes, statsRes] = await Promise.all([
          fetch('https://api.chess.com/pub/player/tm_kingreal').catch(() => null),
          fetch('https://api.chess.com/pub/player/tm_kingreal/stats').catch(() => null)
        ]);

        let currentRapid: number | string = 964;
        let currentBlitz: number | string = 782;
        let currentBullet: number | string = 342;
        let currentAvatar = INITIAL_CHESS_DATA.avatar;
        let currentUsername = "tm_kingreal";
        let currentName = "nguyễn hoàng hải";
        let currentUrl = "https://www.chess.com/member/tm_kingreal";

        if (profileRes && profileRes.ok) {
          const profileJson = await profileRes.json();
          if (profileJson.username) currentUsername = profileJson.username;
          if (profileJson.name) currentName = profileJson.name;
          if (profileJson.avatar) currentAvatar = profileJson.avatar;
          if (profileJson.url) currentUrl = profileJson.url;
        }

        if (statsRes && statsRes.ok) {
          const statsJson = await statsRes.json();
          if (statsJson.chess_rapid?.last?.rating) currentRapid = statsJson.chess_rapid.last.rating;
          if (statsJson.chess_blitz?.last?.rating) currentBlitz = statsJson.chess_blitz.last.rating;
          if (statsJson.chess_bullet?.last?.rating) currentBullet = statsJson.chess_bullet.last.rating;
        }

        // 2. Fetch live real-time VIEWS (scraped via /api/chess or cached static /chess-data.json)
        let liveViews = 9488;
        let liveViewsFormatted = "9,488";

        try {
          const apiRes = await fetch('/api/chess');
          if (apiRes.ok) {
            const apiJson = await apiRes.json();
            if (apiJson.views) {
              liveViews = apiJson.views;
              liveViewsFormatted = apiJson.viewsFormatted || liveViews.toLocaleString();
            }
          } else {
            throw new Error('Fallback to static data');
          }
        } catch {
          // Fallback to static chess-data.json
          try {
            const staticRes = await fetch('/chess-data.json');
            if (staticRes.ok) {
              const staticJson = await staticRes.json();
              if (staticJson.views) {
                liveViews = staticJson.views;
                liveViewsFormatted = staticJson.viewsFormatted || liveViews.toLocaleString();
              }
            }
          } catch {
            // Keep default
          }
        }

        if (isMounted) {
          setData({
            username: currentUsername,
            name: currentName,
            avatar: currentAvatar,
            views: liveViews,
            viewsFormatted: liveViewsFormatted,
            url: currentUrl,
            rapid: currentRapid,
            blitz: currentBlitz,
            bullet: currentBullet,
          });
        }
      } catch (err) {
        console.warn("Using default chess stats:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchChessInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto select-none font-['JetBrains_Mono',monospace]">
      <div className="relative rounded-2xl bg-[#080c14]/95 border border-[#81b64c]/40 p-4 shadow-[0_0_30px_rgba(129,182,76,0.22)] backdrop-blur-xl transition-all duration-300">
        
        {/* Subtle neon corner glows */}
        <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-[#81b64c] rounded-tl-2xl opacity-75 pointer-events-none" />
        <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-[#81b64c] rounded-br-2xl opacity-75 pointer-events-none" />

        {/* Top Header: Avatar on left, Username & Views on right */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* Avatar on the left - small with neon border */}
            <div className="relative group">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#81b64c]/70 shadow-[0_0_10px_rgba(129,182,76,0.4)] bg-black/50 flex-shrink-0">
                <img 
                  src={data.avatar} 
                  alt={data.username} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#81b64c] rounded-full border border-black shadow-[0_0_6px_#81b64c]" />
            </div>

            {/* Name and views (small, JetBrains Mono) */}
            <div className="flex flex-col text-left">
              <a 
                href={data.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-semibold text-zinc-100 hover:text-[#81b64c] transition-colors flex items-center gap-1.5"
                title="Open Chess.com Profile"
              >
                <span>{data.username}</span>
                {/* Neon external link arrow */}
                <svg className="w-2.5 h-2.5 text-[#81b64c] opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>

              {/* Views count accurately from API with drawn Neon Eye SVG (no emoji) */}
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-zinc-400">
                <svg 
                  className="w-3 h-3 text-[#81b64c] filter drop-shadow-[0_0_4px_rgba(129,182,76,0.8)] flex-shrink-0" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="text-zinc-300 font-medium">
                  {data.viewsFormatted || data.views.toLocaleString()}
                </span>
                <span className="text-zinc-500 text-[9px]">views</span>
              </div>
            </div>
          </div>

          {/* Close button with subtle neon hover */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer"
              title="Close"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* 3 Elo Columns: Rapid, Blitz, Bullet with custom Neon Drawn SVGs (No Emojis) */}
        <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-zinc-800/80">
          
          {/* Column 1: RAPID (Neon Stopwatch SVG with Cyan/Emerald Glow) */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/40 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.08)] group hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-center mb-1">
              <svg 
                className="w-4 h-4 text-emerald-400 filter drop-shadow-[0_0_6px_rgba(52,211,153,0.9)]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l2.5 1.5" />
                <path d="M10 2h4" />
                <path d="M12 2v3" />
              </svg>
            </div>
            <span className="text-[9px] font-bold tracking-widest text-emerald-400/90 uppercase">
              RAPID
            </span>
            <span className="text-sm font-bold text-white mt-0.5 filter drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]">
              {data.rapid}
            </span>
          </div>

          {/* Column 2: BLITZ (Neon Lightning Bolt SVG with Amber/Gold Glow) */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/40 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.08)] group hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-center mb-1">
              <svg 
                className="w-4 h-4 text-amber-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.95)]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="text-[9px] font-bold tracking-widest text-amber-400/90 uppercase">
              BLITZ
            </span>
            <span className="text-sm font-bold text-white mt-0.5 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]">
              {data.blitz}
            </span>
          </div>

          {/* Column 3: BULLET (Horizontal Bullet with Wind-Breaking Streaks) */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/40 border border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.08)] group hover:border-rose-500/50 transition-all">
            <div className="flex items-center justify-center mb-1">
              <svg 
                className="w-4 h-4 text-rose-400 filter drop-shadow-[0_0_6px_rgba(251,113,133,0.95)]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Horizontal Bullet Body with flat rear (no rocket tail) */}
                <path d="M9.5 8.5h4.5c2.6 0 5 1.6 6.8 3.5-1.8 1.9-4.2 3.5-6.8 3.5H9.5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z" />
                <path d="M14 8.5v7" />
                {/* Wind-breaking trails / supersonic speed streaks (phá gió) */}
                <path d="M2.5 9h3.5" />
                <path d="M1 12h5" />
                <path d="M2.5 15h3.5" />
              </svg>
            </div>
            <span className="text-[9px] font-bold tracking-widest text-rose-400/90 uppercase">
              BULLET
            </span>
            <span className="text-sm font-bold text-white mt-0.5 filter drop-shadow-[0_0_6px_rgba(251,113,133,0.4)]">
              {data.bullet}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
