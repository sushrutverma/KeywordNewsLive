import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  article_duration_filter?: string;
  full_name?: string;
  occupation?: string;
  reading_goal?: number;
  followed_topics?: string[];
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  logout?: () => Promise<void>;
  updateDurationFilter: (duration: string) => Promise<void>;
  upsertProfile: (profileUpdates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        return;
      }
    } catch (err) {
      console.warn('Could not fetch user profile from database, checking local storage:', err);
    }

    // Local profile fallback
    try {
      const localData = localStorage.getItem(`user_profile_${userId}`);
      if (localData) {
        setProfile(JSON.parse(localData));
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateDurationFilter = async (duration: string) => {
    if (!user) return;
    
    await supabase
      .from('profiles')
      .update({ article_duration_filter: duration })
      .eq('id', user.id);
  };

  const upsertProfile = async (profileUpdates: Partial<Profile>) => {
    if (!user) return { error: new Error('User not logged in') };

    const localProfile: Profile = {
      id: user.id,
      ...(profile || {}),
      ...profileUpdates,
      updated_at: new Date().toISOString()
    };

    // Always persist to local cache immediately
    try {
      localStorage.setItem(`user_profile_${user.id}`, JSON.stringify(localProfile));
    } catch (e) {
      console.warn('Could not save profile to localStorage:', e);
    }
    setProfile(localProfile);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileUpdates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.warn('Supabase profiles table query returned warning, falling back to local storage profile:', error.message);
        return { error: null };
      }
      if (data) {
        setProfile(data);
      }
      return { error: null };
    } catch (err: any) {
      console.warn('Error syncing profile to remote Supabase (local fallback retained):', err);
      return { error: null };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      logout: signOut,
      updateDurationFilter,
      upsertProfile,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};