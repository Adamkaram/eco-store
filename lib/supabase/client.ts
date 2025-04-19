import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

let supabase: ReturnType<typeof createClient<Database>> | null = null

export const getSupabaseClient = () => {
  if (!supabase) {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== "undefined", // Only persist session on client-side
        storageKey: "glow-beauty-auth-token",
      },
    })
  }
  return supabase
}

// For server-side operations, always create a new client
export const createServerSupabaseClient = () =>
  createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })

