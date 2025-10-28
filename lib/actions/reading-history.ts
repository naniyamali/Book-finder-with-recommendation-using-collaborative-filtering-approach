"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface BookInteraction {
  book_id: string
  book_title: string
  book_author?: string
  book_cover_url?: string
  action_type: "viewed" | "saved" | "read"
}

/**
 * Track a book interaction (view, save, or read)
 */
export async function trackBookInteraction(interaction: BookInteraction) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    // Insert or update reading history
    const { error } = await supabase.from("reading_history").upsert(
      {
        user_id: user.id,
        book_id: interaction.book_id,
        book_title: interaction.book_title,
        book_author: interaction.book_author,
        book_cover_url: interaction.book_cover_url,
        action_type: interaction.action_type,
      },
      {
        onConflict: "user_id,book_id,action_type",
      },
    )

    if (error) {
      console.error("[v0] Error tracking book interaction:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("[v0] Unexpected error in trackBookInteraction:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Get user's reading history
 */
export async function getReadingHistory(limit = 50) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "User not authenticated", data: [] }
    }

    const { data, error } = await supabase
      .from("reading_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[v0] Error fetching reading history:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("[v0] Unexpected error in getReadingHistory:", error)
    return { success: false, error: "An unexpected error occurred", data: [] }
  }
}

/**
 * Get books viewed by user
 */
export async function getViewedBooks(limit = 20) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "User not authenticated", data: [] }
    }

    const { data, error } = await supabase
      .from("reading_history")
      .select("*")
      .eq("user_id", user.id)
      .eq("action_type", "viewed")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred", data: [] }
  }
}

/**
 * Get saved books
 */
export async function getSavedBooks() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "User not authenticated", data: [] }
    }

    const { data, error } = await supabase
      .from("reading_history")
      .select("*")
      .eq("user_id", user.id)
      .eq("action_type", "saved")
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred", data: [] }
  }
}

/**
 * Remove a book from reading history
 */
export async function removeFromHistory(bookId: string, actionType: "viewed" | "saved" | "read") {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    const { error } = await supabase
      .from("reading_history")
      .delete()
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .eq("action_type", actionType)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}
