// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../services/store';
import { User, Message } from '../types';
import { Shield, Send, Search, CheckCheck, Lock, User as UserIcon, Users, Sparkles, Wand2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export const Messages: React.FC = () => {
  const { state, actions } = useAppStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [msgInput, setMsgInput] = useState('');
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [searchUser, setSearchUser] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const devotees = state.usersInCenter.filter(u => u.userId !== state.currentUser?.userId && 
    u.name.toLowerCase().includes(searchUser.toLowerCase())
  );

  const chatMessages = state.messages.filter(m => 
    (m.senderId === state.currentUser?.userId && m.receiverId === selectedUser?.userId) ||
    (m.senderId === selectedUser?.userId && m.receiverId === state.currentUser?.userId)
  ).sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, selectedUser]);

  const handleSend = () => {
    if ((selectedUser || selectedRoom) && msgInput.trim()) {
      const receiverId = selectedUser?.userId || selectedRoom || 'group';
      actions.sendMessage(receiverId, msgInput.trim());
      setMsgInput('');
    }
  };

  const getAiSuggestion = async () => {
    setIsAiSuggesting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `We are in a spiritual bhajan session chat. 
        The current lineup has ${state.currentLineup.length} singers. 
        Suggest the "Next Singer" from the following list of devotees based on their preferred deity or skill level: 
        ${state.usersInCenter.map(u => `${u.name} (Prefers: ${u.preferredDeity}, Skill: ${u.skillRating})`).join(', ')}.
        Provide a short, encouraging reason for your choice.`,
      });
      setAiSuggestion(response.text);
    } catch (error) {
      console.error("AI Suggestion failed:", error);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      {/* Devotee List */}
      <div className="w-full md:w-80 border-r border-gray-50 flex flex-col bg-gray-50/30">
        <div className="p-6">
          <h2 className="text-2xl font-black text-indigo-900 mb-4">Soul Chat</h2>
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => { setSelectedRoom(null); setSelectedUser(null); }}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!selectedRoom ? 'bg-indigo-900 text-white' : 'bg-white text-gray-400'}`}
            >
              Devotees
            </button>
            <button 
              onClick={() => { setSelectedRoom('thursday-bhajan'); setSelectedUser(null); }}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedRoom === 'thursday-bhajan' ? 'bg-indigo-900 text-white' : 'bg-white text-gray-400'}`}
            >
              Events
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Find..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100"
              value={searchUser}
              onChange={e => setSearchUser(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
          {selectedRoom ? (
            <button
              onClick={() => setSelectedRoom('thursday-bhajan')}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all bg-indigo-900 text-white shadow-lg`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-black text-sm truncate">Thursday Bhajan</p>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-wider">Event Room</p>
              </div>
            </button>
          ) : (
            devotees.map(devotee => (
              <button
                key={devotee.userId}
                onClick={() => { setSelectedUser(devotee); setSelectedRoom(null); }}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all
                  ${selectedUser?.userId === devotee.userId 
                    ? 'bg-indigo-900 text-white shadow-lg' 
                    : 'hover:bg-white text-gray-500 hover:shadow-sm'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg
                  ${selectedUser?.userId === devotee.userId ? 'bg-white/20' : 'bg-indigo-50 text-indigo-400'}`}>
                  {devotee.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="font-black text-sm truncate">{devotee.name}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedUser?.userId === devotee.userId ? 'text-white/60' : 'text-gray-400'}`}>
                    {devotee.role}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {(selectedUser || selectedRoom) ? (
          <>
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-saffron-100 flex items-center justify-center text-saffron-600 font-bold">
                  {selectedUser ? selectedUser.name.charAt(0) : <Users className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-black text-indigo-900">{selectedUser ? selectedUser.name : 'Thursday Bhajan Room'}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-teal-600 font-black uppercase tracking-widest">
                    <Shield className="w-3 h-3" /> End-to-End Encrypted
                  </div>
                </div>
              </div>
              {selectedRoom && (
                <button 
                  onClick={getAiSuggestion}
                  disabled={isAiSuggesting}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4" /> {isAiSuggesting ? 'Thinking...' : 'AI Suggest Singer'}
                </button>
              )}
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/20"
            >
              {aiSuggestion && (
                <div className="bg-indigo-900 text-white p-6 rounded-[2rem] mb-6 relative overflow-hidden group animate-fade-in">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-saffron-400" />
                      <span className="text-[8px] font-black uppercase tracking-[0.3em]">AI Coordination Suggestion</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed italic">"{aiSuggestion}"</p>
                    <button 
                      onClick={() => setAiSuggestion(null)}
                      className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                    >
                      Dismiss
                    </button>
                  </div>
                  <Wand2 className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12" />
                </div>
              )}
              <div className="flex justify-center mb-8">
                <div className="bg-indigo-50 px-4 py-2 rounded-full flex items-center gap-2 border border-indigo-100">
                  <Lock className="w-3 h-3 text-indigo-400" />
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Vault Session Private</span>
                </div>
              </div>

              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
                   <UserIcon className="w-12 h-12 mb-4" />
                   <p className="font-black text-indigo-900">No spiritual vibrations yet.</p>
                   <p className="text-xs font-bold">Messages are only stored in your secure vault.</p>
                </div>
              ) : (
                chatMessages.map(msg => {
                  const isMine = msg.senderId === state.currentUser?.userId;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm relative group
                        ${isMine ? 'bg-indigo-900 text-white rounded-br-none' : 'bg-white border border-gray-100 text-indigo-900 rounded-bl-none'}`}>
                        <p className="font-bold text-sm leading-relaxed">{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold
                          ${isMine ? 'text-white/40' : 'text-gray-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMine && <CheckCheck className="w-3 h-3 text-teal-400" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-6 bg-white border-t border-gray-50">
              <div className="flex gap-4 items-center bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <input 
                  type="text" 
                  placeholder="Type a soulful message..."
                  className="flex-1 bg-transparent px-4 py-2 font-bold text-indigo-900 outline-none"
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => e.key === 'ENTER' && handleSend()}
                />
                <button 
                  onClick={handleSend}
                  disabled={!msgInput.trim()}
                  className="bg-indigo-900 text-white p-3 rounded-xl hover:bg-black transition-all shadow-lg shadow-indigo-900/10 disabled:opacity-30"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-200 mb-6">
               <Shield className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-indigo-900 mb-2">Soul-to-Soul Secure Vault</h3>
            <p className="text-gray-400 max-w-sm font-bold">Select a devotee to start a secure, encrypted conversation within your center.</p>
          </div>
        )}
      </div>
    </div>
  );
};