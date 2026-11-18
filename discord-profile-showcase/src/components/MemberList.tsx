import React from 'react';
import { LanyardData } from '../types';
import { MessageSquare, Bot, Sparkles, Star } from 'lucide-react';

interface MemberListProps {
  lanyardData: LanyardData | null;
  onSelectMember?: () => void;
}

export function MemberList({ lanyardData, onSelectMember }: MemberListProps) {
  const user = lanyardData?.discord_user;
  const status = lanyardData?.discord_status || 'offline';
  const customStatus = lanyardData?.activities.find(act => act.type === 4);

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

  const getStatusLabel = (statusStr: string) => {
    switch (statusStr) {
      case 'online': return 'Trực tuyến';
      case 'idle': return 'Chờ';
      case 'dnd': return 'Không làm phiền';
      case 'streaming': return 'Đang phát trực tiếp';
      default: return 'Ngoại tuyến';
    }
  };

  return (
    <div className="w-60 bg-[#2b2d31] flex flex-col h-full border-l border-zinc-950/15 p-4 select-none shrink-0 hidden lg:flex">
      {/* Active Member list */}
      <div className="space-y-4">
        
        {/* Category: Online */}
        <div>
          <div className="text-[11px] font-bold text-zinc-500 mb-1.5 tracking-wider uppercase flex items-center justify-between">
            <span>Trực tuyến — 1</span>
          </div>

          <div className="space-y-0.5">
            <button
              onClick={onSelectMember}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-zinc-800/40 text-left transition-colors group relative"
            >
              {/* Profile Avatar */}
              <div className="relative shrink-0">
                <img 
                  src={user?.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
                  alt="Member Avatar" 
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#2b2d31] ${getStatusColor(status)}`}></div>
              </div>

              {/* Identity & Status */}
              <div className="flex flex-col min-w-0">
                <span className="text-white text-xs font-semibold truncate group-hover:text-white flex items-center gap-1">
                  {user?.global_name || "VietCoder"}
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                </span>
                
                {customStatus?.state ? (
                  <span className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {customStatus.state}
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500 truncate mt-0.5">
                    {getStatusLabel(status)}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Category: Offline / Bots */}
        <div>
          <div className="text-[11px] font-bold text-zinc-500 mb-1.5 tracking-wider uppercase">
            Hệ thống Bot — 2
          </div>

          <div className="space-y-1">
            {/* Bot 1: Welcome Helper */}
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded text-left opacity-75">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-500/20">
                  W
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#2b2d31] bg-emerald-500"></div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-zinc-200 text-xs font-semibold flex items-center gap-1 truncate">
                  WelcomeBot
                  <span className="bg-[#5865F2] text-white text-[8px] font-bold px-1 rounded uppercase select-none shrink-0 scale-90">
                    BOT
                  </span>
                </span>
                <span className="text-[10px] text-zinc-400 truncate mt-0.5">Sẵn sàng chào đón</span>
              </div>
            </div>

            {/* Bot 2: Assistant Spark */}
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded text-left opacity-75">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#2b2d31] bg-emerald-500"></div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-zinc-200 text-xs font-semibold flex items-center gap-1 truncate">
                  MelodiaBot
                  <span className="bg-[#5865F2] text-white text-[8px] font-bold px-1 rounded uppercase select-none shrink-0 scale-90">
                    BOT
                  </span>
                </span>
                <span className="text-[10px] text-zinc-400 truncate mt-0.5">Listening to Music</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Info Box */}
      <div className="mt-auto bg-[#232428]/40 border border-zinc-800/60 rounded-xl p-3 text-[11px] leading-relaxed text-zinc-400 text-center flex flex-col gap-1.5">
        <Sparkles className="w-4 h-4 text-[#5865f2] mx-auto animate-pulse" />
        <span>Click vào thành viên <b>{user?.global_name || "VietCoder"}</b> để xem thẻ thông tin chi tiết!</span>
      </div>
    </div>
  );
}
