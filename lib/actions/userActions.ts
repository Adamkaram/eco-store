import { createServerSupabaseClient } from "@/lib/supabase/client"
const supabase = createServerSupabaseClient()

export async function logUserAction(userId: string, actionType: string, actionDetails: any) {
  try {
    const { error } = await supabase.rpc("log_user_action", {
      p_user_id: userId,
      p_action_type: actionType,
      p_action_details: actionDetails,
    })

    if (error) {
      console.error("Error logging user action:", error)
    }
  } catch (error) {
    console.error("Error logging user action:", error)
  }
}

export async function getUserActions(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_actions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user actions:", error)
      return []
    }

    return data
  } catch (error) {
    console.error("Error fetching user actions:", error)
    return []
  }
}

