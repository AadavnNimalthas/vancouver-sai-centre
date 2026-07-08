// @ts-nocheck
import React, { useRef, useState, useEffect } from 'react';
import { useAppStore } from '../services/store';
import { Role } from '../types';
import { 
  LayoutDashboard, Library, Wand2, Search, Monitor, ListMusic, Sun, Moon, Play, Pause, XCircle
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, actions } = useAppStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (state.practiceBhajan && audioRef.current) {
      audioRef.current.src = state.practiceBhajan.audioUrl || '';
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [state.practiceBhajan]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: any, icon: any, label: string }) => (
    <button
      onClick={() => actions.navigate(view)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 whitespace-nowrap
        ${state.view === view 
          ? 'bg-indigo-900 text-white shadow-md dark:bg-saffron-500' 
          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-300'}`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-bold text-sm">{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen p-4 lg:p-8 transition-colors duration-500 ${state.theme === 'dark' ? 'dark bg-indigo-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Horizontal Navigation */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 border-b border-gray-200 dark:border-white/10 scrollbar-hide">
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Home" />
          <NavItem view="SEARCH" icon={Search} label="Search" />
          <NavItem view="LIBRARY" icon={Library} label="Vault" />
          <NavItem view="PLAYLISTS" icon={ListMusic} label="Playlists" />
          <NavItem view="PRESENTATION" icon={Monitor} label="Presentation" />
          {state.currentUser?.role === Role.ADMIN && <NavItem view="LINEUP" icon={Wand2} label="Curator" />}
          
          <div className="ml-auto">
            <button 
              onClick={actions.toggleTheme}
              className="p-2 rounded-xl bg-white dark:bg-white/5 text-gray-400 hover:text-indigo-900 dark:hover:text-saffron-400 transition-all border border-gray-100 dark:border-white/5"
            >
              {state.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Global Audio Player if active */}
        {state.practiceBhajan && (
          <div className="bg-indigo-950 dark:bg-black text-white p-4 rounded-3xl mb-6 shadow-xl flex items-center gap-4">
            <button onClick={togglePlay} className="p-3 bg-saffron-500 rounded-full hover:scale-105 transition-transform">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <div className="flex-1">
              <p className="text-sm font-bold truncate">{state.practiceBhajan.title}</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-saffron-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button onClick={() => actions.setPracticeBhajan(null)} className="p-2 text-white/40 hover:text-white transition-colors">
              <XCircle className="w-5 h-5" />
            </button>
            <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={() => setIsPlaying(false)} className="hidden" />
          </div>
        )}

        <div className="flex-1 min-h-[60vh]">
          {children}
        </div>
      </div>
    </div>
  );
};
