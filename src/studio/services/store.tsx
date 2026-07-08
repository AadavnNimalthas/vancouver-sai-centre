// @ts-nocheck

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppState, User, Center, Bhajan, Role, LineupItem, Deity, SkillLevel, Message, SingerBhajanScale, MusicianAssignment, Playlist } from '../types';
import { MOCK_BHAJANS, MOCK_USERS, MOCK_CENTER } from './mockData';
import { db } from './db';

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_VIEW'; payload: AppState['view'] }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_PLAYLISTS'; payload: Playlist[] }
  | { type: 'ADD_PLAYLIST'; payload: Playlist }
  | { type: 'UPDATE_PLAYLIST'; payload: Playlist }
  | { type: 'DELETE_PLAYLIST'; payload: string }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'SET_LINEUP'; payload: LineupItem[] }
  | { type: 'UPDATE_SLOT_STATUS'; payload: { id: string, status: LineupItem['status'] } }
  | { type: 'UPDATE_SINGER_SCALE'; payload: { singerId: string, bhajanId: string, scale: string } }
  | { type: 'SET_MUSICIANS'; payload: MusicianAssignment[] }
  | { type: 'HYDRATE'; payload: { library: Bhajan[], user: User | null, singerScales: SingerBhajanScale[], musicians: MusicianAssignment[] } }
  | { type: 'ADD_BHAJAN'; payload: Bhajan }
  | { type: 'UPDATE_BHAJAN_SCALE'; payload: { bhajanId: string, scale: string } }
  | { type: 'TOGGLE_DOWNLOAD'; payload: { bhajanId: string, isDownloaded: boolean } }
  | { type: 'COMPLETE_SESSION'; payload: number }
  | { type: 'OFFLINE_STATUS'; payload: boolean }
  | { type: 'SET_PRACTICE_BHAJAN'; payload: Bhajan | null };

const initialState: AppState = {
  currentUser: null,
  currentCenter: null,
  bhajanLibrary: [],
  currentLineup: [],
  playlists: [],
  view: 'AUTH',
  theme: 'light',
  isLoading: true,
  isOfflineMode: !navigator.onLine,
  usersInCenter: MOCK_USERS,
  messages: [],
  practiceBhajan: null,
  singerScales: [],
  musicians: []
};

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, isLoading: action.payload };
    case 'LOGIN': return { ...state, currentUser: action.payload, view: 'DASHBOARD' };
    case 'LOGOUT': return { ...initialState, isLoading: false };
    case 'SET_VIEW': return { ...state, view: action.payload };
    case 'SET_THEME': return { ...state, theme: action.payload };
    case 'SET_PLAYLISTS': return { ...state, playlists: action.payload };
    case 'ADD_PLAYLIST': return { ...state, playlists: [...state.playlists, action.payload] };
    case 'UPDATE_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.map(p => p.id === action.payload.id ? action.payload : p)
      };
    case 'DELETE_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.filter(p => p.id !== action.payload)
      };
    case 'SET_MESSAGES': return { ...state, messages: action.payload };
    case 'SET_MUSICIANS': return { ...state, musicians: action.payload };
    case 'SET_LINEUP': return { ...state, currentLineup: action.payload };
    case 'UPDATE_SLOT_STATUS':
      return {
        ...state,
        currentLineup: state.currentLineup.map(item => 
          item.id === action.payload.id ? { ...item, status: action.payload.status } : item
        )
      };
    case 'UPDATE_SINGER_SCALE':
      const existingScaleIndex = state.singerScales.findIndex(
        s => s.singerId === action.payload.singerId && s.bhajanId === action.payload.bhajanId
      );
      let newSingerScales = [...state.singerScales];
      if (existingScaleIndex >= 0) {
        newSingerScales[existingScaleIndex] = { ...action.payload };
      } else {
        newSingerScales.push(action.payload);
      }
      localStorage.setItem('isai_singer_scales', JSON.stringify(newSingerScales));
      return { 
        ...state, 
        singerScales: newSingerScales,
        currentLineup: state.currentLineup.map(item => 
          (item.singerId === action.payload.singerId && item.bhajan.bhajanId === action.payload.bhajanId)
            ? { ...item, scale: action.payload.scale }
            : item
        )
      };
    case 'HYDRATE': return { 
      ...state, 
      bhajanLibrary: action.payload.library, 
      currentUser: action.payload.user || state.currentUser, 
      singerScales: action.payload.singerScales,
      musicians: action.payload.musicians,
      isLoading: false 
    };
    case 'ADD_BHAJAN': return { ...state, bhajanLibrary: [...state.bhajanLibrary, action.payload] };
    case 'UPDATE_BHAJAN_SCALE':
      return {
        ...state,
        bhajanLibrary: state.bhajanLibrary.map(b => 
          b.bhajanId === action.payload.bhajanId ? { ...b, scale: action.payload.scale } : b
        )
      };
    case 'TOGGLE_DOWNLOAD':
      return {
        ...state,
        bhajanLibrary: state.bhajanLibrary.map(b => 
          b.bhajanId === action.payload.bhajanId ? { ...b, isDownloaded: action.payload.isDownloaded } : b
        )
      };
    case 'COMPLETE_SESSION': 
      if (!state.currentUser) return state;
      const updatedUser = { ...state.currentUser, vibrationLevel: state.currentUser.vibrationLevel + action.payload };
      localStorage.setItem('isai_user', JSON.stringify(updatedUser));
      return { ...state, currentUser: updatedUser };
    case 'OFFLINE_STATUS': return { ...state, isOfflineMode: action.payload };
    case 'SET_PRACTICE_BHAJAN': return { ...state, practiceBhajan: action.payload };
    default: return state;
  }
};

const AppContext = createContext<any>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const init = async () => {
      await db.init();
      const storedBhajans = await db.getAllBhajans();
      const userRaw = localStorage.getItem('isai_user');
      
      // Fetch data from server
      try {
        const [serverBhajans, serverScales, serverLineup, serverMusicians] = await Promise.all([
          fetch('/api/bhajans').then(r => r.json()),
          fetch('/api/singer-scales').then(r => r.json()),
          fetch('/api/lineup').then(r => r.json()),
          fetch('/api/musicians').then(r => r.json())
        ]);

        const initialLib = [...MOCK_BHAJANS, ...serverBhajans].reduce((acc: Bhajan[], curr: Bhajan) => {
          if (!acc.find(b => b.bhajanId === curr.bhajanId)) {
            const stored = storedBhajans.find(sb => sb.bhajanId === curr.bhajanId);
            acc.push(stored ? { ...curr, isDownloaded: true, scale: stored.scale || curr.scale } : curr);
          }
          return acc;
        }, []);

        dispatch({ 
          type: 'HYDRATE', 
          payload: { 
            library: initialLib, 
            user: userRaw ? JSON.parse(userRaw) : null,
            singerScales: serverScales,
            musicians: serverMusicians
          } 
        });
        dispatch({ type: 'SET_LINEUP', payload: serverLineup });
      } catch (e) {
        console.error("Failed to fetch from server, falling back to local", e);
        // Fallback logic if server is down
        const initialLib = MOCK_BHAJANS.map(mb => {
          const stored = storedBhajans.find(sb => sb.bhajanId === mb.bhajanId);
          return stored ? { ...mb, isDownloaded: true, scale: stored.scale || mb.scale } : mb;
        });
        dispatch({ 
          type: 'HYDRATE', 
          payload: { 
            library: initialLib, 
            user: userRaw ? JSON.parse(userRaw) : null,
            singerScales: [],
          } 
        });
      }
    };
    init();

    const checkOnline = () => dispatch({ type: 'OFFLINE_STATUS', payload: !navigator.onLine });
    window.addEventListener('online', checkOnline);
    window.addEventListener('offline', checkOnline);
    return () => { window.removeEventListener('online', checkOnline); window.removeEventListener('offline', checkOnline); };
  }, []);

  const actions = {
    login: async (id: string) => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: id })
        });
        if (response.ok) {
          const user = await response.json();
          localStorage.setItem('isai_user', JSON.stringify(user));
          dispatch({ type: 'LOGIN', payload: user });
        } else {
          // Fallback to mock if not in server yet
          const user = MOCK_USERS.find(u => u.userId === id);
          if (user) {
            localStorage.setItem('isai_user', JSON.stringify(user));
            dispatch({ type: 'LOGIN', payload: user });
          }
        }
      } catch (e) {
        const user = MOCK_USERS.find(u => u.userId === id);
        if (user) {
          localStorage.setItem('isai_user', JSON.stringify(user));
          dispatch({ type: 'LOGIN', payload: user });
        }
      }
    },
    logout: () => { localStorage.removeItem('isai_user'); dispatch({ type: 'LOGOUT' }); },
    register: async (userData: Partial<User>) => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const newUser = await response.json();
        localStorage.setItem('isai_user', JSON.stringify(newUser));
        dispatch({ type: 'LOGIN', payload: newUser });
        dispatch({ type: 'SET_VIEW', payload: 'ONBOARDING' });
      } catch (e) {
        alert("Failed to register on server.");
      }
    },
    joinCenter: async (code: string) => {
      if (code === MOCK_CENTER.joinCode) {
        const updatedUser = { ...state.currentUser!, centerId: MOCK_CENTER.centerId };
        // Update user on server too? For now just local
        localStorage.setItem('isai_user', JSON.stringify(updatedUser));
        dispatch({ type: 'LOGIN', payload: updatedUser });
      } else {
        alert("Invalid join code.");
      }
    },
    navigate: (v: any) => dispatch({ type: 'SET_VIEW', payload: v }),
    assignMusician: async (userId: string, name: string, instrument: any) => {
      const newMusicians = [...state.musicians.filter(m => m.instrument !== instrument), { userId, name, instrument }];
      try {
        await fetch('/api/musicians', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMusicians)
        });
      } catch (e) {
        console.error("Failed to sync musicians to server", e);
      }
      dispatch({ type: 'SET_MUSICIANS', payload: newMusicians });
    },
    removeMusician: async (instrument: string) => {
      const newMusicians = state.musicians.filter(m => m.instrument !== instrument);
      try {
        await fetch('/api/musicians', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMusicians)
        });
      } catch (e) {
        console.error("Failed to sync musicians to server", e);
      }
      dispatch({ type: 'SET_MUSICIANS', payload: newMusicians });
    },
    sendMessage: (receiverId: string, content: string) => {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: state.currentUser?.userId || 'unknown',
        receiverId,
        content,
        timestamp: Date.now()
      };
      dispatch({ type: 'SET_MESSAGES', payload: [...state.messages, newMessage] });
    },
    addBhajan: async (b: Bhajan, audioFile?: File) => {
      try {
        const formData = new FormData();
        formData.append('data', JSON.stringify(b));
        if (audioFile) {
          formData.append('audio', audioFile);
        }
        
        const response = await fetch('/api/bhajans', {
          method: 'POST',
          body: formData
        });
        const newBhajan = await response.json();
        
        await db.saveBhajan(newBhajan);
        dispatch({ type: 'ADD_BHAJAN', payload: newBhajan });
      } catch (e) {
        console.error("Failed to add bhajan to server", e);
        // Local only fallback
        await db.saveBhajan(b);
        dispatch({ type: 'ADD_BHAJAN', payload: b });
      }
    },
    updateBhajanScale: async (bhajanId: string, scale: string) => {
      const bhajan = state.bhajanLibrary.find(b => b.bhajanId === bhajanId);
      if (bhajan) {
        await db.saveBhajan({ ...bhajan, scale });
        dispatch({ type: 'UPDATE_BHAJAN_SCALE', payload: { bhajanId, scale } });
      }
    },
    updateSingerScale: async (singerId: string, bhajanId: string, scale: string) => {
      try {
        await fetch('/api/singer-scales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ singerId, bhajanId, scale })
        });
      } catch (e) {
        console.error("Failed to sync scale to server", e);
      }
      dispatch({ type: 'UPDATE_SINGER_SCALE', payload: { singerId, bhajanId, scale } });
    },
    updateSlotStatus: async (id: string, status: LineupItem['status']) => {
      try {
        await fetch(`/api/lineup/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
      } catch (e) {
        console.error("Failed to update status on server", e);
      }
      dispatch({ type: 'UPDATE_SLOT_STATUS', payload: { id, status } });
    },
    generateLineup: async (singerIds: string[]) => {
      const selectedSingers = state.usersInCenter.filter(u => singerIds.includes(u.userId));
      const library = [...state.bhajanLibrary];
      const lineup: LineupItem[] = [];
      
      const shuffledSingers = [...selectedSingers].sort(() => Math.random() - 0.5);
      let lastDeity: Deity | null = null;
      
      shuffledSingers.forEach((singer, index) => {
        const progress = index / shuffledSingers.length;
        let targetTempo: 'Slow' | 'Medium' | 'Fast' = 'Medium';
        if (progress < 0.2) targetTempo = 'Slow';
        else if (progress > 0.8) targetTempo = 'Fast';

        // Filter by tempo and deity
        let possibleBhajans = library.filter(b => b.deity === singer.preferredDeity && b.tempo === targetTempo);
        
        if (possibleBhajans.length === 0) {
          possibleBhajans = library.filter(b => b.deity === singer.preferredDeity);
        }
        
        if (possibleBhajans.length === 0) {
          possibleBhajans = library.filter(b => b.deity !== lastDeity && b.tempo === targetTempo);
        }

        if (possibleBhajans.length === 0) {
          possibleBhajans = library.filter(b => b.deity !== lastDeity);
        }

        if (possibleBhajans.length === 0) {
          possibleBhajans = library;
        }
        
        const bhajan = possibleBhajans[Math.floor(Math.random() * possibleBhajans.length)];
        lastDeity = bhajan.deity;
        
        const storedScale = state.singerScales.find(s => s.singerId === singer.userId && s.bhajanId === bhajan.bhajanId);
        
        lineup.push({
          id: `slot-${Date.now()}-${index}`,
          slotNumber: index + 1,
          singerId: singer.userId,
          singerName: singer.name,
          bhajan: bhajan,
          scale: storedScale ? storedScale.scale : bhajan.scale,
          status: 'PENDING'
        });
      });
      
      if (lineup.length > 0) {
        lineup[0].status = 'ACTIVE';
      }
      
      try {
        await fetch('/api/lineup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lineup)
        });
      } catch (e) {
        console.error("Failed to save lineup to server", e);
      }
      
      dispatch({ type: 'SET_LINEUP', payload: lineup });
      dispatch({ type: 'SET_VIEW', payload: 'DASHBOARD' });
    },
    toggleDownload: async (bhajan: Bhajan) => {
      if (bhajan.isDownloaded) {
        await db.removeBhajan(bhajan.bhajanId);
        if (bhajan.audioUrl) await db.deleteMedia(bhajan.audioUrl);
        dispatch({ type: 'TOGGLE_DOWNLOAD', payload: { bhajanId: bhajan.bhajanId, isDownloaded: false } });
      } else {
        if (!navigator.onLine) {
          alert("Connection required for vault syncing.");
          return;
        }
        let mediaSuccess = true;
        if (bhajan.audioUrl) {
          mediaSuccess = await db.downloadMedia(bhajan.audioUrl);
        }
        if (mediaSuccess) {
          await db.saveBhajan({ ...bhajan, isDownloaded: true });
          dispatch({ type: 'TOGGLE_DOWNLOAD', payload: { bhajanId: bhajan.bhajanId, isDownloaded: true } });
        }
      }
    },
    setPracticeBhajan: async (bhajan: Bhajan | null) => {
      if (bhajan && bhajan.isDownloaded && bhajan.audioUrl) {
        const cachedUrl = await db.getCachedUrl(bhajan.audioUrl);
        dispatch({ type: 'SET_PRACTICE_BHAJAN', payload: { ...bhajan, audioUrl: cachedUrl } });
      } else {
        dispatch({ type: 'SET_PRACTICE_BHAJAN', payload: bhajan });
      }
    },
    createPlaylist: async (name: string, description?: string) => {
      const newPlaylist: Playlist = {
        id: `pl-${Date.now()}`,
        name,
        description,
        bhajanIds: [],
        createdAt: Date.now()
      };
      dispatch({ type: 'ADD_PLAYLIST', payload: newPlaylist });
      // In a real app, we'd sync to server here
    },
    addToPlaylist: (playlistId: string, bhajanId: string) => {
      const playlist = state.playlists.find(p => p.id === playlistId);
      if (playlist && !playlist.bhajanIds.includes(bhajanId)) {
        const updated = { ...playlist, bhajanIds: [...playlist.bhajanIds, bhajanId] };
        dispatch({ type: 'UPDATE_PLAYLIST', payload: updated });
      }
    },
    removeFromPlaylist: (playlistId: string, bhajanId: string) => {
      const playlist = state.playlists.find(p => p.id === playlistId);
      if (playlist) {
        const updated = { ...playlist, bhajanIds: playlist.bhajanIds.filter(id => id !== bhajanId) };
        dispatch({ type: 'UPDATE_PLAYLIST', payload: updated });
      }
    },
    deletePlaylist: (id: string) => dispatch({ type: 'DELETE_PLAYLIST', payload: id }),
    toggleTheme: () => dispatch({ type: 'SET_THEME', payload: state.theme === 'light' ? 'dark' : 'light' }),
    completeSession: (points: number) => dispatch({ type: 'COMPLETE_SESSION', payload: points }),
    exportToAndroid: () => {
      // Formats data for Android Studio assets folder
      const exportData = {
        version: Date.now(),
        bhajans: state.bhajanLibrary,
        metadata: {
          generatedBy: "ISai Web Vault",
          targetPlatform: "Android (Studio)"
        }
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bhajans_android_bundle.json';
      a.click();
    },
    importData: async (file: File) => {
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        const importedBhajans = data.bhajans || data; // Handle both bundle and raw array
        if (Array.isArray(importedBhajans)) {
          for (const b of importedBhajans) {
            await db.saveBhajan(b);
          }
          alert(`Successfully imported ${importedBhajans.length} bhajans into local storage.`);
          window.location.reload(); // Refresh to hydrate new library
        }
      } catch (e) {
        alert("Invalid data file format.");
      }
    }
  };

  return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>;
};

export const useAppStore = () => useContext(AppContext);
