import React, { useState, useEffect, useRef } from 'react';
import { LanyardData, PortfolioData } from '../types';
import { 
  Hash, Users, Search, Bell, Pin, AtSign, Inbox, HelpCircle, 
  Send, Compass, Sparkles, AlertCircle, ExternalLink, ArrowUpRight 
} from 'lucide-react';

interface DiscordChatViewProps {
  activeChannel: string;
  lanyardData: LanyardData | null;
  portfolio: PortfolioData;
}

interface Message {
  id: string;
  sender: 'owner' | 'guest';
  senderName: string;
  avatar: string;
  timestamp: string;
  text: string;
  embeds?: {
    title?: string;
    description?: string;
    fields?: { name: string; value: string; inline?: boolean }[];
    color?: string;
    footer?: string;
    buttonText?: string;
    buttonUrl?: string;
  }[];
}

export function DiscordChatView({ activeChannel, lanyardData, portfolio }: DiscordChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const user = lanyardData?.discord_user;
  const status = lanyardData?.discord_status || 'offline';
  const ownerName = user?.global_name || 'VietCoder';
  const ownerAvatar = user?.avatar || "https://cdn.discordapp.com/embed/avatars/0.png";

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

  // Pre-load default messages when channel changes
  useEffect(() => {
    const now = "Hôm nay lúc " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (activeChannel === 'about') {
      setMessages([
        {
          id: 'welcome',
          sender: 'owner',
          senderName: ownerName,
          avatar: ownerAvatar,
          timestamp: now,
          text: `Chào mừng mọi người đến với **#👋-về-mình**! Dưới đây là đôi nét giới thiệu về cuộc hành trình của mình.`,
          embeds: [
            {
              title: `Giới thiệu bản thân`,
              description: portfolio.bio,
              fields: [
                { name: '✨ Trạng thái tuỳ chỉnh', value: portfolio.customStatusText || 'Không có', inline: true },
                { name: '⭐ Mục tiêu', value: 'Trở thành một kĩ sư phần mềm xuất sắc và xây dựng các sản phẩm công nghệ có ích cho cộng đồng.', inline: true }
              ],
              color: '#5865F2'
            }
          ]
        }
      ]);
    } else if (activeChannel === 'skills') {
      setMessages([
        {
          id: 'skills-msg',
          sender: 'owner',
          senderName: ownerName,
          avatar: ownerAvatar,
          timestamp: now,
          text: `Đây là danh sách các kỹ năng kỹ thuật mình tích lũy được trong quá trình học tập và làm việc. **#🛠-kỹ-năng**`
        }
      ]);
    } else if (activeChannel === 'projects') {
      setMessages([
        {
          id: 'projects-msg',
          sender: 'owner',
          senderName: ownerName,
          avatar: ownerAvatar,
          timestamp: now,
          text: `Chào mọi người! Đây là danh sách các dự án tiêu biểu mà mình từng thiết kế và lập trình. Xem đầy đủ tại kênh **#🚀-dự-án** này nhé!`
        }
      ]);
    } else if (activeChannel === 'contact') {
      setMessages([
        {
          id: 'contact-msg',
          sender: 'owner',
          senderName: ownerName,
          avatar: ownerAvatar,
          timestamp: now,
          text: `Chào bạn! Cảm ơn bạn đã quan tâm. Hãy chọn các liên kết mạng xã hội dưới đây để kết nối với mình nhé. **#📞-liên-hệ**`
        }
      ]);
    } else if (activeChannel === 'dm-owner') {
      setMessages([
        {
          id: 'dm-welcome',
          sender: 'owner',
          senderName: ownerName,
          avatar: ownerAvatar,
          timestamp: now,
          text: `Xin chào! Cảm ơn bạn đã nhắn tin cho mình. Đây là Trợ lý AI tự động của ${ownerName}. Bạn muốn hỏi mình điều gì thế? Hãy nhấn vào các phím trả lời nhanh bên dưới hoặc tự viết câu hỏi nhé! 👇`
        }
      ]);
    }
  }, [activeChannel, ownerName, ownerAvatar, portfolio]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle DM message submission
  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const now = "Hôm nay lúc " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // 1. Add guest message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'guest',
      senderName: 'Khách Ghé Thăm',
      avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
      timestamp: now,
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // 2. Generate simulated AI reply after delay
    setTimeout(() => {
      let replyText = "Cảm ơn bạn đã quan tâm! Mình đã nhận được tin nhắn của bạn. Bạn có thể kết nối trực tiếp với mình qua Email hoặc Facebook trong mục **#liên-hệ** nhé!";
      
      const textLower = textToSend.toLowerCase();
      if (textLower.includes('dự án') || textLower.includes('project')) {
        replyText = `Mình có một số dự án tiêu biểu như:\n1. **TheMaster AI** & **themasterplayer**\n2. **Never Give Up player** & **the fur1ous**\n3. **minecraft anticheat**\n\nBạn có thể vào kênh **#🚀-dự-án** để xem chi tiết mã nguồn và demo hoạt động nhé!`;
      } else if (textLower.includes('kỹ năng') || textLower.includes('skill') || textLower.includes('lập trình')) {
        replyText = `Các kỹ năng nổi bật của mình bao gồm:\n- **Frontend**: ${portfolio.skills.slice(0, 4).join(', ')}\n- **Backend**: ${portfolio.skills.slice(4).join(', ')}\n\nChi tiết xem tại **#🛠-kỹ-năng** nha.`;
      } else if (textLower.includes('liên hệ') || textLower.includes('email') || textLower.includes('sđt') || textLower.includes('facebook')) {
        replyText = `Bạn có thể liên hệ trực tiếp với mình qua:\n${portfolio.socials.map(s => `- **${s.platform}**: [${s.username}](${s.url})`).join('\n')}\nRất mong được hợp tác với bạn!`;
      } else if (textLower.includes('chào') || textLower.includes('hello') || textLower.includes('hi')) {
        replyText = `Chào bạn! Rất vui được trò chuyện với bạn. Mình là một lập trình viên thích thiết kế. Bạn cần hỏi mình điều gì về kỹ năng, dự án hay liên hệ hợp tác không?`;
      }

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'owner',
        senderName: ownerName,
        avatar: ownerAvatar,
        timestamp: now,
        text: replyText
      };

      setIsTyping(false);
      setMessages(prev => [...prev, botMsg]);
    }, 1500);
  };

  const quickReplies = [
    { text: "Xem các dự án nổi bật của bạn 🚀", payload: "Các dự án nổi bật của bạn là gì?" },
    { text: "Bạn thành thạo kỹ năng nào? 🛠", payload: "Kỹ năng lập trình của bạn gồm những gì?" },
    { text: "Làm sao để liên hệ trực tiếp? 📞", payload: "Làm thế nào để mình liên hệ trực tiếp với bạn?" },
    { text: "Chào hỏi kết nối bạn bè 👋", payload: "Xin chào! Rất vui được kết nối với bạn." }
  ];

  return (
    <div className="flex-1 bg-[#313338] flex flex-col h-full overflow-hidden relative">
      {/* 1. Header Bar */}
      <div className="h-12 border-b border-zinc-950/20 px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          {activeChannel === 'dm-owner' ? (
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-bold text-lg">@</span>
              <span className="text-white font-bold text-sm">{ownerName}</span>
              <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status)}`}></div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Hash className="w-5 h-5 text-zinc-400 shrink-0" />
              <span className="text-white font-bold text-sm">
                {activeChannel === 'about' && 'về-mình'}
                {activeChannel === 'skills' && 'kỹ-năng'}
                {activeChannel === 'projects' && 'dự-án'}
                {activeChannel === 'contact' && 'liên-hệ'}
              </span>
              <div className="w-[1px] h-4 bg-zinc-700 mx-2"></div>
              <span className="text-xs text-zinc-400 font-normal hidden md:inline truncate max-w-[300px]">
                {activeChannel === 'about' && 'Kênh dùng để giới thiệu thông tin và tiểu sử bản thân.'}
                {activeChannel === 'skills' && 'Hiển thị các công nghệ và kỹ năng chuyên môn.'}
                {activeChannel === 'projects' && 'Danh sách các sản phẩm và dự án mã nguồn mở.'}
                {activeChannel === 'contact' && 'Các liên kết mạng xã hội để kết nối.'}
              </span>
            </div>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-4 text-zinc-400">
          <Bell className="w-5 h-5 cursor-pointer hover:text-zinc-200" />
          <Pin className="w-5 h-5 cursor-pointer hover:text-zinc-200" />
          <Users className="w-5 h-5 cursor-pointer hover:text-zinc-200" />
          <div className="relative flex items-center bg-[#1e1f22] rounded px-2 py-1">
            <input 
              type="text" 
              placeholder="Tìm kiếm" 
              className="bg-transparent outline-none border-none text-xs text-white placeholder-zinc-500 w-24 focus:w-36 transition-all duration-300"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <Inbox className="w-5 h-5 cursor-pointer hover:text-zinc-200" />
          <HelpCircle className="w-5 h-5 cursor-pointer hover:text-zinc-200" />
        </div>
      </div>

      {/* 2. Main Chat Messages Flow */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin">
        {/* Channel Start Welcome Card */}
        {activeChannel !== 'dm-owner' && (
          <div className="mb-6 pb-6 border-b border-zinc-800/30">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-white mb-4 shadow-inner">
              <Hash className="w-10 h-10 text-zinc-300" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Chào mừng bạn đến với #
              {activeChannel === 'about' && 'về-mình'}
              {activeChannel === 'skills' && 'kỹ-năng'}
              {activeChannel === 'projects' && 'dự-án'}
              {activeChannel === 'contact' && 'liên-hệ'}!
            </h1>
            <p className="text-sm text-zinc-400 mt-2">
              Đây là sự khởi đầu của kênh #
              {activeChannel === 'about' && 'về-mình'} giới thiệu chi tiết cá nhân.
            </p>
          </div>
        )}

        {/* Map Chat Messages */}
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-4 hover:bg-zinc-800/15 p-1 rounded-md transition-colors group">
            <img 
              src={msg.avatar} 
              alt={msg.senderName} 
              className="w-10 h-10 rounded-full object-cover shrink-0 bg-zinc-700 border border-zinc-800"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold text-white hover:underline cursor-pointer ${msg.sender === 'owner' ? 'text-[#5865f2]' : ''}`}>
                  {msg.senderName}
                </span>
                {msg.sender === 'owner' && (
                  <span className="bg-[#5865F2] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase select-none">
                    Chủ Nhà
                  </span>
                )}
                <span className="text-[10px] text-zinc-400 font-medium">{msg.timestamp}</span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed mt-1 whitespace-pre-wrap">
                {msg.text}
              </p>

              {/* Embed Blocks */}
              {msg.embeds && msg.embeds.map((embed, eIdx) => (
                <div key={eIdx} className="mt-3 bg-[#1e1f22]/90 border border-zinc-800 rounded-lg p-4 max-w-lg shadow-lg flex flex-col gap-2.5">
                  {embed.title && <h4 className="text-sm font-bold text-white tracking-wide">{embed.title}</h4>}
                  {embed.description && <p className="text-xs text-zinc-300 leading-relaxed">{embed.description}</p>}
                  
                  {embed.fields && (
                    <div className="grid grid-cols-2 gap-3 mt-1 pt-3 border-t border-zinc-800/60">
                      {embed.fields.map((f, fIdx) => (
                        <div key={fIdx} className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{f.name}</span>
                          <span className="text-xs text-zinc-200">{f.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Interactive Custom Views based on activeChannel */}
        {activeChannel === 'skills' && (
          <div className="pl-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mt-4">
            {portfolio.skills.map((skill, index) => (
              <div 
                key={index}
                className="bg-[#2b2d31] p-3 rounded-xl border border-zinc-800 flex items-center gap-3 shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-[#5865f2]/10 flex items-center justify-center text-[#5865f2]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">{skill}</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">Kỹ năng cốt lõi</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeChannel === 'projects' && (
          <div className="pl-14 space-y-4 max-w-2xl mt-4">
            {portfolio.projects.map((proj, index) => (
              <div 
                key={index} 
                className="bg-[#2b2d31] rounded-xl border border-zinc-800 p-4 shadow-md flex flex-col gap-3"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white">{proj.title}</span>
                    <p className="text-xs text-zinc-300 leading-relaxed">{proj.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {proj.techStack.map((tech, tIdx) => (
                    <span 
                      key={tIdx} 
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1e1f22] text-[#5865f2] border border-zinc-800"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2.5 mt-1 pt-3 border-t border-zinc-800/50">
                  {proj.githubUrl && (
                    <a 
                      href={proj.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-[#4e5058] hover:bg-[#6d6f78] text-white text-xs px-3.5 py-1.5 rounded font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      Mã Nguồn GitHub
                    </a>
                  )}
                  {proj.demoUrl && (
                    <a 
                      href={proj.demoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-[#248046] hover:bg-[#1a6535] text-white text-xs px-3.5 py-1.5 rounded font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      Dùng Thử <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeChannel === 'contact' && (
          <div className="pl-14 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mt-4">
            {portfolio.socials.map((social, index) => (
              <div 
                key={index} 
                className="bg-[#2b2d31] rounded-xl border border-zinc-800 overflow-hidden flex flex-col shadow-md"
              >
                {/* Simulated Server Invite Layout */}
                <div className="p-3 bg-zinc-950/20 text-[11px] font-bold text-zinc-400 uppercase tracking-wide border-b border-zinc-800/40">
                  BẠN ĐÃ NHẬN ĐƯỢC LỜI MỜI THAM GIA
                </div>
                <div className="p-4 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#5865f2] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {social.platform.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white truncate leading-tight">
                        {social.platform} Connect
                      </span>
                      <span className="text-xs text-zinc-400 truncate mt-1">
                        @{social.username}
                      </span>
                    </div>
                  </div>
                  
                  <a 
                    href={social.url}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-[#248046] hover:bg-[#1a6535] text-white text-xs px-4 py-2 rounded-md font-bold transition-colors shrink-0 flex items-center gap-1"
                  >
                    Ghé thăm
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-4 items-center pl-1">
            <img 
              src={ownerAvatar} 
              alt="Typing..." 
              className="w-10 h-10 rounded-full object-cover shrink-0 border border-zinc-800"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">{ownerName}</span>
              <div className="flex items-center gap-1 bg-zinc-800/40 px-3 py-2 rounded-xl mt-1 max-w-[120px]">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 3. Bottom Reply / Input Bar */}
      <div className="p-4 bg-[#313338] shrink-0 border-t border-zinc-800/10 select-none">
        {/* Quick replies for DM chat */}
        {activeChannel === 'dm-owner' && (
          <div className="flex flex-wrap gap-2 mb-3">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(reply.payload)}
                className="bg-[#2b2d31] hover:bg-zinc-700 text-zinc-200 text-xs px-3 py-1.5 rounded-full border border-zinc-800 transition-colors text-left font-medium"
              >
                {reply.text}
              </button>
            ))}
          </div>
        )}

        {/* Input box */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (activeChannel === 'dm-owner') {
              handleSendMessage(inputText);
            }
          }}
          className="relative flex items-center bg-[#383a40] rounded-lg px-4 py-2.5"
        >
          <input 
            type="text"
            disabled={activeChannel !== 'dm-owner'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={activeChannel === 'dm-owner' ? `Nhắn tin cho @${ownerName}...` : `Bạn không thể trò chuyện tại kênh đọc này.`}
            className="w-full bg-transparent outline-none border-none text-sm text-white placeholder-zinc-500 disabled:cursor-not-allowed"
          />
          {activeChannel === 'dm-owner' ? (
            <button 
              type="submit" 
              className="text-[#5865f2] hover:text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-zinc-500 text-xs">Read-Only</div>
          )}
        </form>
      </div>

    </div>
  );
}
