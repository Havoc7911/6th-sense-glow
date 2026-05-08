import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return undefined;
    }
    const sb = getSupabase();
    sb.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        setSession(s);
      })
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event, s) => {
      setSession(s);

      // Auto-redirect if we just landed from a recovery email
      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/reset-password';
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signInWithOtp = async (email) => {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured');
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/portal`,
      },
    });
    if (error) throw error;
  };

  const signInWithPassword = async (email, password) => {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured');
    const { data, error } = await sb.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
    return data;
  };

  const updatePassword = async (newPassword) => {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured');
    const { data, error } = await sb.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
  };

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAdmin: session?.user?.email === 'jmcc5271@gmail.com',
      loading,
      signInWithOtp,
      signInWithPassword,
      updatePassword,
      signOut,
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
