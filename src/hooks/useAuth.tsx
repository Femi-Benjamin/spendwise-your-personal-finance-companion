import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
// Intentionally do not call Supabase when auth is disabled

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Authentication is disabled: provide a local pseudo-user so
    // app features that rely on a user id (local storage keys, etc.) continue to work.
    const fakeUser = {
      id: 'local_user',
      email: 'local@localhost',
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      role: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    setSession(null);
    setUser(fakeUser);
    setLoading(false);
    return () => {};
  }, []);

  // Auth disabled: stubbed functions that return success without network calls
  const signUp = async (_email: string, _password: string) => {
    return { error: null } as { error: Error | null };
  };

  const signIn = async (_email: string, _password: string) => {
    return { error: null } as { error: Error | null };
  };

  const signOut = async () => {
    // noop
    return;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
