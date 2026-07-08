"use client";

import React, { useEffect } from 'react';
import { AppProvider, useAppStore } from '@/studio/services/store';
import { Dashboard } from '@/studio/components/Dashboard';
import { Layout } from '@/studio/components/Layout';
import { BhajanLibrary } from '@/studio/components/BhajanLibrary';
import { LineupGenerator } from '@/studio/components/LineupGenerator';
import { Messages } from '@/studio/components/Messages';
import { ZenSession } from '@/studio/components/ZenSession';
import { Presentation } from '@/studio/components/Presentation';
import { Search } from '@/studio/components/Search';
import { Profile } from '@/studio/components/Profile';
import { Playlists } from '@/studio/components/Playlists';

// Note: We bypassed the original Auth and Onboarding screens 
// because we are already inside the VSC member portal layout!

const StudioContent: React.FC = () => {
  const { state, actions } = useAppStore();

  // Force bypass auth view since VSC portal handles auth
  useEffect(() => {
    if (state.view === 'AUTH' || state.view === 'ONBOARDING') {
      actions.navigate('DASHBOARD');
    }
  }, [state.view, actions]);

  if (state.view === 'ZEN_SESSION') return <ZenSession />;
  if (state.view === 'PRESENTATION') return <Presentation />;

  return (
    <Layout>
      {state.view === 'DASHBOARD' && <Dashboard />}
      {state.view === 'LIBRARY' && <BhajanLibrary />}
      {state.view === 'LINEUP' && <LineupGenerator />}
      {state.view === 'MESSAGES' && <Messages />}
      {state.view === 'SEARCH' && <Search />}
      {state.view === 'PROFILE' && <Profile />}
      {state.view === 'PLAYLISTS' && <Playlists />}
    </Layout>
  );
};

export default function StudioPage() {
  return (
    <AppProvider>
      <StudioContent />
    </AppProvider>
  );
}
