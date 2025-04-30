
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Import the client from the integration
const supabaseUrl = "https://hvgydcelsxkfxyttibqs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2Z3lkY2Vsc3hrZnh5dHRpYnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NTc4NDUsImV4cCI6MjA2MTEzMzg0NX0.ii7ABrlRi8TEgq2NA_s4O0wDZf59QDhV7GjbUSdu1F4";
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Auth helpers
export async function signUp(email: string, password: string, userData: { username: string, avatar: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    }
  });
  
  return { data, error };
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  return supabase.auth.getUser();
}

export async function getSession() {
  return supabase.auth.getSession();
}
