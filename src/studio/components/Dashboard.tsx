// @ts-nocheck

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../services/store';
import { 
  Zap, Trophy, Play, BookOpen, Music, 
  Mic, CheckCircle2, Star, Clock, WifiOff, ChevronRight, Download,
  Users, Monitor, Settings
} from 'lucide-react';
import { MUSICAL_SCALES } from '../types';

export const Dashboard: React.FC = () => {
  const { state, actions } = useAppStore();
  const { currentUser, currentLineup, bhajanLibrary } = state;

  const userSlots = currentLineup.filter(item => item.singerId === currentUser?.userId);
  const scheduledToday = userSlots.length > 0;
  
  // Bhajan Feed: Show a mix of recent and random bhajans
  const bhajanFeed = [...bhajanLibrary].sort(() => 0.5 - Math.random()).slice(0, 6);

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      {/* User Status Bar - Modern Greeting */}
      <div className="bg-white dark:bg-indigo-900 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-tr from-saffron-500 to-orange-300 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-saffron-500/20">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-teal-500 w-8 h-8 rounded-xl border-4 border-white dark:border-indigo-900 flex items-center justify-center shadow-lg">
              <Zap className="w-4 h-4 text-white fill-current" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-indigo-950 dark:text-white leading-tight">Sai Ram, {currentUser?.name}</h2>
            <p className="text-gray-400 dark:text-white/40 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
              {state.currentCenter?.name || 'Independent Practitioner'} • {currentUser?.role}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {state.isOfflineMode && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/40 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 dark:border-white/5">
              <WifiOff className="w-4 h-4" /> Offline Vault
            </div>
          )}
          <button 
            onClick={() => actions.navigate('PROFILE')}
            className="p-4 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/40 rounded-2xl hover:text-indigo-900 dark:hover:text-saffron-400 transition-all border border-gray-100 dark:border-white/5"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content: Bhajan Feed */}
        <div className="lg:col-span-2 space-y-10">
          
          {scheduledToday && (
            <div className="bg-indigo-900 dark:bg-saffron-500 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl group">
              <div className="relative z-10">
                <span className="text-saffron-400 dark:text-indigo-900 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Current Duty</span>
                <h3 className="text-4xl font-black mb-2">{userSlots[0].bhajan.title}</h3>
                <p className="text-indigo-200/60 dark:text-indigo-900/60 font-medium text-sm mb-10">You are singer #{userSlots[0].slotNumber} in today's session. Prepare your voice.</p>
                <div className="flex gap-4">
                  <button onClick={() => actions.navigate('ZEN_SESSION')} className="bg-white text-indigo-950 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-xl">
                    <Play className="w-5 h-5 fill-current" /> Enter Session
                  </button>
                </div>
              </div>
              <Mic className="absolute right-0 bottom-0 w-64 h-64 text-white/5 dark:text-indigo-900/10 -mb-10 -mr-10 group-hover:scale-110 transition-transform duration-700" />
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black text-indigo-950 dark:text-white">Bhajan Feed</h3>
              <button onClick={() => actions.navigate('LIBRARY')} className="text-[10px] font-black text-indigo-500 dark:text-saffron-400 uppercase tracking-widest hover:underline">View All</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bhajanFeed.map(bhajan => (
                <div 
                  key={bhajan.bhajanId}
                  className="bg-white dark:bg-indigo-900/40 p-6 rounded-[2.5rem] border border-gray-50 dark:border-white/5 shadow-sm hover:shadow-xl dark:hover:bg-indigo-900/60 transition-all group cursor-pointer"
                  onClick={() => actions.setPracticeBhajan(bhajan)}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-saffron-400 group-hover:bg-indigo-900 dark:group-hover:bg-saffron-500 group-hover:text-white transition-colors">
                      <Music className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                       {bhajan.audioUrl && <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />}
                       <Play className="w-4 h-4 text-gray-200 dark:text-white/20 group-hover:text-saffron-500 transition-colors" />
                    </div>
                  </div>
                  <h4 className="text-xl font-black text-indigo-950 dark:text-white mb-1">{bhajan.title}</h4>
                  <p className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest mb-4">{bhajan.deity}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-saffron-400 bg-indigo-50 dark:bg-white/5 px-3 py-1 rounded-lg uppercase tracking-widest">
                      {bhajan.raga}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-200 dark:text-white/20 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Stats & Lineup */}
        <div className="space-y-8">
           <div className="bg-white dark:bg-indigo-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
              <h4 className="font-black text-indigo-950 dark:text-white mb-6 flex items-center gap-2">
                 <Clock className="w-5 h-5 text-saffron-500" /> Stats
              </h4>
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest mb-1">Weekly Commitment</p>
                    <div className="flex justify-between items-end">
                       <p className="text-2xl font-black text-indigo-950 dark:text-white">4.5 Hrs</p>
                       <span className="text-xs font-black text-teal-500">+12%</span>
                    </div>
                 </div>
                 <div className="h-20 flex items-end gap-2">
                    {[3, 5, 2, 8, 4, 6, 9].map((h, i) => (
                      <div key={i} className="flex-1 bg-indigo-50 dark:bg-white/5 rounded-t-lg group relative" style={{ height: `${h * 10}%` }}>
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-900 dark:bg-saffron-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {h} slots
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-indigo-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-black text-indigo-950 dark:text-white flex items-center gap-2">
                   <Users className="w-5 h-5 text-indigo-600 dark:text-saffron-400" /> Lineup
                </h4>
                {currentLineup.length > 0 && (
                  <button 
                    onClick={() => actions.navigate('LINEUP')}
                    className="text-[8px] font-black text-indigo-500 dark:text-saffron-400 uppercase tracking-widest hover:underline"
                  >
                    Manage
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {currentLineup.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${item.status === 'ACTIVE' ? 'bg-saffron-500 text-white' : 'bg-white dark:bg-white/10 text-gray-400'}`}>
                      {item.slotNumber}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-indigo-950 dark:text-white truncate">{item.bhajan.title}</p>
                      <p className="text-[8px] font-black text-gray-400 dark:text-white/40 uppercase truncate">{item.singerName}</p>
                    </div>
                  </div>
                ))}
                {currentLineup.length === 0 && (
                  <p className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase text-center py-4">No session active</p>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
