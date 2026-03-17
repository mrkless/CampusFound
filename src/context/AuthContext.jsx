import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Prevent auto-login on verification/password recovery redirects
      const hash = window.location.hash;
      if (event === 'SIGNED_IN' && (hash.includes('type=signup') || hash.includes('type=recovery') || hash.includes('type=invite'))) {
        await supabase.auth.signOut();
        window.location.hash = '';
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err.message);
    }
  };

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signUp = (email, password, name) => supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: { name }
    }
  });
  const signOut = () => supabase.auth.signOut();
  
  const resendVerificationEmail = (email) => supabase.auth.resend({
    type: 'signup',
    email: email
  });

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, resendVerificationEmail, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
