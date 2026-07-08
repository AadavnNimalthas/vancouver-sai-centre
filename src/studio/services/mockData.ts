// @ts-nocheck

import { Bhajan, Center, Deity, Role, SkillLevel, User } from '../types';

export const MOCK_CENTER: Center = {
  centerId: 'center-123',
  name: 'Prasanthi Nilayam Group',
  joinCode: 'OMSAI',
  adminIds: ['admin-1'],
  // Fix: Removed 'defaultInvokingBhajanName' as it is not defined in the Center interface
};

export const MOCK_USERS: User[] = [
  {
    userId: 'admin-1',
    name: 'Ravi Kumar',
    role: Role.ADMIN,
    skillRating: SkillLevel.PROFESSIONAL,
    preferredDeity: Deity.GANESHA,
    centerId: 'center-123',
    isHarmoniumPlayer: true,
    vibrationLevel: 1000, // Fix: Added required 'vibrationLevel'
  },
  {
    userId: 'singer-1',
    name: 'Anita Sharma',
    role: Role.SINGER,
    skillRating: SkillLevel.ADVANCED,
    preferredDeity: Deity.DEVI,
    centerId: 'center-123',
    isHarmoniumPlayer: false,
    vibrationLevel: 850, // Fix: Added required 'vibrationLevel'
  },
  {
    userId: 'singer-2',
    name: 'Vijay Singh',
    role: Role.SINGER,
    skillRating: SkillLevel.INTERMEDIATE,
    preferredDeity: Deity.SHIVA,
    centerId: 'center-123',
    isHarmoniumPlayer: false,
    vibrationLevel: 600, // Fix: Added required 'vibrationLevel'
  },
  {
    userId: 'singer-3',
    name: 'Priya Patel',
    role: Role.SINGER,
    skillRating: SkillLevel.BEGINNER,
    preferredDeity: Deity.KRISHNA,
    centerId: 'center-123',
    isHarmoniumPlayer: false,
    vibrationLevel: 300, // Fix: Added required 'vibrationLevel'
  },
  {
    userId: 'singer-4',
    name: 'Suresh Menon',
    role: Role.SINGER,
    skillRating: SkillLevel.ADVANCED,
    preferredDeity: Deity.RAMA,
    centerId: 'center-123',
    isHarmoniumPlayer: true,
    vibrationLevel: 900, // Fix: Added required 'vibrationLevel'
  }
];

export const MOCK_BHAJANS: Bhajan[] = [
  {
    bhajanId: 'b-1',
    title: 'Ganesha Sharanam',
    lyrics: ['Ganesha Sharanam Sharanam Ganesha', 'Ganesha Sharanam Sharanam Ganesha'],
    deity: Deity.GANESHA,
    scale: 'C#',
    raga: 'Shankarabharanam',
    tempo: 'Medium',
    difficulty: SkillLevel.BEGINNER,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    bhajanId: 'b-2',
    title: 'Jaya Ma Jaya Ma',
    lyrics: ['Jaya Ma Jaya Ma Jagadishwari Sai Ma', 'Jaya Ma Jaya Ma Jagadishwari Sai Ma'],
    deity: Deity.DEVI,
    scale: 'D',
    raga: 'Bhairavi',
    tempo: 'Fast',
    difficulty: SkillLevel.INTERMEDIATE,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    bhajanId: 'b-3',
    title: 'Shivaya Parameshwaraya',
    lyrics: ['Shivaya Parameshwaraya Chandrashekaraya Namah Om', 'Bhavaya Guna Sambhavaya Shiva Tandava Namah Om'],
    deity: Deity.SHIVA,
    scale: 'E',
    raga: 'Darbar',
    tempo: 'Slow',
    difficulty: SkillLevel.ADVANCED,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    bhajanId: 'b-4',
    title: 'Govinda Krishna Jai',
    lyrics: ['Govinda Krishna Jai Gopala Krishna Jai', 'Gopala Krishna Jai Govinda Krishna Jai'],
    deity: Deity.KRISHNA,
    scale: 'C',
    raga: 'Mohanam',
    tempo: 'Fast',
    difficulty: SkillLevel.BEGINNER,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    bhajanId: 'b-5',
    title: 'Rama Rama Rama Sita',
    lyrics: ['Rama Rama Rama Sita', 'Rama Rama Rama Sita'],
    deity: Deity.RAMA,
    scale: 'A#',
    raga: 'Kalyani',
    tempo: 'Medium',
    difficulty: SkillLevel.INTERMEDIATE,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
  {
    bhajanId: 'b-6',
    title: 'Love is My Form',
    lyrics: ['Love is My Form, Truth is My Breath', 'Bliss is My Food, My Life is Love'],
    deity: Deity.SAI,
    scale: 'F',
    raga: 'Western',
    tempo: 'Slow',
    difficulty: SkillLevel.BEGINNER,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  }
];
