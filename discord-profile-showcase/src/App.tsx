import React, { useState, useEffect, useRef } from 'react';
import { useLanyard } from './hooks/useLanyard';
import { DEFAULT_PORTFOLIO, DEFAULT_LANYARD_MOCK } from './utils/mockData';
import { PortfolioData, LanyardData } from './types';
import { Sidebar } from './components/Sidebar';
import { DiscordChatView } from './components/DiscordChatView';
import { MemberList } from './components/MemberList';
import { DiscordProfileModal } from './components/DiscordProfileModal';
import { PortfolioEditor } from './components/PortfolioEditor';
import { SpaceBackground } from './components/SpaceBackground';
import { CosmicShowcase } from './components/CosmicShowcase';
import { CinematicIntro } from './components/CinematicIntro';
import { BackgroundMusic, BackgroundMusicHandle } from './components/BackgroundMusic';
import { Sparkles, Star, Github, Info, AlertTriangle, Monitor, Smartphone, RefreshCw, X, Radio, Eye, Heart } from 'lucide-react';

export default function App() {
  // Cinematic Gateway sequence step: 'text' | 'opening' | 'complete'
  const [introStep, setIntroStep] = useState<'text' | 'opening' | 'complete'>('text');

  // Layout Modes: 'cosmic' (Special high fidelity space card) or 'discord' (Simulated Client UI)
  const [layoutMode, setLayoutMode] = useState<'cosmic' | 'discord'>(() => {
    return (localStorage.getItem('discord_portfolio_layout_mode') as any) || 'cosmic';
  });

  // Load state from localStorage or use defaults
  const [portfolio, setPortfolio] = useState<PortfolioData>(() => {
    const saved = localStorage.getItem('discord_portfolio_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.projects)) {
          // Remove the 3 unwanted legacy projects and migrate old TheMaster AI link
          parsed.projects = parsed.projects
            .filter((p: any) => {
              const title = (p.title || '').toLowerCase();
              const url = (p.demoUrl || p.githubUrl || '').toLowerCase().trim();
              if (title.includes('melodia') || title.includes('devspace') || title.includes('portfolio website phong cách discord')) return false;
              if (url === '#' || url === 'https://discord.com' || url === 'https://devspace.com' || !url) return false;
              return true;
            })
            .map((p: any) => {
              const isOldAI =
                (p.demoUrl && p.demoUrl.includes('themasterai-three.vercel.app')) ||
                (p.githubUrl && p.githubUrl.includes('themasterai-three.vercel.app'));
              if (isOldAI) {
                return {
                  ...p,
                  demoUrl: 'https://themasters-pi.vercel.app/',
                  githubUrl: 'https://themasters-pi.vercel.app/'
                };
              }
              return p;
            });

          // Ensure new projects exist even if localStorage was previously saved
          const existingUrls = new Set(parsed.projects.map((p: any) => (p.demoUrl || p.githubUrl || '').trim()));
          DEFAULT_PORTFOLIO.projects.forEach(defaultProj => {
            if (!existingUrls.has((defaultProj.demoUrl || defaultProj.githubUrl || '').trim())) {
              parsed.projects.push(defaultProj);
            }
          });
        }
        return parsed;
      } catch {
        return DEFAULT_PORTFOLIO;
      }
    }
    return DEFAULT_PORTFOLIO;
  });

  const [discordUserId, setDiscordUserId] = useState<string>(() => {
    const saved = localStorage.getItem('discord_portfolio_userid');
    if (!saved || saved === '999999999999999999') {
      return '1275443009500221450';
    }
    return saved;
  });

  const [isLanyardEnabled, setIsLanyardEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('discord_portfolio_lanyard_enabled');
    // Default to true, or keep if already true
    if (saved === null || localStorage.getItem('discord_portfolio_userid') === '999999999999999999') {
      return true;
    }
    return saved === 'true';
  });

  const [selectedStatus, setSelectedStatus] = useState<'online' | 'idle' | 'dnd' | 'offline'>(() => {
    return (localStorage.getItem('discord_portfolio_selected_status') as any) || 'online';
  });

  // App layouts & tabs
  const [activeView, setActiveView] = useState<'home' | 'portfolio'>('portfolio');
  const [activeChannel, setActiveChannel] = useState<string>('about');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Sync to local storage on changes
  useEffect(() => {
    localStorage.setItem('discord_portfolio_layout_mode', layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    localStorage.setItem('discord_portfolio_data', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('discord_portfolio_userid', discordUserId);
  }, [discordUserId]);

  useEffect(() => {
    localStorage.setItem('discord_portfolio_lanyard_enabled', String(isLanyardEnabled));
  }, [isLanyardEnabled]);

  useEffect(() => {
    localStorage.setItem('discord_portfolio_selected_status', selectedStatus);
  }, [selectedStatus]);

  // Fetch live Discord status
  const { data: liveData, loading: liveLoading, error: liveError } = useLanyard(discordUserId, isLanyardEnabled);

  // Fallback / simulated data
  const simulatedData = DEFAULT_LANYARD_MOCK(selectedStatus);
  
  // Choose which dataset to display
  let activeLanyardData: LanyardData | null = simulatedData;
  if (isLanyardEnabled) {
    if (liveData) {
      activeLanyardData = liveData;
    } else {
      // While loading or on error, overlay custom user details on mock without any fake activities
      activeLanyardData = {
        ...simulatedData,
        discord_status: 'offline', // default fallback
        listening_to_spotify: false,
        spotify: null,
        activities: [], // Absolutely empty activities while connecting or loading
        discord_user: {
          ...simulatedData.discord_user,
          id: discordUserId || simulatedData.discord_user.id,
          username: 'connecting',
          global_name: 'Connecting...',
        }
      };
    }
  }

  // Override profile bio and status text in active lanyard mock if we are in simulated mode
  if (!isLanyardEnabled) {
    activeLanyardData.discord_user.global_name = portfolio.customBadges.includes("Premium") ? "TheMaster" : "TheMaster";
    activeLanyardData.discord_user.username = "tmkingreal_94065";
  }


  const [isMusicStarted, setIsMusicStarted] = useState<boolean>(false);
  const backgroundMusicRef = useRef<BackgroundMusicHandle | null>(null);

  const handleStartOpening = () => {
    setIsMusicStarted(true);
    backgroundMusicRef.current?.play();
  };

  const handleSendMessageTrigger = () => {
    setActiveView('home');
    setActiveChannel('dm-owner');
  };

  const handleStatusChange = (status: 'online' | 'idle' | 'dnd' | 'offline') => {
    setSelectedStatus(status);
  };

  return (
    <div className="min-h-screen text-[#dbdee1] flex flex-col font-sans selection:bg-[#5865f2]/40 relative overflow-x-hidden justify-center py-8">
      
      {/* 🎬 Opening screen with "Click to start" & sliding portal doors */}
      {introStep !== 'complete' && (
        <CinematicIntro 
          onStart={handleStartOpening}
          onStepChange={setIntroStep} 
        />
      )}

      {/* 🌌 SpaceBackground is universally mounted underneath for premium galactic atmosphere - fades in gradually as doors slide apart */}
      <div className={`transition-opacity duration-[2000ms] ${introStep === 'text' ? 'opacity-0' : 'opacity-100'}`}>
        <SpaceBackground introStep={introStep} />
      </div>
      
      {/* 2. Main Content View Area - scale and blur transitions aligned with opening doors */}
      <main className={`flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 grid grid-cols-12 gap-6 min-h-screen z-10 items-center justify-center transition-all duration-[1500ms] ${
        introStep === 'text' ? 'opacity-0 scale-95 blur-md pointer-events-none' : 'opacity-100 scale-100 blur-none pointer-events-auto'
      }`}>
        
        {layoutMode === 'cosmic' ? (
          /* COSMIC SHOWCASE MODE: As shown in user picture! */
          <div className="col-span-12 flex flex-col justify-center items-center">
            <CosmicShowcase 
              lanyardData={activeLanyardData}
              portfolio={portfolio}
              onOpenProfile={() => setIsProfileModalOpen(true)}
            />
          </div>
        ) : (
          /* DISCORD CLIENT SIMULATION VIEWPORT */
          <section className="col-span-12 flex flex-col bg-[#313338]/90 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative backdrop-blur-md">
            
            {/* Discord client simulation viewport */}
            <div className="flex flex-1 h-full overflow-hidden">
              
              {/* Server & Channel Sidebars */}
              <Sidebar 
                activeView={activeView}
                setActiveView={(view) => {
                  setActiveView(view);
                  if (view === 'portfolio') {
                    setActiveChannel('about');
                  } else {
                    setActiveChannel('dm-owner');
                  }
                }}
                activeChannel={activeChannel}
                setActiveChannel={setActiveChannel}
                lanyardData={activeLanyardData}
                portfolio={portfolio}
              />

              {/* Chat View Stream */}
              <DiscordChatView 
                activeChannel={activeChannel}
                lanyardData={activeLanyardData}
                portfolio={portfolio}
              />

              {/* Members Panel */}
              <MemberList 
                lanyardData={activeLanyardData}
                onSelectMember={() => setIsProfileModalOpen(true)}
              />
            </div>

            {/* Quick instructions indicator overlay */}
            <div className="absolute top-2.5 right-4 z-40 lg:hidden">
              <button 
                id="view-card-btn"
                onClick={() => setIsProfileModalOpen(true)}
                className="bg-[#5865f2] hover:bg-[#4752c4] text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg shadow-black/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Xem Profile Card
              </button>
            </div>
          </section>
        )}
      </main>

      {/* 3. High Fidelity Profile Modal Popout (on click member list/button) */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div 
            className="relative transform scale-100 opacity-100 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button inside modal bubble */}
            <button 
              id="close-modal-btn"
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-3 right-3 bg-zinc-950/40 hover:bg-zinc-950/60 p-1.5 rounded-full text-zinc-400 hover:text-white transition-colors z-50"
            >
              <X className="w-4 h-4" />
            </button>
            
            <DiscordProfileModal 
              lanyardData={activeLanyardData}
              portfolio={portfolio}
              isLoading={isLanyardEnabled && liveLoading}
              onSendMessage={() => {
                setIsProfileModalOpen(false);
                handleSendMessageTrigger();
              }}
            />
          </div>
          
          {/* Backdrop Click */}
          <div className="absolute inset-0 -z-10" onClick={() => setIsProfileModalOpen(false)}></div>
        </div>
      )}

      {/* 🎵 Background Music Player (Reads from /public/music/ and subfolders) */}
      <BackgroundMusic 
        ref={backgroundMusicRef}
        isStarted={isMusicStarted}
      />
    </div>
  );
}
