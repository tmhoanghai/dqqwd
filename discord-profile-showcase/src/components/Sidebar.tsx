import React, { useState } from 'react';
import { LanyardData, PortfolioData } from '../types';
import { 
  Compass, Plus, MessageSquare, Headphones, Mic, MicOff, Volume2, VolumeX, 
  Settings, Users, Hash, ShieldCheck, ChevronDown, Sparkles 
} from 'lucide-react';

interface SidebarProps {
  activeView: 'home' | 'portfolio';
  setActiveView: (view: 'home' | 'portfolio') => void;
  activeChannel: string;
  setActiveChannel: (channel: string) => void;
  lanyardData: LanyardData | null;
  portfolio: PortfolioData;
}

export function Sidebar({
  activeView,
  setActiveView,
  activeChannel,
  setActiveChannel,
  lanyardData,
  portfolio
}: SidebarProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const status = lanyardData?.discord_status || 'offline';
  const user = lanyardData?.discord_user;

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

  // Portfolio Channels List
  const channels = [
    { id: 'about', label: '👋-về-mình', category: 'THÔNG TIN' },
    { id: 'skills', label: '🛠-kỹ-năng', category: 'THÔNG TIN' },
    { id: 'projects', label: '🚀-dự-án', category: 'PORTFOLIO' },
    { id: 'contact', label: '📞-liên-hệ', category: 'PORTFOLIO' }
  ];

  return (
    <div className="h-full flex select-none shrink-0">
      {/* 1. Left-most Server Sidebar */}
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 border-r border-zinc-950/25 h-full overflow-y-auto scrollbar-none">
        {/* DM / Home Icon */}
        <div className="relative group flex items-center justify-center w-full">
          {/* Left Pill Highlight */}
          <div className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-300 ${activeView === 'home' ? 'h-10' : 'h-0 group-hover:h-5'}`}></div>
          
          <button 
            onClick={() => setActiveView('home')}
            className={`w-12 h-12 rounded-3xl flex items-center justify-center transition-all duration-300 ${activeView === 'home' ? 'bg-[#5865f2] rounded-2xl text-white' : 'bg-[#313338] text-[#dbdee1] hover:bg-[#5865f2] hover:rounded-2xl hover:text-white'}`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          
          {/* Tooltip */}
          <div className="absolute left-[80px] bg-zinc-950 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-50">
            Tin nhắn trực tiếp
          </div>
        </div>

        {/* Separator */}
        <div className="w-8 h-[2px] bg-zinc-800 rounded-full my-1"></div>

        {/* Portfolio Server Icon */}
        <div className="relative group flex items-center justify-center w-full">
          <div className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-300 ${activeView === 'portfolio' ? 'h-10' : 'h-0 group-hover:h-5'}`}></div>
          
          <button 
            onClick={() => setActiveView('portfolio')}
            className={`w-12 h-12 rounded-3xl flex items-center justify-center font-bold text-sm overflow-hidden transition-all duration-300 ${activeView === 'portfolio' ? 'bg-[#5865f2] rounded-2xl text-white' : 'bg-[#313338] text-[#dbdee1] hover:bg-[#5865f2] hover:rounded-2xl hover:text-white'}`}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Portfolio" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span>PORT</span>
            )}
          </button>
          
          <div className="absolute left-[80px] bg-zinc-950 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-50">
            Server Portfolio
          </div>
        </div>

        {/* Mock Server 1 */}
        <div className="relative group flex items-center justify-center w-full opacity-60 hover:opacity-100 transition-opacity">
          <button className="w-12 h-12 rounded-3xl bg-[#313338] text-zinc-400 hover:bg-[#232428] hover:rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300">
            JS
          </button>
          <div className="absolute left-[80px] bg-zinc-950 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-50">
            Javascript VN (Mock)
          </div>
        </div>

        {/* Add Server & Explore Buttons */}
        <div className="mt-auto flex flex-col gap-2">
          <button className="w-12 h-12 rounded-3xl bg-[#313338] hover:bg-emerald-600 text-emerald-500 hover:text-white hover:rounded-2xl flex items-center justify-center transition-all duration-300">
            <Plus className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-3xl bg-[#313338] hover:bg-[#5865f2] text-[#5865f2] hover:text-white hover:rounded-2xl flex items-center justify-center transition-all duration-300">
            <Compass className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Channel List / Direct Messages Sidebar */}
      <div className="w-60 bg-[#2b2d31] flex flex-col h-full border-r border-zinc-950/20">
        
        {/* Header Block */}
        {activeView === 'portfolio' ? (
          <div className="h-12 border-b border-zinc-950/15 flex items-center justify-between px-4 hover:bg-zinc-800/20 cursor-pointer transition-colors shrink-0">
            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
              <ShieldCheck className="w-4 h-4 text-[#5865f2]" />
              <span className="truncate">Portfolio Space</span>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
          </div>
        ) : (
          <div className="h-12 border-b border-zinc-950/15 flex items-center px-3 shrink-0">
            <button className="w-full bg-[#1e1f22] text-zinc-500 text-xs text-left px-2.5 py-1.5 rounded-md hover:text-zinc-300 transition-colors">
              Tìm kiếm hoặc bắt đầu cuộc trò chuyện
            </button>
          </div>
        )}

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {activeView === 'portfolio' ? (
            // Portfolio Server Channel Categories
            <div>
              {['THÔNG TIN', 'PORTFOLIO'].map((cat) => (
                <div key={cat} className="mb-4">
                  <div className="text-[11px] font-bold text-zinc-500 px-1.5 mb-1 tracking-wider uppercase flex items-center justify-between">
                    <span>{cat}</span>
                    <Plus className="w-3.5 h-3.5 hover:text-zinc-200 cursor-pointer" />
                  </div>
                  <div className="space-y-0.5">
                    {channels
                      .filter((ch) => ch.category === cat)
                      .map((ch) => {
                        const isSelected = activeChannel === ch.id;
                        return (
                          <button
                            key={ch.id}
                            onClick={() => setActiveChannel(ch.id)}
                            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-left transition-colors font-medium group ${isSelected ? 'bg-zinc-700/60 text-white font-semibold' : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'}`}
                          >
                            <Hash className="w-4 h-4 text-zinc-400 shrink-0" />
                            <span className="truncate">{ch.label.split('-')[1]}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Direct Messages Sidebar List
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-zinc-500 px-1.5 tracking-wider uppercase">
                TIN NHẮN TRỰC TIẾP
              </div>
              <button
                onClick={() => setActiveChannel('dm-owner')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-left transition-colors font-medium ${activeChannel === 'dm-owner' ? 'bg-zinc-700/60 text-white font-semibold' : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'}`}
              >
                <div className="relative shrink-0">
                  <img 
                    src={user?.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
                    alt="Owner avatar" 
                    className="w-8 h-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#2b2d31] ${getStatusColor(status)}`}></div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-white text-xs font-semibold truncate leading-tight">
                    {user?.global_name || "VietCoder"}
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate mt-0.5">
                    {status === 'offline' ? 'Ngoại tuyến' : 'Đang trực tuyến'}
                  </span>
                </div>
              </button>

              <div className="bg-[#232428]/30 border border-[#5865f2]/10 rounded-lg p-2.5 mt-4 text-[11px] text-zinc-400 leading-normal">
                <span className="text-white font-bold block mb-1 text-xxs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  AI CHATBOT
                </span>
                Nhấp vào tin nhắn trực tiếp với tôi ở trên để kích hoạt trợ lý AI của tôi, sẵn sàng trả lời các câu hỏi về tôi!
              </div>
            </div>
          )}
        </div>

        {/* 3. Bottom Voice / User Status Bar */}
        <div className="h-[52px] bg-[#232428] px-2 flex items-center justify-between shrink-0 border-t border-zinc-950/15">
          {/* User Details */}
          <div className="flex items-center gap-2 min-w-0 max-w-[120px] cursor-pointer hover:bg-zinc-800/40 p-1 rounded-md transition-colors">
            <div className="relative shrink-0">
              <img 
                src={user?.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
                alt="My Profile" 
                className="w-8 h-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#232428] ${getStatusColor(status)}`}></div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate leading-tight">
                {user?.global_name || "VietCoder"}
              </span>
              <span className="text-[10px] text-zinc-400 truncate mt-0.5">
                @{user?.username || "viet_coder"}
              </span>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-0.5 text-zinc-400">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-1.5 hover:bg-zinc-700/60 hover:text-zinc-200 rounded-md transition-colors relative`}
              title={isMuted ? "Bật Mic" : "Tắt Mic"}
            >
              {isMuted ? <MicOff className="w-4 h-4 text-rose-500" /> : <Mic className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setIsDeafened(!isDeafened)}
              className={`p-1.5 hover:bg-zinc-700/60 hover:text-zinc-200 rounded-md transition-colors`}
              title={isDeafened ? "Bật Âm Thanh" : "Tắt Âm Thanh"}
            >
              {isDeafened ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Headphones className="w-4 h-4" />}
            </button>
            <button className="p-1.5 hover:bg-zinc-700/60 hover:text-zinc-200 rounded-md transition-colors" title="Cài đặt">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
