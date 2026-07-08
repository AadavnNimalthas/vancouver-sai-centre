// @ts-nocheck

import React from 'react';
import { useAppStore } from '../services/store';
import { User, Zap, Trophy, Star, Settings, LogOut, ChevronRight, Shield, Bell, Heart } from 'lucide-react';

export const Profile: React.FC = () => {
  const { state, actions } = useAppStore();
  const { currentUser } = state;

  if (!currentUser) return null;

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white dark:bg-indigo-900/40 p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
        <div className="relative z-10">
          <div className="w-32 h-32 bg-indigo-900 dark:bg-saffron-500 rounded-[2.5rem] flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-indigo-900/20 dark:shadow-saffron-500/20 group-hover:scale-105 transition-transform duration-500">
            {currentUser.name.charAt(0)}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-saffron-500 dark:bg-indigo-900 w-10 h-10 rounded-2xl border-4 border-white dark:border-indigo-950 flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
        </div>
        
        <div className="relative z-10 text-center md:text-left flex-1">
          <h2 className="text-4xl font-black text-indigo-950 dark:text-white mb-2">{currentUser.name}</h2>
          <p className="text-gray-400 dark:text-white/40 font-bold uppercase text-[10px] tracking-[0.3em] mb-6">{currentUser.role} • {state.currentCenter?.name || 'Independent Practitioner'}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="px-6 py-3 bg-indigo-50 dark:bg-white/5 rounded-2xl flex items-center gap-3 border border-indigo-100 dark:border-white/5">
              <Star className="w-5 h-5 text-indigo-600 dark:text-saffron-400" />
              <div>
                <p className="text-[8px] font-black text-indigo-400 dark:text-white/40 uppercase tracking-widest leading-none mb-1">Skill Rating</p>
                <p className="text-lg font-black text-indigo-950 dark:text-white leading-none">{currentUser.skillRating}/4</p>
              </div>
            </div>
            <div className="px-6 py-3 bg-saffron-50 dark:bg-white/5 rounded-2xl flex items-center gap-3 border border-saffron-100 dark:border-white/5">
              <Shield className="w-5 h-5 text-saffron-600 dark:text-saffron-400" />
              <div>
                <p className="text-[8px] font-black text-saffron-400 dark:text-white/40 uppercase tracking-widest leading-none mb-1">Status</p>
                <p className="text-lg font-black text-saffron-950 dark:text-white leading-none">Active</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-50 dark:bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-indigo-900/40 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <h4 className="text-xl font-black text-indigo-950 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-saffron-400" /> Account Settings
          </h4>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-indigo-50 dark:hover:bg-white/10 transition-all group">
              <div className="flex items-center gap-4">
                <Shield className="w-5 h-5 text-gray-400 dark:text-white/20 group-hover:text-indigo-600 dark:group-hover:text-saffron-400" />
                <span className="font-bold text-gray-600 dark:text-white/60 group-hover:text-indigo-950 dark:group-hover:text-white">Privacy & Security</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 dark:text-white/10" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-indigo-50 dark:hover:bg-white/10 transition-all group">
              <div className="flex items-center gap-4">
                <Bell className="w-5 h-5 text-gray-400 dark:text-white/20 group-hover:text-indigo-600 dark:group-hover:text-saffron-400" />
                <span className="font-bold text-gray-600 dark:text-white/60 group-hover:text-indigo-950 dark:group-hover:text-white">Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 dark:text-white/10" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-indigo-50 dark:hover:bg-white/10 transition-all group">
              <div className="flex items-center gap-4">
                <Heart className="w-5 h-5 text-gray-400 dark:text-white/20 group-hover:text-indigo-600 dark:group-hover:text-saffron-400" />
                <span className="font-bold text-gray-600 dark:text-white/60 group-hover:text-indigo-950 dark:group-hover:text-white">Preferences</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 dark:text-white/10" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-indigo-900/40 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <h4 className="text-xl font-black text-indigo-950 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-saffron-500" /> Achievements
          </h4>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-square bg-gray-50 dark:bg-white/5 rounded-2xl flex flex-col items-center justify-center p-4 text-center group hover:bg-saffron-50 dark:hover:bg-white/10 transition-all">
                <div className="w-10 h-10 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-200 dark:text-white/10 group-hover:text-saffron-50 dark:group-hover:text-saffron-400 shadow-sm mb-2 transition-all">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="text-[8px] font-black text-gray-300 dark:text-white/20 group-hover:text-saffron-600 dark:group-hover:text-saffron-400 uppercase tracking-widest">Badge {i}</span>
              </div>
            ))}
          </div>
          <button className="w-full py-4 text-indigo-600 dark:text-saffron-400 font-black text-xs uppercase tracking-widest hover:underline">View All Badges</button>
        </div>
      </div>

      <button 
        onClick={actions.logout}
        className="w-full py-6 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-900/5 group"
      >
        <LogOut className="w-6 h-6 group-hover:translate-x-1 transition-transform" /> Sign Out from Vault
      </button>
    </div>
  );
};
