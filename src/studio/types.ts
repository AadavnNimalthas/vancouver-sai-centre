// @ts-nocheck

export enum Role {
  ADMIN = 'ADMIN',
  SINGER = 'SINGER'
}

export enum Deity {
  GANESHA = 'Ganesha',
  GURU = 'Guru',
  DEVI = 'Devi',
  SHIVA = 'Shiva',
  KRISHNA = 'Krishna',
  RAMA = 'Rama',
  SAI = 'Sai',
  SARVA_DHARMA = 'Sarva Dharma'
}

export enum SkillLevel {
  BEGINNER = 1,
  INTERMEDIATE = 2,
  ADVANCED = 3,
  PROFESSIONAL = 4
}

export const MUSICAL_SCALES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

export interface User {
  userId: string;
  name: string;
  role: Role;
  skillRating: SkillLevel;
  preferredDeity: Deity;
  centerId: string | null;
  isHarmoniumPlayer: boolean;
  vibrationLevel: number; // Experience points
  lastPracticeDate?: number;
}

export interface Center {
  centerId: string;
  name: string;
  joinCode: string;
  adminIds: string[];
}

export interface Bhajan {
  bhajanId: string;
  title: string;
  lyrics: string[];
  meaning?: string;
  deity: Deity;
  scale: string;
  raga: string;
  tempo: 'Slow' | 'Medium' | 'Fast';
  difficulty: SkillLevel;
  audioUrl?: string;
  isDownloaded?: boolean;
  harmoniumNotes?: string; // Pakad or notes for harmonium players
  language?: string;
}

export interface MusicianAssignment {
  userId: string;
  name: string;
  instrument: 'Harmonium' | 'Tabla' | 'Manjira' | 'Kanjeera' | 'Other';
}

export interface LineupItem {
  id: string;
  slotNumber: number;
  singerId: string;
  singerName: string;
  bhajan: Bhajan;
  scale: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
}

// Added missing Message interface used in the messaging component
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
}

export interface SingerBhajanScale {
  singerId: string;
  bhajanId: string;
  scale: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  bhajanIds: string[];
  createdAt: number;
}

export interface AppState {
  currentUser: User | null;
  currentCenter: Center | null;
  bhajanLibrary: Bhajan[];
  currentLineup: LineupItem[];
  playlists: Playlist[];
  view: 'AUTH' | 'ONBOARDING' | 'DASHBOARD' | 'LIBRARY' | 'LINEUP' | 'MESSAGES' | 'ZEN_SESSION' | 'PRESENTATION' | 'SEARCH' | 'PROFILE' | 'PLAYLISTS';
  isLoading: boolean;
  isOfflineMode: boolean;
  theme: 'light' | 'dark';
  // Added properties used by various components to avoid runtime errors
  usersInCenter: User[];
  messages: Message[];
  practiceBhajan: Bhajan | null;
  singerScales: SingerBhajanScale[];
  musicians: MusicianAssignment[];
}
