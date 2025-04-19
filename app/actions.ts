"use server"

import { createServerSupabaseClient } from "@/lib/supabase/client"

export async function someServerAction(formData: FormData) {
  const supabase = createServerSupabaseClient()

  // ... use supabase for server-side operations
}

