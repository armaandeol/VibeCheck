import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "../lib/supabase.js";
import { profile } from "../lib/profile.js";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Helper function to ensure profile exists for a user
  const ensureProfileExists = async (userData) => {
    try {
      const { exists, data } = await profile.profileExists(userData.id);
      if (!exists) {
        console.log('Profile does not exist, creating profile for user:', userData.email);
        const { data: createdProfile, error: createError } = await profile.createProfile(userData);
        if (createError) {
          console.error('Error creating profile:', createError);
          // Even if profile creation fails, try to fetch it (in case it was created by trigger)
          const { data: existingProfile } = await profile.getProfile(userData.id);
          setUserProfile(existingProfile);
        } else {
          // Fetch the newly created profile
          const { data: newProfile } = await profile.getProfile(userData.id);
          setUserProfile(newProfile);
          console.log('Profile created successfully for user:', userData.email);
        }
      } else {
        setUserProfile(data);
        console.log('Profile loaded for user:', userData.email);
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
      // Try to fetch profile anyway, in case it exists but there was an error
      try {
        const { data: fallbackProfile } = await profile.getProfile(userData.id);
        if (fallbackProfile) {
          setUserProfile(fallbackProfile);
          console.log('Profile loaded via fallback for user:', userData.email);
        }
      } catch (fallbackError) {
        console.error('Fallback profile fetch failed:', fallbackError);
      }
    }
  };

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      // If user exists, ensure profile exists and load it
      if (session?.user) {
        await ensureProfileExists(session.user);
      }
      
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Handle profile creation/loading for different events
      if (session?.user) {
        await ensureProfileExists(session.user);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    signUp: async (email, password) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { data, error };
    },
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    },
    signOut: async () => {
      // Add timeout to prevent hanging
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign out timeout')), 5000)
      );
      
      try {
        const { error } = await Promise.race([signOutPromise, timeoutPromise]);
        setUser(null); // Immediately clear user state on sign out
        setUserProfile(null);
        return { error };
      } catch (timeoutError) {
        // Force state update even if Supabase sign out fails
        setUser(null);
        setUserProfile(null);
        return { error: timeoutError };
      }
    },
    // Profile-related methods
    updateProfile: async (updates) => {
      if (!user) return { data: null, error: { message: 'No user logged in' } };
      const { data, error } = await profile.updateProfile(user.id, updates);
      if (!error && data) {
        setUserProfile(data[0]);
      }
      return { data, error };
    },
    updateTopArtists: async (artists) => {
      if (!user) return { data: null, error: { message: 'No user logged in' } };
      const { data, error } = await profile.updateTopArtists(user.id, artists);
      if (!error && data) {
        setUserProfile(data[0]);
      }
      return { data, error };
    },
    updateTopSongs: async (songs) => {
      if (!user) return { data: null, error: { message: 'No user logged in' } };
      const { data, error } = await profile.updateTopSongs(user.id, songs);
      if (!error && data) {
        setUserProfile(data[0]);
      }
      return { data, error };
    },
    addFriend: async (friendEmail) => {
      if (!user) return { data: null, error: { message: 'No user logged in' } };
      const { data, error } = await profile.addFriend(user.id, friendEmail);
      if (!error) {
        // Refresh user profile
        const { data: updatedProfile } = await profile.getProfile(user.id);
        setUserProfile(updatedProfile);
      }
      return { data, error };
    },
    removeFriend: async (friendId) => {
      if (!user) return { data: null, error: { message: 'No user logged in' } };
      const { data, error } = await profile.removeFriend(user.id, friendId);
      if (!error) {
        // Refresh user profile
        const { data: updatedProfile } = await profile.getProfile(user.id);
        setUserProfile(updatedProfile);
      }
      return { data, error };
    },
    getFriends: async () => {
      if (!user) return { data: [], error: { message: 'No user logged in' } };
      return await profile.getFriends(user.id);
    },
    searchUserByEmail: async (email) => {
      return await profile.searchUserByEmail(email);
    },
    refreshProfile: async () => {
      if (!user) return { data: null, error: { message: 'No user logged in' } };
      const { data, error } = await profile.getProfile(user.id);
      if (!error && data) {
        setUserProfile(data);
      }
      return { data, error };
    },
    acceptFriendRequest: async (requestId) => {
      return await profile.acceptFriendRequest(requestId);
    },
    rejectFriendRequest: async (requestId) => {
      return await profile.rejectFriendRequest(requestId);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default useAuth;