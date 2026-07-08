// @ts-nocheck

import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { Search as SearchIcon, Sparkles, Music, Play, Plus } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { Bhajan } from '../types';

export const Search: React.FC = () => {
  const { state, actions } = useAppStore();
  const [query, setQuery] = useState('');
  const [isSmartSearching, setIsSmartSearching] = useState(false);
  const [results, setResults] = useState<Bhajan[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Basic local search
    const localResults = state.bhajanLibrary.filter(b => 
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.lyrics.some(l => l.toLowerCase().includes(query.toLowerCase())) ||
      b.deity.toLowerCase().includes(query.toLowerCase())
    );
    setResults(localResults);

    // Smart Search with Gemini
    setIsSmartSearching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `The user is searching for bhajans with the query: "${query}". 
        Based on our library of bhajans, provide a brief "spiritual insight" or "vibe match" for this search. 
        Also, if the search is about a specific mood (e.g., "peace", "energy"), explain why certain bhajans might fit.
        Keep it concise and devotional.`,
      });
      setAiInsight(response.text);
    } catch (error) {
      console.error("Smart search failed:", error);
    } finally {
      setIsSmartSearching(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-black text-indigo-950 dark:text-white mb-2">Search the Vault</h2>
        <p className="text-gray-400 dark:text-white/40 text-sm font-medium mb-8">Find bhajans by title, deity, or spiritual vibe.</p>

        <form onSubmit={handleSearch} className="relative group">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-saffron-400 transition-colors" />
          <input 
            type="text"
            placeholder="Search for 'peaceful Krishna bhajans'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-16 pr-6 py-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[2rem] outline-none shadow-sm focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-saffron-500/10 transition-all text-lg font-medium dark:text-white"
          />
          <button 
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-900 dark:bg-saffron-500 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-black dark:hover:bg-saffron-600 transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {aiInsight && (
        <div className="max-w-2xl mx-auto bg-indigo-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-white/5 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-saffron-400" />
              <span className="text-[10px] font-black text-indigo-600 dark:text-saffron-400 uppercase tracking-widest">AI Spiritual Insight</span>
            </div>
            <p className="text-indigo-900/80 dark:text-white/80 font-medium leading-relaxed italic">
              "{aiInsight}"
            </p>
          </div>
          <Sparkles className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-200/20 dark:text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map(bhajan => (
          <div 
            key={bhajan.bhajanId}
            className="bg-white dark:bg-indigo-900/40 p-6 rounded-[2rem] border border-gray-50 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-saffron-400 group-hover:bg-indigo-900 dark:group-hover:bg-saffron-500 group-hover:text-white transition-colors">
                <Music className="w-6 h-6" />
              </div>
              <button 
                onClick={() => actions.setPracticeBhajan(bhajan)}
                className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-400 dark:text-white/20 hover:bg-saffron-500 dark:hover:bg-saffron-500 hover:text-white transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
            <h3 className="text-xl font-black text-indigo-950 dark:text-white mb-1">{bhajan.title}</h3>
            <p className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest mb-4">{bhajan.deity}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-indigo-600 dark:text-saffron-400 bg-indigo-50 dark:bg-white/5 px-3 py-1 rounded-lg uppercase tracking-widest">
                {bhajan.raga}
              </span>
              <button className="p-2 text-gray-300 dark:text-white/20 hover:text-indigo-600 dark:hover:text-saffron-400 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {results.length === 0 && query && !isSmartSearching && (
          <div className="col-span-full py-20 text-center">
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No exact matches found. Try a different vibe.</p>
          </div>
        )}
      </div>
    </div>
  );
};
