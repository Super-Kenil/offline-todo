"use client"

import { useState, useEffect, useCallback } from "react"
import { db } from "@/lib/database"
import type { Reminder } from "@/lib/types"

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadActiveReminders = useCallback(async () => {
    try {
      setLoading(true)
      const activeReminders = await db.getActiveReminders()
      setReminders(activeReminders)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reminders")
    } finally {
      setLoading(false)
    }
  }, [])

  const createReminder = useCallback(async (reminderData: Omit<Reminder, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newReminder = await db.createReminder(reminderData)
      setReminders((prev) => [...prev, newReminder])
      return newReminder
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create reminder")
      throw err
    }
  }, [])

  const updateReminder = useCallback(async (id: string, updates: Partial<Reminder>) => {
    try {
      const updatedReminder = await db.updateReminder(id, updates)
      setReminders((prev) => prev.map((reminder) => (reminder.id === id ? updatedReminder : reminder)))
      return updatedReminder
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update reminder")
      throw err
    }
  }, [])

  const snoozeReminder = useCallback(
    async (id: string, minutes = 15) => {
      const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000)
      const reminder = reminders.find((r) => r.id === id)

      if (reminder) {
        await updateReminder(id, {
          snoozedUntil,
          snoozeCount: reminder.snoozeCount + 1,
          notificationSent: false,
        })
      }
    },
    [reminders, updateReminder],
  )

  const deleteReminder = useCallback(async (id: string) => {
    try {
      await db.deleteReminder(id)
      setReminders((prev) => prev.filter((reminder) => reminder.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete reminder")
      throw err
    }
  }, [])

  useEffect(() => {
    loadActiveReminders()
  }, [loadActiveReminders])

  return {
    reminders,
    loading,
    error,
    createReminder,
    updateReminder,
    snoozeReminder,
    deleteReminder,
    refetch: loadActiveReminders,
  }
}
