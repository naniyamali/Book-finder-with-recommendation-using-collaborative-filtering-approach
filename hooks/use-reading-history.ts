"use client"

import { trackBookInteraction, type BookInteraction } from "@/lib/actions/reading-history"
import { useCallback } from "react"

/**
 * Hook to track book interactions
 */
export function useReadingHistory() {
  const trackView = useCallback(async (book: Omit<BookInteraction, "action_type">) => {
    return await trackBookInteraction({
      ...book,
      action_type: "viewed",
    })
  }, [])

  const trackSave = useCallback(async (book: Omit<BookInteraction, "action_type">) => {
    return await trackBookInteraction({
      ...book,
      action_type: "saved",
    })
  }, [])

  const trackRead = useCallback(async (book: Omit<BookInteraction, "action_type">) => {
    return await trackBookInteraction({
      ...book,
      action_type: "read",
    })
  }, [])

  return {
    trackView,
    trackSave,
    trackRead,
  }
}
