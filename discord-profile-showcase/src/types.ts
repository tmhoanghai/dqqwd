export type DiscordStatus = 'online' | 'idle' | 'dnd' | 'offline' | 'streaming';

export interface DiscordUser {
  id: string;
  username: string;
  global_name: string;
  avatar: string | null;
  discriminator: string;
  public_flags?: number;
  banner?: string | null;
  accent_color?: number | null;
}

export interface SpotifyPresence {
  track_id: string;
  song: string;
  artist: string;
  album: string;
  album_art_url: string;
  timestamps: {
    start: number;
    end: number;
  };
}

export interface DiscordActivity {
  id: string;
  name: string;
  type: number; // 0: Game, 1: Streaming, 2: Listening, 3: Watching, 4: Custom, 5: Competing
  state?: string;
  details?: string;
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  emoji?: {
    name: string;
    id?: string;
    animated?: boolean;
  };
}

export interface LanyardData {
  discord_user: DiscordUser;
  discord_status: DiscordStatus;
  listening_to_spotify: boolean;
  spotify: SpotifyPresence | null;
  activities: DiscordActivity[];
  active_on_discord_desktop: boolean;
  active_on_discord_mobile: boolean;
  active_on_discord_web: boolean;
}

export interface PortfolioData {
  bio: string;
  skills: string[];
  projects: {
    title: string;
    description: string;
    techStack: string[];
    githubUrl?: string;
    demoUrl?: string;
    imageUrl?: string;
  }[];
  customBadges: string[]; // e.g. ["Developer", "Designer", "Gamer"]
  socials: {
    platform: string; // 'GitHub' | 'Facebook' | 'YouTube' | 'TikTok' | 'Email' etc
    url: string;
    username: string;
  }[];
  customStatusText?: string;
}
