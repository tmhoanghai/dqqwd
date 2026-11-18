import React, { useState } from 'react';
import { PortfolioData } from '../types';
import { Plus, Trash2, Shield, Code, Briefcase, User, HelpCircle, Save, Settings, Sparkles } from 'lucide-react';

interface PortfolioEditorProps {
  portfolio: PortfolioData;
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioData>>;
  discordUserId: string;
  setDiscordUserId: (id: string) => void;
  isLanyardEnabled: boolean;
  setIsLanyardEnabled: (enabled: boolean) => void;
}

export function PortfolioEditor({
  portfolio,
  setPortfolio,
  discordUserId,
  setDiscordUserId,
  isLanyardEnabled,
  setIsLanyardEnabled,
}: PortfolioEditorProps) {
  const [activeTab, setActiveTab] = useState<'discord' | 'profile' | 'skills' | 'projects' | 'socials'>('discord');
  const [newSkill, setNewSkill] = useState<string>('');
  
  // Custom states for new projects
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    techStack: '',
    githubUrl: '',
    demoUrl: ''
  });

  // Custom states for social platforms
  const [newSocial, setNewSocial] = useState({
    platform: 'GitHub',
    url: '',
    username: ''
  });

  const handlePortfolioChange = (key: keyof PortfolioData, value: any) => {
    setPortfolio(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (portfolio.skills.includes(newSkill.trim())) return;
    handlePortfolioChange('skills', [...portfolio.skills, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    handlePortfolioChange('skills', portfolio.skills.filter(s => s !== skillToRemove));
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim() || !newProject.description.trim()) return;
    
    const projectToAdd = {
      title: newProject.title.trim(),
      description: newProject.description.trim(),
      techStack: newProject.techStack.split(',').map(s => s.trim()).filter(Boolean),
      githubUrl: newProject.githubUrl.trim() || undefined,
      demoUrl: newProject.demoUrl.trim() || undefined
    };

    handlePortfolioChange('projects', [...portfolio.projects, projectToAdd]);
    setNewProject({ title: '', description: '', techStack: '', githubUrl: '', demoUrl: '' });
  };

  const handleRemoveProject = (index: number) => {
    handlePortfolioChange('projects', portfolio.projects.filter((_, idx) => idx !== index));
  };

  const handleAddSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocial.url.trim() || !newSocial.username.trim()) return;

    handlePortfolioChange('socials', [...portfolio.socials, {
      platform: newSocial.platform,
      url: newSocial.url.trim(),
      username: newSocial.username.trim()
    }]);

    setNewSocial({ platform: 'GitHub', url: '', username: '' });
  };

  const handleRemoveSocial = (index: number) => {
    handlePortfolioChange('socials', portfolio.socials.filter((_, idx) => idx !== index));
  };

  const toggleBadge = (badge: string) => {
    if (portfolio.customBadges.includes(badge)) {
      handlePortfolioChange('customBadges', portfolio.customBadges.filter(b => b !== badge));
    } else {
      handlePortfolioChange('customBadges', [...portfolio.customBadges, badge]);
    }
  };

  const availableBadges = [
    "HypeSquad Bravery",
    "HypeSquad Brilliance",
    "HypeSquad Balance",
    "Active Developer",
    "Nitro Subscriber",
    "Early Supporter",
    "Certified Moderator"
  ];

  return (
    <div className="w-full bg-[#2b2d31] rounded-xl border border-zinc-800 text-[#dbdee1] flex flex-col font-sans overflow-hidden">
      {/* Editor Header */}
      <div className="p-4 bg-[#232428] border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#5865f2]" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Tùy chỉnh trang cá nhân</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-[#5865f2]/10 text-[#5865f2] px-2.5 py-1 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Bản Nháp Local
        </div>
      </div>

      {/* Editor Tabs */}
      <div className="flex overflow-x-auto border-b border-zinc-800/60 bg-[#232428]/50 scrollbar-none">
        <button 
          onClick={() => setActiveTab('discord')}
          className={`flex-1 min-w-28 py-3 text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors ${activeTab === 'discord' ? 'border-[#5865f2] text-white bg-zinc-800/30' : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/10'}`}
        >
          <Shield className="w-3.5 h-3.5" />
          Trạng thái Discord
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 min-w-28 py-3 text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors ${activeTab === 'profile' ? 'border-[#5865f2] text-white bg-zinc-800/30' : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/10'}`}
        >
          <User className="w-3.5 h-3.5" />
          Giới thiệu
        </button>
        <button 
          onClick={() => setActiveTab('skills')}
          className={`flex-1 min-w-28 py-3 text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors ${activeTab === 'skills' ? 'border-[#5865f2] text-white bg-zinc-800/30' : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/10'}`}
        >
          <Code className="w-3.5 h-3.5" />
          Kỹ năng
        </button>
        <button 
          onClick={() => setActiveTab('projects')}
          className={`flex-1 min-w-28 py-3 text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors ${activeTab === 'projects' ? 'border-[#5865f2] text-white bg-zinc-800/30' : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/10'}`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Dự án
        </button>
        <button 
          onClick={() => setActiveTab('socials')}
          className={`flex-1 min-w-28 py-3 text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors ${activeTab === 'socials' ? 'border-[#5865f2] text-white bg-zinc-800/30' : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/10'}`}
        >
          <Plus className="w-3.5 h-3.5" />
          Mạng xã hội
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[460px] scrollbar-thin">
        {/* Tab: Discord Widget Status */}
        {activeTab === 'discord' && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#111214] p-3 rounded-lg border border-zinc-800 flex flex-col gap-2.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider">Phương thức kết nối</label>
              <div className="flex items-center gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                  <input 
                    type="radio" 
                    checked={!isLanyardEnabled} 
                    onChange={() => setIsLanyardEnabled(false)}
                    className="accent-[#5865f2] w-4 h-4"
                  />
                  Chế độ Mô Phỏng (Offline / Demo)
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                  <input 
                    type="radio" 
                    checked={isLanyardEnabled} 
                    onChange={() => setIsLanyardEnabled(true)}
                    className="accent-[#5865f2] w-4 h-4"
                  />
                  Live API (Lanyard)
                </label>
              </div>
            </div>

            {isLanyardEnabled ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Discord User ID của bạn</label>
                  <input 
                    type="text" 
                    value={discordUserId}
                    onChange={(e) => setDiscordUserId(e.target.value)}
                    placeholder="Nhập Discord ID của bạn (ví dụ: 5313938392100229)"
                    className="w-full bg-[#111214] border border-zinc-800 focus:border-[#5865f2] outline-none rounded-md px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="bg-[#232428]/40 border border-[#5865f2]/20 rounded-lg p-3 text-xs leading-relaxed flex flex-col gap-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#5865f2]" />
                    Làm thế nào để lấy Discord User ID và kích hoạt Lanyard?
                  </span>
                  <ol className="list-decimal pl-4 flex flex-col gap-1 text-zinc-300">
                    <li>Vào cài đặt Discord &gt; <b>Nâng cao (Advanced)</b> &gt; Kích hoạt <b>Chế độ nhà phát triển (Developer Mode)</b>.</li>
                    <li>Click chuột phải vào avatar của bạn &gt; chọn <b>Sao chép User ID</b> và dán vào ô bên trên.</li>
                    <li>Để widget hoạt động, bạn <b>bắt buộc</b> phải tham gia server Lanyard Discord tại <a href="https://discord.gg/lanyard" target="_blank" rel="noopener noreferrer" className="text-[#5865f2] hover:underline">discord.gg/lanyard</a> để hệ thống liên kết theo dõi trạng thái.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="bg-[#111214] p-3.5 rounded-lg border border-zinc-800 text-xs text-zinc-300">
                <span className="text-amber-400 font-bold block mb-1">Chế độ Demo Đang Hoạt Động</span>
                Trang web đang chạy trạng thái giả lập trực tuyến (Online, chơi Visual Studio Code, nghe nhạc Spotify). Bạn có thể chỉnh sửa các thông tin giới thiệu cá nhân ở các tab khác để hoàn thiện website portfolio của mình!
              </div>
            )}
          </div>
        )}

        {/* Tab: About Me / Profile */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Tiểu sử (Bio)</label>
              <textarea 
                rows={4}
                value={portfolio.bio}
                onChange={(e) => handlePortfolioChange('bio', e.target.value)}
                placeholder="Nhập nội dung tự giới thiệu về bản thân..."
                className="w-full bg-[#111214] border border-zinc-800 focus:border-[#5865f2] outline-none rounded-md px-3 py-2 text-xs text-white resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Dòng trạng thái tuỳ chỉnh (Custom Status)</label>
              <input 
                type="text" 
                value={portfolio.customStatusText || ''}
                onChange={(e) => handlePortfolioChange('customStatusText', e.target.value)}
                placeholder="Ví dụ: Đang học React... 💻🚀"
                className="w-full bg-[#111214] border border-zinc-800 focus:border-[#5865f2] outline-none rounded-md px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Huy hiệu trang cá nhân (Badges)</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {availableBadges.map((badge, idx) => {
                  const isActive = portfolio.customBadges.includes(badge);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleBadge(badge)}
                      className={`text-left p-2 rounded-lg text-xs font-medium transition-all border ${isActive ? 'bg-[#5865f2]/10 border-[#5865f2] text-white' : 'bg-[#111214] border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                    >
                      {badge}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Skills */}
        {activeTab === 'skills' && (
          <div className="flex flex-col gap-4">
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input 
                type="text" 
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Nhập kỹ năng mới (ví dụ: Python, Docker)"
                className="flex-1 bg-[#111214] border border-zinc-800 focus:border-[#5865f2] outline-none rounded-md px-3 py-2 text-xs text-white"
              />
              <button 
                type="submit"
                className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs px-4 rounded-md font-bold transition-colors"
              >
                Thêm
              </button>
            </form>

            <div className="flex flex-wrap gap-2 mt-2">
              {portfolio.skills.length === 0 ? (
                <span className="text-xs text-zinc-500">Chưa có kỹ năng nào được thêm.</span>
              ) : (
                portfolio.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="flex items-center gap-1.5 bg-[#232428] px-2.5 py-1 rounded-md text-xs border border-zinc-800 text-zinc-200"
                  >
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-zinc-500 hover:text-rose-400 focus:outline-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Projects */}
        {activeTab === 'projects' && (
          <div className="flex flex-col gap-4">
            {/* Form to add a new project */}
            <form onSubmit={handleAddProject} className="bg-[#111214] p-3 rounded-lg border border-zinc-800 flex flex-col gap-2.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Thêm dự án mới</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="Tên dự án *" 
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject(p => ({ ...p, title: e.target.value }))}
                  className="bg-[#232428] border border-zinc-800 focus:border-[#5865f2] outline-none rounded-md px-3 py-1.5 text-xs text-white"
                />
                <input 
                  type="text" 
                  placeholder="Công nghệ (ví dụ: React, Node)" 
                  value={newProject.techStack}
                  onChange={(e) => setNewProject(p => ({ ...p, techStack: e.target.value }))}
                  className="bg-[#232428] border border-zinc-800 focus:border-[#5865f2] outline-none rounded-md px-3 py-1.5 text-xs text-white"
                />
              </div>

              <textarea 
                placeholder="Mô tả dự án *" 
                required
                rows={2}
                value={newProject.description}
                onChange={(e) => setNewProject(p => ({ ...p, description: e.target.value }))}
                className="bg-[#232428] border border-zinc-800 focus:border-[#5865f2] outline-none rounded-md px-3 py-1.5 text-xs text-white resize-none"
              />

              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="url" 
                  placeholder="Link GitHub (tùy chọn)" 
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject(p => ({ ...p, githubUrl: e.target.value }))}
                  className="bg-[#232428] border border-zinc-800 focus:border-[#5865f2] outline-none rounded-md px-3 py-1.5 text-xs text-white"
                />
                <input 
                  type="url" 
                  placeholder="Link Demo (tùy chọn)" 
                  value={newProject.demoUrl}
                  onChange={(e) => setNewProject(p => ({ ...p, demoUrl: e.target.value }))}
                  className="bg-[#232428] border border-zinc-800 focus:border-[#5865f2] outline-none rounded-md px-3 py-1.5 text-xs text-white"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs py-1.5 rounded-md font-bold transition-colors mt-1"
              >
                Lưu dự án
              </button>
            </form>

            {/* List of existing projects */}
            <div className="flex flex-col gap-2 mt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Dự án hiện có</h4>
              {portfolio.projects.length === 0 ? (
                <span className="text-xs text-zinc-500">Chưa có dự án nào.</span>
              ) : (
                portfolio.projects.map((proj, idx) => (
                  <div key={idx} className="bg-[#111214]/50 border border-zinc-800 rounded-md p-2.5 flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-white">{proj.title}</span>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">{proj.description}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveProject(idx)}
                      className="text-zinc-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Social Links */}
        {activeTab === 'socials' && (
          <div className="flex flex-col gap-4">
            <form onSubmit={handleAddSocial} className="bg-[#111214] p-3 rounded-lg border border-zinc-800 flex flex-col gap-2.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Thêm liên kết mạng xã hội</h3>
              
              <div className="grid grid-cols-3 gap-2">
                <select 
                  value={newSocial.platform}
                  onChange={(e) => setNewSocial(s => ({ ...s, platform: e.target.value }))}
                  className="bg-[#232428] border border-zinc-800 focus:border-[#5865f2] outline-none rounded-md px-2 py-1.5 text-xs text-white"
                >
                  <option value="GitHub">GitHub</option>
                  <option value="Facebook">Facebook</option>
                  <option value="YouTube">YouTube</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Email">Email</option>
                  <option value="Instagram">Instagram</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>

                <input 
                  type="text" 
                  placeholder="Tên tài khoản *" 
                  required
                  value={newSocial.username}
                  onChange={(e) => setNewSocial(s => ({ ...s, username: e.target.value }))}
                  className="bg-[#232428] border border-zinc-800 focus:border-[#5865f2] outline-none rounded-md px-3 py-1.5 text-xs text-white"
                />

                <input 
                  type="text" 
                  placeholder="URL liên kết *" 
                  required
                  value={newSocial.url}
                  onChange={(e) => setNewSocial(s => ({ ...s, url: e.target.value }))}
                  className="bg-[#232428] border border-zinc-800 focus:border-[#5865f2] outline-none rounded-md px-3 py-1.5 text-xs text-white"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs py-1.5 rounded-md font-bold transition-colors mt-1"
              >
                Thêm liên kết
              </button>
            </form>

            <div className="flex flex-col gap-2 mt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Danh sách mạng xã hội</h4>
              {portfolio.socials.length === 0 ? (
                <span className="text-xs text-zinc-500">Chưa có liên kết nào.</span>
              ) : (
                portfolio.socials.map((social, idx) => (
                  <div key={idx} className="bg-[#111214]/50 border border-zinc-800 rounded-md p-2.5 flex justify-between items-center gap-4">
                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400">
                        {social.platform}
                      </span>
                      <span className="text-xs text-white">{social.username}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSocial(idx)}
                      className="text-zinc-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
