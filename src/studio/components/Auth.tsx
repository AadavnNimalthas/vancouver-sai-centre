// @ts-nocheck
import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { MOCK_USERS, MOCK_CENTER } from '../services/mockData';
import { Deity, Role, SkillLevel, User } from '../types';
import { Music, ArrowRight, UserPlus, LogIn, Sparkles } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { actions, state } = useAppStore();
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  
  // Login State
  const [selectedUser, setSelectedUser] = useState<string>(MOCK_USERS[0].userId);

  // Signup State
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    role: Role.SINGER,
    skillRating: SkillLevel.BEGINNER,
    preferredDeity: Deity.GANESHA
  });

  const handleRegister = () => {
    if (formData.name) {
      actions.register(formData);
    }
  };
  
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 
      ${mode === 'LOGIN' ? 'bg-gradient-to-br from-saffron-50 to-orange-100' : 'bg-gradient-to-br from-teal-50 to-cyan-100'}`}>
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transition-all duration-300 transform">
        
        {/* Header Section */}
        <div className={`p-8 text-center transition-colors duration-300 relative overflow-hidden
          ${mode === 'LOGIN' ? 'bg-saffron-600' : 'bg-teal-600'}`}>
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 ring-4 ring-white/10">
              {mode === 'LOGIN' ? <Music className="w-8 h-8 text-white" /> : <Sparkles className="w-8 h-8 text-white" />}
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">ISai Organizer</h1>
            <p className="text-white/80 mt-2 text-sm font-medium">
              {mode === 'LOGIN' ? 'Welcome Back, Sai Ram' : 'Join the Spiritual Journey'}
            </p>
          </div>
          {/* Decorative Circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute top-20 -left-10 w-20 h-20 bg-white/10 rounded-full"></div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          {mode === 'LOGIN' ? (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Select Existing User (Simulated)</label>
                <div className="relative">
                  <select 
                    className="w-full p-4 pl-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 outline-none transition-all appearance-none cursor-pointer"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    {MOCK_USERS.map(user => (
                      <option key={user.userId} value={user.userId}>
                        {user.name} — {user.role}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    ▼
                  </div>
                </div>
              </div>

              <button
                onClick={() => actions.login(selectedUser)}
                disabled={state.isLoading}
                className="w-full bg-saffron-600 hover:bg-saffron-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-saffron-500/30 flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
              >
                {state.isLoading ? 'Authenticating...' : (
                  <>
                    Sign In <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">New to ISai?</span>
                </div>
              </div>

              <button 
                onClick={() => setMode('SIGNUP')}
                className="w-full py-3 text-teal-600 font-semibold hover:bg-teal-50 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Create Account
              </button>
            </div>
          ) : (
            /* SIGNUP FORM */
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="e.g. Arun Kumar"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Role</label>
                   <select 
                     className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                     value={formData.role}
                     onChange={e => setFormData({...formData, role: e.target.value as Role})}
                   >
                     <option value={Role.SINGER}>Singer</option>
                     <option value={Role.ADMIN}>Admin</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Skill</label>
                   <select 
                     className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                     value={formData.skillRating}
                     onChange={e => setFormData({...formData, skillRating: Number(e.target.value) as SkillLevel})}
                   >
                     <option value={SkillLevel.BEGINNER}>Beginner</option>
                     <option value={SkillLevel.INTERMEDIATE}>Intermediate</option>
                     <option value={SkillLevel.ADVANCED}>Advanced</option>
                     <option value={SkillLevel.PROFESSIONAL}>Professional</option>
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Preferred Deity</label>
                <select 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  value={formData.preferredDeity}
                  onChange={e => setFormData({...formData, preferredDeity: e.target.value as Deity})}
                >
                  {Object.values(Deity).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <button
                onClick={handleRegister}
                disabled={!formData.name || state.isLoading}
                className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 transform hover:-translate-y-0.5 mt-2
                  ${!formData.name 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-teal-600 hover:bg-teal-700 text-white hover:shadow-teal-500/30'}`}
              >
                 {state.isLoading ? 'Creating...' : 'Join ISai'}
              </button>

              <button 
                onClick={() => setMode('LOGIN')}
                className="w-full py-2 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="fixed bottom-4 text-xs text-gray-400">
        Authentication Simulation Mode
      </div>
    </div>
  );
};

export const OnboardingScreen: React.FC = () => {
  const { actions, state } = useAppStore();
  const [code, setCode] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-8 border-t-4 border-indigo-900">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {state.currentUser?.name}!</h2>
        <p className="text-gray-500 mb-6">You aren't associated with a Bhajans Center yet.</p>

        <div className="space-y-4">
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-white hover:border-saffron-400 transition-colors">
             <label className="block text-sm font-bold text-gray-700 mb-2">
               Enter Center Join Code
             </label>
             <input
                type="text"
                placeholder="e.g. OMSAI"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-saffron-500 outline-none font-mono tracking-wider"
             />
             <p className="text-xs text-gray-400 mt-2">Try code: <strong className="text-saffron-600">{MOCK_CENTER.joinCode}</strong></p>
          </div>

          <button
            onClick={() => actions.joinCenter(code)}
            className="w-full bg-indigo-900 hover:bg-black text-white py-3 rounded-lg font-bold transition-all shadow-md"
          >
             Join Center
          </button>
          
          <button onClick={actions.logout} className="w-full text-sm text-gray-400 hover:text-red-500 mt-2">
            Logout / Cancel
          </button>
        </div>
      </div>
    </div>
  );
};