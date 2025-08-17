"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { reminderScheduler } from "@/lib/reminder-scheduler"
import { format, formatDistanceToNow } from "date-fns"
import type { Reminder } from "@/lib/types"
import { Clock, AlarmClockIcon as Snooze, X, Bell } from "lucide-react"

interface ReminderListProps {
  todoId: string
  onReminderChange?: () => void
}

export function ReminderList({ todoId, onReminderChange }: ReminderListProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReminders()
  }, [todoId])

  const loadReminders = async () => {
    try {
      const todoReminders = await reminderScheduler.getRemindersByTodoId(todoId)
      setReminders(todoReminders.filter((r) => r.isActive))
    } catch (error) {
      console.error("Failed to load reminders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSnooze = async (reminderId: string, minutes: number) => {
    try {
      await reminderScheduler.snoozeReminder(reminderId, minutes)
      await loadReminders()
      onReminderChange?.()
    } catch (error) {
      console.error("Failed to snooze reminder:", error)
    }
  }

  const handleCancel = async (reminderId: string) => {
    try {
      await reminderScheduler.cancelReminder(reminderId)
      await loadReminders()
      onReminderChange?.()
    } catch (error) {
      console.error("Failed to cancel reminder:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
      </div>
    )
  }

  if (reminders.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-muted-foreground">Active Reminders</span>
      </div>

      {reminders.map((reminder) => {
        const reminderTime = new Date(reminder.reminderTime)
        const snoozedUntil = reminder.snoozedUntil ? new Date(reminder.snoozedUntil) : null
        const effectiveTime = snoozedUntil || reminderTime
        const isPast = effectiveTime < new Date()

        return (
          <Card key={reminder.id} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{format(effectiveTime, "PPP 'at' p")}</span>
                    {isPast && !reminder.notificationSent && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                    {reminder.notificationSent && (
                      <Badge variant="secondary" className="text-xs">
                        Sent
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {snoozedUntil ? (
                      <>Snoozed until {formatDistanceToNow(snoozedUntil, { addSuffix: true })}</>
                    ) : (
                      <>Set for {formatDistanceToNow(reminderTime, { addSuffix: true })}</>
                    )}
                    {reminder.snoozeCount > 0 && (
                      <span className="ml-2">
                        • Snoozed {reminder.snoozeCount} time{reminder.snoozeCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {!reminder.notificationSent && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSnooze(reminder.id, 15)}
                        className="h-8 w-8 p-0"
                        title="Snooze 15 minutes"
                      >
                        <Snooze className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSnooze(reminder.id, 60)}
                        className="h-8 w-8 p-0"
                        title="Snooze 1 hour"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancel(reminder.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Cancel reminder"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
