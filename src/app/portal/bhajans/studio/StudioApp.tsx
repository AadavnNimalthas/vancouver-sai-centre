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

// The VSC member, mapped to the shape the ISai studio store expects.
export type StudioSeedUser = {
  userId: string;
  name: string;
  email: string;
  role: string;
  skillRating: number;
  preferredDeity: string;
  centerId: string;
  isHarmoniumPlayer: boolean;
  vibrationLevel: number;
  authProvider: string;
  vscRole: string;
};

// Note: the original Auth/Onboarding screens are bypassed — we're already
// inside the authenticated VSC member portal, so the studio auto-logs-in.
const StudioContent: React.FC = () => {
  const { state, actions } = useAppStore();

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

export function StudioApp({ initialUser }: { initialUser: StudioSeedUser }) {
  return (
    <AppProvider initialUser={initialUser}>
      <StudioContent />
    </AppProvider>
  );
}
