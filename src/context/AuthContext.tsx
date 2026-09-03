import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

export type UserRole = 'student' | 'admin';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profileError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null; role: UserRole | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (authUser: User): Promise<AuthUser> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Profile not found. Please contact an administrator.');

    const role = data.role as UserRole;
    if (role !== 'student' && role !== 'admin') {
      throw new Error(`Unknown role "${role}". Please contact an administrator.`);
    }

    const name = data.full_name || authUser.email?.split('@')[0] || 'User';
    const email = data.email || authUser.email || '';

    return { id: authUser.id, email, name, role };
  }, []);

  const loadUser = useCallback(
    async (currentSession: Session | null) => {
      if (!currentSession?.user) {
        setUser(null);
        setSession(null);
        setProfileError(null);
        return;
      }
      try {
        const profile = await fetchProfile(currentSession.user);
        setUser(profile);
        setSession(currentSession);
        setProfileError(null);
      } catch (err) {
        setUser(null);
        setSession(currentSession);
        setProfileError(err instanceof Error ? err.message : 'Failed to load user profile.');
      }
    },
    [fetchProfile],
  );

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      loadUser(data.session).finally(() => mounted && setIsLoading(false));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        await loadUser(newSession);
        if (!mounted) return;
        if (!newSession) setIsLoading(false);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUser]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message, role: null };

    // signInWithPassword returns the session immediately, but the session may
    // not yet be fully propagated to the onAuthStateChange listener. We fetch
    // the profile directly here so the caller gets the role without racing
    // against the listener. The listener will also fire and set the same state.
    try {
      const profile = await fetchProfile(data.user);
      setUser(profile);
      setSession(data.session);
      setProfileError(null);
      return { error: null, role: profile.role };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load user profile.';
      setProfileError(msg);
      return { error: msg, role: null };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfileError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        session,
        isAuthenticated: !!user,
        isLoading,
        profileError,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
