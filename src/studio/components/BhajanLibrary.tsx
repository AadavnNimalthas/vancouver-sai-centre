// @ts-nocheck

import React, { useState, useMemo } from 'react';
import { useAppStore } from '../services/store';
import { 
  Search, Filter, Plus, Music, Mic2, Star, Clock, 
  ChevronRight, Play, Wand2, Globe, BookOpen, Share2,
  MoreVertical, Trash2, Edit2, CheckCircle2, AlertCircle, Info,
  X, Sparkles
} from 'lucide-react';
import { Bhajan, Role } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

export const BhajanLibrary: React.FC = () => {
  const { state, actions } = useAppStore();
  const { bhajanLibrary, currentUser } = state;
  
  const [activeTab, setActiveTab] = useState<'VAULT' | 'DISCOVER'>('VAULT');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeity, setSelectedDeity] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBhajan, setSelectedBhajan] = useState<Bhajan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPacks, setGeneratedPacks] = useState<any[]>([]);

  const deities = ['All', ...Array.from(new Set(bhajanLibrary.map(b => b.deity)))];

  const filteredBhajans = useMemo(() => {
    return bhajanLibrary.filter(b => {
      const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           b.lyrics.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDeity = selectedDeity === 'All' || b.deity === selectedDeity;
      return matchesSearch && matchesDeity;
    });
  }, [bhajanLibrary, searchQuery, selectedDeity]);

  const generateDiscovery = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Generate 3 'Bhajan Packs' for a spiritual session. Each pack should have a theme (e.g., 'Morning Peace', 'Ecstatic Dance', 'Deep Devotion') and a list of 4 famous bhajans with their deity and a brief description of why they fit the theme. Return as JSON.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                theme: { type: Type.STRING },
                description: { type: Type.STRING },
                bhajans: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      deity: { type: Type.STRING },
                      reason: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      const packs = JSON.parse(response.text);
      setGeneratedPacks(packs);
    } catch (error) {
      console.error("AI Discovery failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const [newBhajan, setNewBhajan] = useState({
    title: '',
    deity: '',
    lyrics: '',
    meaning: '',
    audioUrl: '',
    tags: [] as string[]
  });

  const handleAddBhajan = (e: React.FormEvent) => {
    e.preventDefault();
    const bhajanToSave: any = {
      ...newBhajan,
      lyrics: newBhajan.lyrics.split('\n').filter(line => line.trim() !== ''),
      bhajanId: `bhajan-${Date.now()}`,
      scale: 'C#',
      raga: 'Unknown',
      tempo: 'Medium',
      difficulty: 1
    };
    actions.addBhajan(bhajanToSave);
    setShowAddModal(false);
    setNewBhajan({ title: '', deity: '', lyrics: '', meaning: '', audioUrl: '', tags: [] });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-indigo-950 dark:text-white">Bhajan Library</h2>
          <p className="text-gray-400 dark:text-white/40 text-sm font-medium">Manage your sacred collection and discover new hymns.</p>
        </div>
        
        <div className="flex items-center bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('VAULT')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'VAULT' ? 'bg-white dark:bg-white/10 text-indigo-950 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white/60'}`}
          >
            VAULT
          </button>
          <button 
            onClick={() => setActiveTab('DISCOVER')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'DISCOVER' ? 'bg-white dark:bg-white/10 text-indigo-950 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white/60'}`}
          >
            DISCOVER
          </button>
        </div>
      </div>

      {activeTab === 'VAULT' ? (
        <>
          {/* Filters & Search */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search by title or lyrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-saffron-500/20 transition-all font-medium dark:text-white"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select 
                value={selectedDeity}
                onChange={(e) => setSelectedDeity(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl outline-none appearance-none font-bold text-indigo-950 dark:text-white"
              >
                {deities.map(d => <option key={d} value={d} className="dark:bg-indigo-900">{d}</option>)}
              </select>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-900 dark:bg-saffron-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-saffron-600 transition-all shadow-lg shadow-indigo-900/20 dark:shadow-saffron-500/20"
            >
              <Plus className="w-5 h-5" /> Add New
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBhajans.map(bhajan => (
              <div 
                key={bhajan.bhajanId}
                onClick={() => setSelectedBhajan(bhajan)}
                className="bg-white dark:bg-indigo-900/40 p-6 rounded-[2rem] border border-gray-50 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-saffron-400 group-hover:bg-indigo-900 dark:group-hover:bg-saffron-500 group-hover:text-white transition-colors">
                    <Music className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const plId = prompt('Enter Playlist ID or Name:');
                        if (plId) actions.addToPlaylist(plId, bhajan.bhajanId);
                      }}
                      className="p-2 text-gray-300 dark:text-white/20 hover:text-indigo-600 dark:hover:text-saffron-400 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    {bhajan.audioUrl && <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />}
                    <Star className="w-5 h-5 text-gray-200 dark:text-white/10 hover:text-saffron-500 transition-colors" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-indigo-950 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-saffron-400 transition-colors">{bhajan.title}</h3>
                <p className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest mb-4">{bhajan.deity}</p>
                <div className="flex flex-wrap gap-2">
                  {bhajan.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/40 text-[8px] font-black rounded-lg uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-10">
          <div className="bg-indigo-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-saffron-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300">AI Curator</span>
              </div>
              <h3 className="text-4xl font-black mb-4">Discover Your Next Practice</h3>
              <p className="text-indigo-200/60 font-medium mb-10">Let our spiritual intelligence curate the perfect bhajan packs based on your current vibration and session themes.</p>
              <button 
                onClick={generateDiscovery}
                disabled={isGenerating}
                className="bg-white text-indigo-950 px-10 py-5 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all disabled:opacity-50"
              >
                {isGenerating ? 'Curating...' : 'Generate Packs'}
              </button>
            </div>
            <Wand2 className="absolute right-0 bottom-0 w-80 h-80 text-white/5 -mb-20 -mr-20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {generatedPacks.map((pack, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
                <div>
                  <h4 className="text-2xl font-black text-indigo-950 mb-2">{pack.theme}</h4>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed">{pack.description}</p>
                </div>
                <div className="space-y-4">
                  {pack.bhajans.map((b: any, j: number) => (
                    <div key={j} className="flex items-center justify-between group cursor-pointer">
                      <div>
                        <p className="text-sm font-bold text-indigo-950 group-hover:text-indigo-600 transition-colors">{b.title}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase">{b.deity}</p>
                      </div>
                      <Plus className="w-4 h-4 text-gray-300 group-hover:text-indigo-600" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {generatedPacks.length === 0 && !isGenerating && (
              <div className="col-span-3 py-20 text-center space-y-4">
                <Globe className="w-12 h-12 text-gray-200 mx-auto" />
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No packs generated yet. Tap the button above.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-indigo-900 rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-white/5">
            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-400" />
            </button>
            
            <h3 className="text-3xl font-black text-indigo-950 dark:text-white mb-8">Add New Bhajan</h3>
            
            <form onSubmit={handleAddBhajan} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Title</label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-saffron-500/20 dark:text-white"
                    value={newBhajan.title}
                    onChange={e => setNewBhajan({...newBhajan, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Deity</label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-saffron-500/20 dark:text-white"
                    value={newBhajan.deity}
                    onChange={e => setNewBhajan({...newBhajan, deity: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Lyrics</label>
                <textarea 
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-saffron-500/20 font-medium dark:text-white"
                  value={newBhajan.lyrics}
                  onChange={e => setNewBhajan({...newBhajan, lyrics: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Meaning</label>
                <textarea 
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-saffron-500/20 font-medium dark:text-white"
                  value={newBhajan.meaning}
                  onChange={e => setNewBhajan({...newBhajan, meaning: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Audio URL (Optional)</label>
                <input 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-saffron-500/20 dark:text-white"
                  value={newBhajan.audioUrl}
                  onChange={e => setNewBhajan({...newBhajan, audioUrl: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-indigo-900 dark:bg-saffron-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-900/20 dark:shadow-saffron-500/20 active:scale-95 transition-all"
              >
                Save to Vault
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedBhajan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-indigo-900 rounded-[3rem] w-full max-w-4xl p-10 shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col border border-white/5">
            <button onClick={() => setSelectedBhajan(null)} className="absolute top-8 right-8 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors z-10">
              <X className="w-6 h-6 text-gray-400" />
            </button>
            
            <div className="flex flex-col md:flex-row gap-10 overflow-y-auto pr-4">
              <div className="flex-1 space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 bg-indigo-50 dark:bg-white/5 text-indigo-600 dark:text-saffron-400 text-[10px] font-black rounded-full uppercase tracking-widest">
                      {selectedBhajan.deity}
                    </span>
                    {selectedBhajan.audioUrl && (
                      <button 
                        onClick={() => actions.setPracticeBhajan(selectedBhajan)}
                        className="flex items-center gap-2 text-teal-500 dark:text-teal-400 font-black text-[10px] uppercase tracking-widest hover:underline"
                      >
                        <Play className="w-4 h-4 fill-current" /> Practice Mode
                      </button>
                    )}
                  </div>
                  <h3 className="text-4xl font-black text-indigo-950 dark:text-white mb-2">{selectedBhajan.title}</h3>
                  <div className="flex gap-2">
                    {selectedBhajan.tags.map(t => <span key={t} className="text-[10px] font-bold text-gray-300 dark:text-white/20 uppercase">#{t}</span>)}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Lyrics
                  </h4>
                  <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-[2.5rem] whitespace-pre-wrap font-medium text-indigo-950 dark:text-white leading-relaxed text-lg italic">
                    {Array.isArray(selectedBhajan.lyrics) ? selectedBhajan.lyrics.join('\n') : selectedBhajan.lyrics}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-80 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-4 h-4" /> Divine Meaning
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-white/60 font-medium leading-relaxed">
                    {selectedBhajan.meaning || "No meaning provided for this hymn yet."}
                  </p>
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-white/5 space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex flex-col items-center gap-2 hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors group">
                      <Share2 className="w-5 h-5 text-gray-400 dark:text-white/20 group-hover:text-indigo-600 dark:group-hover:text-saffron-400" />
                      <span className="text-[8px] font-black text-gray-400 dark:text-white/40 group-hover:text-indigo-600 dark:group-hover:text-saffron-400">SHARE</span>
                    </button>
                    <button className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex flex-col items-center gap-2 hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors group">
                      <Edit2 className="w-5 h-5 text-gray-400 dark:text-white/20 group-hover:text-indigo-600 dark:group-hover:text-saffron-400" />
                      <span className="text-[8px] font-black text-gray-400 dark:text-white/40 group-hover:text-indigo-600 dark:group-hover:text-saffron-400">EDIT</span>
                    </button>
                    <button className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex flex-col items-center gap-2 hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors group">
                      <Star className="w-5 h-5 text-gray-400 dark:text-white/20 group-hover:text-indigo-600 dark:group-hover:text-saffron-400" />
                      <span className="text-[8px] font-black text-gray-400 dark:text-white/40 group-hover:text-indigo-600 dark:group-hover:text-saffron-400">FAVORITE</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this bhajan from your vault?')) {
                          actions.deleteBhajan(selectedBhajan.bhajanId);
                          setSelectedBhajan(null);
                        }
                      }}
                      className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex flex-col items-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group"
                    >
                      <Trash2 className="w-5 h-5 text-gray-400 dark:text-white/20 group-hover:text-red-500" />
                      <span className="text-[8px] font-black text-gray-400 dark:text-white/40 group-hover:text-red-500">DELETE</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
