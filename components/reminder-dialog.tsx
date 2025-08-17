"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { reminderScheduler } from "@/lib/reminder-scheduler"
import { format, addMinutes, addHours, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon, Clock, Bell } from "lucide-react"

interface ReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  todoId: string
  todoTitle: string
  todoDueDate?: Date
}

const quickReminderOptions = [
  { label: "15 minutes", value: () => addMinutes(new Date(), 15) },
  { label: "30 minutes", value: () => addMinutes(new Date(), 30) },
  { label: "1 hour", value: () => addHours(new Date(), 1) },
  { label: "2 hours", value: () => addHours(new Date(), 2) },
  {
    label: "Tomorrow 9 AM",
    value: () => {
      const tomorrow = addDays(new Date(), 1)
      tomorrow.setHours(9, 0, 0, 0)
      return tomorrow
    },
  },
]

export function ReminderDialog({ open, onOpenChange, todoId, todoTitle, todoDueDate }: ReminderDialogProps) {
  const [reminderDate, setReminderDate] = useState<Date>()
  const [reminderTime, setReminderTime] = useState("09:00")
  const [isCreating, setIsCreating] = useState(false)

  const handleQuickReminder = async (getReminderTime: () => Date) => {
    setIsCreating(true)
    try {
      const reminderTime = getReminderTime()
      await reminderScheduler.scheduleReminder(todoId, reminderTime)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create reminder:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCustomReminder = async () => {
    if (!reminderDate) return

    setIsCreating(true)
    try {
      const [hours, minutes] = reminderTime.split(":").map(Number)
      const reminderDateTime = new Date(reminderDate)
      reminderDateTime.setHours(hours, minutes, 0, 0)

      await reminderScheduler.scheduleReminder(todoId, reminderDateTime)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create reminder:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDueDateReminder = async () => {
    if (!todoDueDate) return

    setIsCreating(true)
    try {
      // Set reminder 15 minutes before due date
      const reminderTime = addMinutes(new Date(todoDueDate), -15)
      await reminderScheduler.scheduleReminder(todoId, reminderTime)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create reminder:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Set Reminder
          </DialogTitle>
          <DialogDescription>Set a reminder for "{todoTitle}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Options */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quick Options</Label>
            <div className="grid grid-cols-2 gap-2">
              {quickReminderOptions.map((option) => (
                <Button
                  key={option.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReminder(option.value)}
                  disabled={isCreating}
                  className="justify-start bg-transparent"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Due Date Reminder */}
          {todoDueDate && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Due Date Reminder
              </Label>
              <Button
                variant="outline"
                onClick={handleDueDateReminder}
                disabled={isCreating}
                className="w-full justify-start bg-transparent"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                15 minutes before due date ({format(todoDueDate, "PPP")})
              </Button>
            </div>
          )}

          {/* Custom Date & Time */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Custom Date & Time
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-transparent",
                        !reminderDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {reminderDate ? format(reminderDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={reminderDate}
                      onSelect={setReminderDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCustomReminder}
            disabled={!reminderDate || isCreating}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            {isCreating ? "Creating..." : "Set Reminder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
