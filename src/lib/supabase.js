import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase configuration env variables: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY must be defined in your environment.");
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Auth helpers
export const signUp = (email, password, metadata) => supabase.auth.signUp({ email, password, options: { data: metadata } })
export const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
export const signOut = () => supabase.auth.signOut()
export const getUser = () => supabase.auth.getUser()
export const getSession = () => supabase.auth.getSession()

// Realtime helpers
export const subscribeToTable = (table, callback) => {
  return supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe()
}
