import { PortfolioData, LanyardData } from '../types';

export const DEFAULT_PORTFOLIO: PortfolioData = {
  bio: "Xin chào! Mình là một nhà phát triển phần mềm trẻ tuổi, đam mê lập trình và thiết kế giao diện. Mình thường xuyên hoạt động trên Discord để kết nối, học hỏi và phát triển cộng đồng học thuật.",
  skills: [
    "TypeScript", "React / Next.js", "Tailwind CSS", "Node.js", "Express", 
    "Git & GitHub", "UI/UX Design", "Discord Bot Development"
  ],
  projects: [
    {
      title: "TheMaster AI",
      description: "AI assistant & intelligence platform.",
      techStack: ["Next.js", "AI", "Vercel"],
      demoUrl: "https://themasters-pi.vercel.app/",
      githubUrl: "https://themasters-pi.vercel.app/"
    },
    {
      title: "Coding tutorial website",
      description: "Interactive coding learning tutorials and guides.",
      techStack: ["React", "TypeScript", "CodeRunner"],
      demoUrl: "https://tmcoderthemaster.vercel.app/",
      githubUrl: "https://tmcoderthemaster.vercel.app/"
    },
    {
      title: "Virtual trading platform",
      description: "Real-time virtual stock & crypto trading simulation.",
      techStack: ["React", "TradingView", "Analytics"],
      demoUrl: "https://adnew-psi.vercel.app/",
      githubUrl: "https://adnew-psi.vercel.app/"
    },
    {
      title: "Domain Expansion simulator",
      description: "Interactive Jujutsu Kaisen domain expansion VFX simulator.",
      techStack: ["Three.js", "WebGL", "VFX", "Audio"],
      demoUrl: "https://domainexpansion-opal.vercel.app/",
      githubUrl: "https://domainexpansion-opal.vercel.app/"
    },
    {
      title: "TheMaster tier list",
      description: "Interactive drag-and-drop tier list maker and rankings.",
      techStack: ["React", "DndKit", "Tailwind CSS"],
      demoUrl: "https://tmtiers.vercel.app/",
      githubUrl: "https://tmtiers.vercel.app/"
    },
    {
      title: "Never Give Up player",
      description: "Modern web streaming music player with custom equalizer.",
      techStack: ["React", "Web Audio API", "Vercel"],
      demoUrl: "https://test1-gamma-navy-38.vercel.app/",
      githubUrl: "https://test1-gamma-navy-38.vercel.app/"
    },
    {
      title: "themasterplayer",
      description: "Interactive online music web player & streaming station.",
      techStack: ["React", "Audio Player", "Vercel"],
      demoUrl: "https://tm-music-player2.vercel.app/",
      githubUrl: "https://tm-music-player2.vercel.app/"
    },
    {
      title: "the fur1ous",
      description: "Fast-paced action & gaming showcase portfolio web app.",
      techStack: ["React", "Next.js", "Vercel"],
      demoUrl: "https://thefur1ous.vercel.app/",
      githubUrl: "https://thefur1ous.vercel.app/"
    },
    {
      title: "minecraft anticheat",
      description: "Advanced detection and security anticheat system for Minecraft servers.",
      techStack: ["Java", "Security", "Minecraft", "Vercel"],
      demoUrl: "https://themasterac.vercel.app/",
      githubUrl: "https://themasterac.vercel.app/"
    }
  ],
  customBadges: [
    "HypeSquad Bravery",
    "Active Developer",
    "Nitro Subscriber",
    "Early Supporter"
  ],
  socials: [
    {
      platform: "GitHub",
      url: "https://github.com",
      username: "github_username"
    },
    {
      platform: "Facebook",
      url: "https://facebook.com",
      username: "fb.profile"
    },
    {
      platform: "YouTube",
      url: "https://youtube.com",
      username: "@my_channel"
    },
    {
      platform: "Email",
      url: "mailto:contact@example.com",
      username: "contact@example.com"
    }
  ],
  customStatusText: ""
};

export const DEFAULT_LANYARD_MOCK = (status: 'online' | 'idle' | 'dnd' | 'offline' = 'online'): LanyardData => {
  return {
    discord_user: {
      id: "1275443009500221450",
      username: "tmkingreal_94065",
      global_name: "TheMaster",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
      discriminator: "0",
      public_flags: 0,
      banner: null,
      accent_color: 5793266
    },
    discord_status: status,
    listening_to_spotify: false,
    spotify: null,
    activities: [],
    active_on_discord_desktop: false,
    active_on_discord_mobile: false,
    active_on_discord_web: false
  };
};

