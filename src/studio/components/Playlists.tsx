// @ts-nocheck

import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { ListMusic, Plus, Play, Trash2, Music, ChevronRight, Download } from 'lucide-react';
import { Playlist } from '../types';

export const Playlists: React.FC = () => {
  const { state, actions } = useAppStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    actions.createPlaylist(newPlaylistName);
    setNewPlaylistName('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-indigo-950">Your Playlists</h2>
          <p className="text-gray-400 text-sm font-medium">Curate your personal bhajan collections.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-900 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" /> Create New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.playlists.map(playlist => (
          <div 
            key={playlist.id}
            onClick={() => setSelectedPlaylist(playlist)}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-900 group-hover:text-white transition-colors">
                <ListMusic className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-indigo-950 mb-2">{playlist.name}</h3>
              <p className="text-gray-400 text-xs font-medium">{playlist.bhajanIds.length} Bhajans</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </div>
        ))}

        {state.playlists.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-[3rem]">
            <ListMusic className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No playlists yet. Start curating your journey.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl relative">
            <h3 className="text-2xl font-black text-indigo-950 mb-6">New Playlist</h3>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Playlist Name</label>
                <input 
                  autoFocus
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  placeholder="e.g., Morning Sadhana"
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-900 text-white rounded-2xl font-black shadow-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playlist Detail Modal */}
      {selectedPlaylist && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl relative max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-black text-indigo-950">{selectedPlaylist.name}</h3>
                <p className="text-gray-400 text-sm font-medium">{selectedPlaylist.bhajanIds.length} Bhajans</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => alert('Offline sync started...')}
                  className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Delete this playlist?')) {
                      actions.deletePlaylist(selectedPlaylist.id);
                      setSelectedPlaylist(null);
                    }
                  }}
                  className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setSelectedPlaylist(null)}
                  className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-200 transition-all"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {selectedPlaylist.bhajanIds.map(id => {
                const bhajan = state.bhajanLibrary.find(b => b.bhajanId === id);
                if (!bhajan) return null;
                return (
                  <div key={id} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600">
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-indigo-950">{bhajan.title}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{bhajan.deity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => actions.setPracticeBhajan(bhajan)}
                        className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-saffron-500 transition-all"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      <button 
                        onClick={() => actions.removeFromPlaylist(selectedPlaylist.id, id)}
                        className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {selectedPlaylist.bhajanIds.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No bhajans in this playlist yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
