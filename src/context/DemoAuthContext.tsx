import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// TEMPORARY: Demo auth context for frontend testing only.
// This will be replaced by real Supabase authentication in a future phase.
// To remove: delete this file, remove DemoAuthProvider from App.tsx,
// and remove all useDemoAuth() calls.

export type DemoRole = 'student' | 'admin';

interface DemoUser {
  name: string;
  email: string;
  role: DemoRole;
}

interface DemoAuthContextValue {
  user: DemoUser | null;
  role: DemoRole | null;
  signIn: (role: DemoRole) => void;
  signOut: () => void;
  isAuthenticated: boolean;
}

const STORAGE_KEY = 'athenaeum_demo_role';

const demoUsers: Record<DemoRole, DemoUser> = {
  student: { name: 'Jane Reader', email: 'student@demo.library', role: 'student' },
  admin: { name: 'Admin Librarian', email: 'admin@demo.library', role: 'admin' },
};

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null);

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<DemoRole | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'student' || stored === 'admin') {
      setRole(stored);
    }
  }, []);

  const signIn = (newRole: DemoRole) => {
    sessionStorage.setItem(STORAGE_KEY, newRole);
    setRole(newRole);
  };

  const signOut = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setRole(null);
  };

  const user = role ? demoUsers[role] : null;

  return (
    <DemoAuthContext.Provider value={{ user, role, signIn, signOut, isAuthenticated: !!user }}>
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth(): DemoAuthContextValue {
  const ctx = useContext(DemoAuthContext);
  if (!ctx) {
    throw new Error('useDemoAuth must be used within DemoAuthProvider');
  }
  return ctx;
}
