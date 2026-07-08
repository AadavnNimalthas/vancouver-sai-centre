// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../services/store';
import { MUSICAL_SCALES } from '../types';
import { X, ChevronLeft, ChevronRight, Quote, BookOpen, Music2, Headphones, Repeat, Plus, Minus } from 'lucide-react';

const DEITY_IMAGES: Record<string, string> = {
  'Ganesha': 'https://picsum.photos/seed/ganesha/1920/1080',
  'Guru': 'https://picsum.photos/seed/guru/1920/1080',
  'Devi': 'https://picsum.photos/seed/devi/1920/1080',
  'Shiva': 'https://picsum.photos/seed/shiva/1920/1080',
  'Krishna': 'https://picsum.photos/seed/krishna/1920/1080',
  'Rama': 'https://picsum.photos/seed/rama/1920/1080',
  'Sai': 'https://picsum.photos/seed/sai/1920/1080',
  'Sarva Dharma': 'https://picsum.photos/seed/sarvadharma/1920/1080',
};

export const ZenSession: React.FC = () => {
  const { state, actions } = useAppStore();
  const [showMeaning, setShowMeaning] = useState(false);
  
  const activeSlot = state.currentLineup.find(item => item.status === 'ACTIVE');
  const activeBhajan = activeSlot?.bhajan;
  const [sessionScale, setSessionScale] = useState(activeSlot?.scale || activeBhajan?.scale || 'C#');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  // Simulate lyric alignment based on a hypothetical timer or audio progress
  // In a real app, this would come from timestamped metadata
  useEffect(() => {
    if (state.practiceBhajan) {
      const interval = setInterval(() => {
        setCurrentLineIndex(prev => (prev + 1) % (activeBhajan?.lyrics.length || 1));
      }, 5000); // Change line every 5 seconds for demo
      return () => clearInterval(interval);
    }
  }, [state.practiceBhajan, activeBhajan]);

  const transpose = (direction: 'up' | 'down') => {
    const currentIndex = MUSICAL_SCALES.indexOf(sessionScale);
    let nextIndex = direction === 'up' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= MUSICAL_SCALES.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = MUSICAL_SCALES.length - 1;
    const newScale = MUSICAL_SCALES[nextIndex];
    setSessionScale(newScale);
    
    // Save this scale for the singer/bhajan combination
    if (activeSlot && activeBhajan) {
      actions.updateSingerScale(activeSlot.singerId, activeBhajan.bhajanId, newScale);
    }
  };

  if (!activeBhajan) {
    return (
      <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-10 text-center">
         <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Music2 className="w-10 h-10 text-white/20" />
         </div>
         <h2 className="text-3xl font-black text-white mb-4">No Active Bhajan</h2>
         <p className="text-white/40 max-w-sm mb-8">Select a bhajan from your dashboard and click 'Play' to enter Zen Session mode.</p>
         <button onClick={() => actions.navigate('DASHBOARD')} className="bg-white text-indigo-900 px-8 py-3 rounded-2xl font-black">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] z-[200] flex flex-col text-white overflow-hidden animate-fade-in">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <img 
          src={DEITY_IMAGES[activeBhajan.deity] || DEITY_IMAGES['Sai']} 
          alt="Deity" 
          className="w-full h-full object-cover blur-md"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Zen Header */}
      <div className="p-8 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
         <div className="flex items-center gap-6">
            <button 
              onClick={() => actions.navigate('DASHBOARD')}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
            >
               <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
               <h1 className="text-2xl font-black tracking-tight">{activeBhajan.title}</h1>
               <div className="flex items-center gap-3 mt-1">
                 <span className="text-[10px] font-black uppercase tracking-widest text-saffron-400">{activeBhajan.deity}</span>
                 <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/5">
                    <Repeat className="w-3 h-3 text-saffron-300" />
                    <span className="text-[10px] font-black text-white">Live Key: {sessionScale}</span>
                    <div className="flex gap-1 ml-2 pl-2 border-l border-white/10">
                       <button onClick={() => transpose('down')} className="p-1 hover:text-saffron-400 transition-colors"><Minus className="w-3 h-3" /></button>
                       <button onClick={() => transpose('up')} className="p-1 hover:text-saffron-400 transition-colors"><Plus className="w-3 h-3" /></button>
                    </div>
                 </div>
               </div>
            </div>
         </div>
         
         <div className="flex gap-4">
            <button 
              onClick={() => setShowMeaning(!showMeaning)}
              className={`px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all
                ${showMeaning ? 'bg-saffron-500 text-white shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
               {showMeaning ? <Quote className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
               {showMeaning ? 'Lyrics' : 'Meaning'}
            </button>
            <button 
              onClick={() => {
                const active = state.currentLineup.find(i => i.status === 'ACTIVE');
                if (active) actions.updateSlotStatus(active.id, 'COMPLETED');
                actions.navigate('DASHBOARD');
              }}
              className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-black transition-all"
            >
               Finish
            </button>
         </div>
      </div>

      {/* Main Lyric Engine */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 lg:p-20 overflow-y-auto">
         <div className="max-w-5xl w-full">
            {showMeaning ? (
              <div className="animate-fade-in space-y-10 text-center">
                 <div className="w-20 h-1 bg-saffron-500/50 mx-auto rounded-full" />
                 <p className="text-3xl lg:text-5xl font-medium leading-relaxed text-white/90 italic">
                    {activeBhajan.meaning || "The divine vibrations of this bhajan carry a message of pure love and surrender."}
                 </p>
                 <div className="w-20 h-1 bg-saffron-500/50 mx-auto rounded-full" />
              </div>
            ) : (
              <div className="space-y-12 animate-fade-in">
                 {activeBhajan.lyrics.map((line, i) => (
                   <p 
                    key={i} 
                    className={`text-4xl md:text-6xl lg:text-7xl font-black text-center leading-tight transition-all duration-700 cursor-default tracking-tight
                      ${i === currentLineIndex ? 'text-saffron-400 scale-110' : 'text-white/20'}`}
                   >
                      {line}
                   </p>
                 ))}
              </div>
            )}
         </div>
      </div>

      {/* Zen Audio Mini-Bar (if active) */}
      <div className="p-8 flex justify-center bg-gradient-to-t from-black/50 to-transparent relative z-10">
         <div className="flex items-center gap-10 text-white/20">
            {activeBhajan.harmoniumNotes && (
              <div className="flex flex-col items-center gap-1 px-6 py-2 bg-white/5 rounded-2xl border border-white/5 text-saffron-400">
                 <Music2 className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest font-mono">{activeBhajan.harmoniumNotes}</span>
              </div>
            )}
            <div className="flex flex-col items-center gap-1">
               <Music2 className="w-5 h-5" />
               <span className="text-[10px] font-bold uppercase tracking-widest">{activeBhajan.raga}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
               <Headphones className="w-5 h-5" />
               <span className="text-[10px] font-bold uppercase tracking-widest">{activeBhajan.tempo}</span>
            </div>
         </div>
      </div>
    </div>
  );
};
