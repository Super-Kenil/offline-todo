"use client"

import { db } from "@/lib/database"
import { notificationManager } from "@/lib/notifications"
import type { Reminder } from "@/lib/types"

const scheduledReminders = new Map<string, number>()
let checkInterval: number | null = null

async function triggerReminder(reminder: Reminder) {
  try {
    const todo = await db.getTodoById(reminder.todoId)
    if (!todo || todo.completed) {
      await db.updateReminder(reminder.id, { isActive: false })
      return
    }

    await notificationManager.showReminderNotification(todo.title, todo.id)
    await db.updateReminder(reminder.id, { notificationSent: true })
    console.log(`Reminder triggered for todo: ${todo.title}`)
  } catch (error) {
    console.error("Error triggering reminder:", error)
  }
}

async function checkDueReminders() {
  try {
    const activeReminders = await db.getActiveReminders()
    const now = new Date()

    console.log("[v0] Checking due reminders, found:", activeReminders.length)

    for (const reminder of activeReminders) {
      const reminderTime = new Date(reminder.reminderTime)
      const snoozedUntil = reminder.snoozedUntil
        ? new Date(reminder.snoozedUntil)
        : null

      const effectiveTime =
        snoozedUntil && snoozedUntil > now ? snoozedUntil : reminderTime

      if (effectiveTime <= now && !reminder.notificationSent) {
        console.log("[v0] Triggering reminder for:", reminder.id)
        await triggerReminder(reminder)
      }
    }
  } catch (error) {
    console.error("Error checking due reminders:", error)
  }
}

function startBackgroundCheck() {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
  checkInterval = typeof window !== "undefined" ? window.setInterval(() => {
    checkDueReminders()
  }, 30000) : null
}

async function scheduleReminder(
  todoId: string,
  reminderTime: Date,
): Promise<Reminder> {
  const reminder = await db.createReminder({
    todoId,
    reminderTime,
    isActive: true,
    snoozedUntil: undefined,
    snoozeCount: 0,
    notificationSent: false,
  })

  const now = new Date()
  const timeUntilReminder = reminderTime.getTime() - now.getTime()

  if (timeUntilReminder > 0 && timeUntilReminder <= 60000) {
    const timeoutId = window.setTimeout(() => {
      triggerReminder(reminder)
    }, timeUntilReminder)
    scheduledReminders.set(reminder.id, timeoutId)
  }

  return reminder
}

async function snoozeReminder(reminderId: string, minutes = 15): Promise<void> {
  const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000)
  const reminder = (await db.getActiveReminders()).find((r) => r.id === reminderId)

  await db.updateReminder(reminderId, {
    snoozedUntil,
    snoozeCount: (reminder?.snoozeCount || 0) + 1,
    notificationSent: false,
  })

  const timeoutId = scheduledReminders.get(reminderId)
  if (timeoutId) {
    clearTimeout(timeoutId)
    scheduledReminders.delete(reminderId)
  }

  console.log(`Reminder snoozed for ${minutes} minutes`)
}

async function cancelReminder(reminderId: string): Promise<void> {
  await db.updateReminder(reminderId, { isActive: false })

  const timeoutId = scheduledReminders.get(reminderId)
  if (timeoutId) {
    clearTimeout(timeoutId)
    scheduledReminders.delete(reminderId)
  }
}

async function getRemindersByTodoId(todoId: string): Promise<Reminder[]> {
  return db.getRemindersByTodoId(todoId)
}

function destroy() {
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }

  for (const timeoutId of scheduledReminders.values()) {
    clearTimeout(timeoutId)
  }
  scheduledReminders.clear()
}

export const reminderScheduler = {
  scheduleReminder,
  snoozeReminder,
  cancelReminder,
  getRemindersByTodoId,
  destroy,
  checkDueReminders,
}

startBackgroundCheck()

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      reminderScheduler.checkDueReminders()
    }
  })
}
