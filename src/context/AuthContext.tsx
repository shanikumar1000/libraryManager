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
  signIn: (email: string, password: string) => Promise<{ error: string | null; role: UserRole | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (authUser: User): Promise<AuthUser> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) throw error;

    const role = (data?.role as UserRole) ?? 'student';
    const name = data?.full_name || authUser.email?.split('@')[0] || 'User';
    const email = data?.email || authUser.email || '';

    return { id: authUser.id, email, name, role };
  }, []);

  const loadUser = useCallback(
    async (currentSession: Session | null) => {
      if (!currentSession?.user) {
        setUser(null);
        setSession(null);
        return;
      }
      try {
        const profile = await fetchProfile(currentSession.user);
        setUser(profile);
        setSession(currentSession);
      } catch {
        setUser(null);
        setSession(null);
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

    try {
      const profile = await fetchProfile(data.user);
      setUser(profile);
      setSession(data.session);
      return { error: null, role: profile.role };
    } catch {
      return { error: null, role: null };
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        session,
        isAuthenticated: !!user,
        isLoading,
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
