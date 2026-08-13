import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { attendanceApi } from '@/services/api/attendance';
import type { UserProfile, UserRole } from '@/types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const p = await attendanceApi.getProfile();
      setProfile(p);
    } catch (err) {
      console.warn('[Auth] Failed to load profile:', err);
      // Fallback profile if profile fetch fails
      const email = currentSession.user.email || '';
      const roll = email.split('@')[0].toUpperCase() || 'STUDENT';
      setProfile({
        id: currentSession.user.id,
        full_name: roll,
        roll_number: roll,
        role: 'student',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      fetchProfile(session);
    });

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      fetchProfile(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (redirectTo?: string) => {
    const origin = window.location.origin;
    const targetUrl = redirectTo ? `${origin}${redirectTo}` : `${origin}/dashboard`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: targetUrl,
        queryParams: {
          hd: 'iiitdm.ac.in',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      console.error('[Auth] Google sign-in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('[Auth] SignOut error:', e);
    }

    sessionStorage.clear();
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.includes('sb-') || k.includes('supabase') || k.includes('auth'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {}

    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    await fetchProfile(session);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role: profile?.role ?? null,
        loading,
        signInWithGoogle,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
