"use client"

import { useEffect } from "react"
import { reminderScheduler } from "@/lib/reminder-scheduler"

export function useReminderScheduler() {
  useEffect(() => {
    // Initialize reminder scheduler
    const scheduler = reminderScheduler

    // Cleanup on unmount
    return () => {
      scheduler.destroy()
    }
  }, [])

  return {
    scheduleReminder: reminderScheduler.scheduleReminder.bind(reminderScheduler),
    snoozeReminder: reminderScheduler.snoozeReminder.bind(reminderScheduler),
    cancelReminder: reminderScheduler.cancelReminder.bind(reminderScheduler),
    getRemindersByTodoId: reminderScheduler.getRemindersByTodoId.bind(reminderScheduler),
  }
}
