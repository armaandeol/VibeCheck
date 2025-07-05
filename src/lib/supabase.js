import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

// Create a mock supabase client if environment variables are missing
const createMockClient = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      signInWithPassword: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      signInWithOAuth: async () => ({ data: null, error: { message: "Supabase not configured" } }),
      signOut: async () => ({ error: null }),
    },
  };
};

// Use mock client if environment variables are missing
export const supabase = supabaseUrl === "https://placeholder.supabase.co" 
  ? createMockClient() 
  : createClient(supabaseUrl, supabaseKey);
