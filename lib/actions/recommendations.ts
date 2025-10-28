"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface BookSequence {
  book_id: string
  book_title: string
  book_author?: string
  book_cover_url?: string
  next_book_id: string
  next_book_title: string
  next_book_author?: string
  next_book_cover_url?: string
  count: number
}

/**
 * Generate recommendations for a user based on collaborative filtering
 * Logic: If User A viewed Book 1 then Book 2, and User B viewed Book 1,
 * recommend Book 2 to User B
 */
export async function generateRecommendations() {
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

    // Get user's viewed books
    const { data: userHistory, error: historyError } = await supabase
      .from("reading_history")
      .select("book_id, created_at")
      .eq("user_id", user.id)
      .eq("action_type", "viewed")
      .order("created_at", { ascending: false })

    if (historyError || !userHistory || userHistory.length === 0) {
      return { success: true, message: "No reading history found" }
    }

    const userBookIds = userHistory.map((h) => h.book_id)

    // Find book sequences from other users
    // Get all users who viewed the same books
    const { data: similarUsers, error: similarUsersError } = await supabase
      .from("reading_history")
      .select("user_id, book_id, created_at")
      .in("book_id", userBookIds)
      .neq("user_id", user.id)
      .eq("action_type", "viewed")
      .order("created_at", { ascending: true })

    if (similarUsersError || !similarUsers || similarUsers.length === 0) {
      return { success: true, message: "No similar users found" }
    }

    // Group by user and find sequences
    const userSequences = new Map<string, Array<{ book_id: string; created_at: string }>>()

    similarUsers.forEach((record) => {
      if (!userSequences.has(record.user_id)) {
        userSequences.set(record.user_id, [])
      }
      userSequences.get(record.user_id)!.push({
        book_id: record.book_id,
        created_at: record.created_at,
      })
    })

    // Find book sequences (what book was viewed after each book)
    const bookSequences = new Map<string, Map<string, number>>()

    userSequences.forEach((history) => {
      for (let i = 0; i < history.length - 1; i++) {
        const currentBook = history[i].book_id
        const nextBook = history[i + 1].book_id

        // Only consider sequences where current book is in user's history
        if (userBookIds.includes(currentBook) && !userBookIds.includes(nextBook)) {
          if (!bookSequences.has(currentBook)) {
            bookSequences.set(currentBook, new Map())
          }
          const nextBooks = bookSequences.get(currentBook)!
          nextBooks.set(nextBook, (nextBooks.get(nextBook) || 0) + 1)
        }
      }
    })

    // Convert to recommendations with scores
    const recommendations: Array<{ book_id: string; score: number }> = []

    bookSequences.forEach((nextBooks) => {
      nextBooks.forEach((count, bookId) => {
        const existing = recommendations.find((r) => r.book_id === bookId)
        if (existing) {
          existing.score += count
        } else {
          recommendations.push({ book_id: bookId, score: count })
        }
      })
    })

    // Sort by score and take top recommendations
    recommendations.sort((a, b) => b.score - a.score)
    const topRecommendations = recommendations.slice(0, 10)

    if (topRecommendations.length === 0) {
      return { success: true, message: "No recommendations generated" }
    }

    // Get book details for recommendations
    const { data: bookDetails, error: bookDetailsError } = await supabase
      .from("reading_history")
      .select("book_id, book_title, book_author, book_cover_url")
      .in(
        "book_id",
        topRecommendations.map((r) => r.book_id),
      )
      .limit(1)

    if (bookDetailsError) {
      console.error("[v0] Error fetching book details:", bookDetailsError)
    }

    // Create a map of book details
    const bookDetailsMap = new Map<string, any>()
    bookDetails?.forEach((book) => {
      if (!bookDetailsMap.has(book.book_id)) {
        bookDetailsMap.set(book.book_id, book)
      }
    })

    // Delete existing recommendations for this user
    await supabase.from("recommendations").delete().eq("user_id", user.id)

    // Insert new recommendations
    const recommendationsToInsert = topRecommendations
      .map((rec) => {
        const details = bookDetailsMap.get(rec.book_id)
        if (!details) return null

        return {
          user_id: user.id,
          recommended_book_id: rec.book_id,
          recommended_book_title: details.book_title,
          recommended_book_author: details.book_author,
          recommended_book_cover_url: details.book_cover_url,
          score: rec.score,
          reason: `${rec.score} users with similar reading patterns viewed this book`,
        }
      })
      .filter((r) => r !== null)

    if (recommendationsToInsert.length > 0) {
      const { error: insertError } = await supabase.from("recommendations").insert(recommendationsToInsert)

      if (insertError) {
        console.error("[v0] Error inserting recommendations:", insertError)
        return { success: false, error: insertError.message }
      }
    }

    revalidatePath("/")
    return {
      success: true,
      message: `Generated ${recommendationsToInsert.length} recommendations`,
      count: recommendationsToInsert.length,
    }
  } catch (error) {
    console.error("[v0] Unexpected error in generateRecommendations:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Get recommendations for current user
 */
export async function getRecommendations() {
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
      .from("recommendations")
      .select("*")
      .eq("user_id", user.id)
      .order("score", { ascending: false })
      .limit(10)

    if (error) {
      console.error("[v0] Error fetching recommendations:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("[v0] Unexpected error in getRecommendations:", error)
    return { success: false, error: "An unexpected error occurred", data: [] }
  }
}

/**
 * Trigger recommendation generation after user views a book
 * This can be called periodically or after certain actions
 */
export async function triggerRecommendationUpdate() {
  try {
    const result = await generateRecommendations()
    return result
  } catch (error) {
    console.error("[v0] Error triggering recommendation update:", error)
    return { success: false, error: "Failed to update recommendations" }
  }
}
