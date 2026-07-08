// @ts-nocheck
import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { User, SkillLevel } from '../types';
import { Wand2, UserCheck, AlertCircle } from 'lucide-react';

export const LineupGenerator: React.FC = () => {
  const { state, actions } = useAppStore();
  const [selectedSingers, setSelectedSingers] = useState<string[]>([]);

  // Toggle selection
  const toggleSinger = (id: string) => {
    if (selectedSingers.includes(id)) {
      setSelectedSingers(selectedSingers.filter(s => s !== id));
    } else {
      setSelectedSingers([...selectedSingers, id]);
    }
  };

  const handleGenerate = () => {
    if (selectedSingers.length === 0) return;
    actions.generateLineup(selectedSingers);
  };

  // Only Singers in the center
  const availableSingers = state.usersInCenter.filter(u => u.role === 'SINGER' || u.role === 'ADMIN');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Generate Lineup</h2>
            <p className="text-sm text-gray-500">Algorithm Phase 4.2: Select available singers for the session.</p>
          </div>
        </div>

        {availableSingers.length === 0 ? (
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            No singers found in this center.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {availableSingers.map(singer => {
              const isSelected = selectedSingers.includes(singer.userId);
              return (
                <div 
                  key={singer.userId}
                  onClick={() => toggleSinger(singer.userId)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center
                    ${isSelected 
                      ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' 
                      : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                       {singer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{singer.name}</p>
                      <p className="text-xs text-gray-500">
                        Lvl {singer.skillRating} • Prefers {singer.preferredDeity}
                      </p>
                    </div>
                  </div>
                  {isSelected && <UserCheck className="w-5 h-5 text-purple-600" />}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            onClick={handleGenerate}
            disabled={selectedSingers.length === 0}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2
              ${selectedSingers.length > 0 
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <Wand2 className="w-4 h-4" />
            Generate Smart Lineup
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded text-xs text-gray-500 font-mono">
            <strong>Algorithm Constraints:</strong><br/>
            1. Match singer skill to Bhajan difficulty.<br/>
            2. Avoid consecutive deities.<br/>
            3. Prioritize singer's preferred deity.
        </div>
      </div>
    </div>
  );
};