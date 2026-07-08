// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../services/store';
import { 
  ChevronLeft, ChevronRight, Maximize2, Minimize2, 
  Music, User, Info, X
} from 'lucide-react';
import { Deity } from '../types';

const DEITY_IMAGES: Record<string, string> = {
  [Deity.GANESHA]: 'https://picsum.photos/seed/ganesha/1920/1080',
  [Deity.GURU]: 'https://picsum.photos/seed/guru/1920/1080',
  [Deity.DEVI]: 'https://picsum.photos/seed/devi/1920/1080',
  [Deity.SHIVA]: 'https://picsum.photos/seed/shiva/1920/1080',
  [Deity.KRISHNA]: 'https://picsum.photos/seed/krishna/1920/1080',
  [Deity.RAMA]: 'https://picsum.photos/seed/rama/1920/1080',
  [Deity.SAI]: 'https://picsum.photos/seed/sai/1920/1080',
  [Deity.SARVA_DHARMA]: 'https://picsum.photos/seed/sarvadharma/1920/1080',
};

export const Presentation: React.FC = () => {
  const { state, actions } = useAppStore();
  const { currentLineup, musicians } = state;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const activeSlotIndex = currentLineup.findIndex(item => item.status === 'ACTIVE');
    if (activeSlotIndex !== -1) {
      setActiveIndex(activeSlotIndex);
    }
  }, [currentLineup]);

  const currentSlot = currentLineup[activeIndex];
  const nextSlot = currentLineup[activeIndex + 1];

  if (!currentSlot) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-indigo-950 text-white p-10 text-center">
        <Music className="w-20 h-20 text-white/20 mb-8" />
        <h2 className="text-4xl font-black mb-4">No Active Session</h2>
        <p className="text-indigo-300 mb-10">Generate a lineup to start the presentation.</p>
        <button 
          onClick={() => actions.navigate('DASHBOARD')}
          className="px-10 py-4 bg-white text-indigo-950 rounded-2xl font-black shadow-xl"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-[200] bg-black flex flex-col transition-all duration-700 ${isFullscreen ? 'p-0' : 'p-0'}`}>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={DEITY_IMAGES[currentSlot.bhajan.deity] || DEITY_IMAGES[Deity.SAI]} 
          alt="Deity"
          className="w-full h-full object-cover opacity-40 blur-sm scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => actions.navigate('DASHBOARD')}
            className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div>
            <span className="text-saffron-400 text-[10px] font-black uppercase tracking-[0.3em] block mb-1">Current Bhajan</span>
            <h1 className="text-2xl font-black text-white">{currentSlot.bhajan.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {musicians.map((m: any, i: number) => (
              <div 
                key={i} 
                title={`${m.instrument}: ${m.name}`}
                className="w-10 h-10 rounded-full border-2 border-black bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white uppercase"
              >
                {m.name.charAt(0)}
              </div>
            ))}
          </div>
          <button 
            onClick={toggleFullscreen}
            className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-6 h-6 text-white" /> : <Maximize2 className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 text-center">
        <div className="max-w-5xl w-full space-y-12">
          {/* Lyrics Section */}
          <div className="space-y-6">
            {currentSlot.bhajan.lyrics.map((line, i) => (
              <p 
                key={i} 
                className={`text-4xl md:text-6xl font-black leading-tight tracking-tight ${i === 0 ? 'text-white' : 'text-white/80'}`}
              >
                {line}
              </p>
            ))}
          </div>

          {/* Meaning Section */}
          {currentSlot.bhajan.meaning && (
            <div className="pt-12 border-t border-white/10">
              <p className="text-xl md:text-2xl font-medium text-indigo-200 italic leading-relaxed max-w-4xl mx-auto">
                "{currentSlot.bhajan.meaning}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Navigation */}
      <div className="relative z-10 p-10 bg-black/40 backdrop-blur-md border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-saffron-500 rounded-2xl flex items-center justify-center text-white">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Singer</span>
              <p className="text-lg font-black text-white">{currentSlot.singerName}</p>
            </div>
          </div>

          <div className="h-10 w-px bg-white/10" />

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Scale / Raga</span>
              <p className="text-lg font-black text-white">{currentSlot.scale} • {currentSlot.bhajan.raga || 'Unknown'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {nextSlot && (
            <div className="text-right hidden md:block">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Next Up</span>
              <p className="text-sm font-bold text-white/80">{nextSlot.bhajan.title} ({nextSlot.singerName})</p>
            </div>
          )}
          <div className="flex gap-2">
            <button 
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex(prev => prev - 1)}
              className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 disabled:opacity-20 transition-all"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
            <button 
              disabled={activeIndex === currentLineup.length - 1}
              onClick={() => setActiveIndex(prev => prev + 1)}
              className="w-14 h-14 bg-saffron-500 rounded-2xl flex items-center justify-center hover:bg-saffron-600 disabled:opacity-20 transition-all shadow-lg shadow-saffron-500/20"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
