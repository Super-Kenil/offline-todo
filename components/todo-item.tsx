"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ReminderDialog } from "@/components/reminder-dialog"
import { ReminderList } from "@/components/reminder-list"
import { useTodos } from "@/hooks/use-todos"
import { format, isToday, isPast, isTomorrow } from "date-fns"
import { cn } from "@/lib/utils"
import type { Todo } from "@/lib/types"
import { MoreHorizontal, Calendar, Clock, Edit3, Trash2, Bell, AlertTriangle, CheckCircle2 } from "lucide-react"

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const { updateTodo, deleteTodo, toggleTodo } = useTodos()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [showReminders, setShowReminders] = useState(false)

  const handleToggle = async () => {
    await toggleTodo(todo.id)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteTodo(todo.id)
    } catch (error) {
      console.error("Failed to delete todo:", error)
      setIsDeleting(false)
    }
  }

  const getPriorityColor = (priority: Todo["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30"
    }
  }

  const getDueDateStatus = () => {
    if (!todo.dueDate) return null

    const dueDate = new Date(todo.dueDate)
    if (isPast(dueDate) && !todo.completed) {
      return { label: "Overdue", color: "text-red-600 dark:text-red-400", icon: AlertTriangle }
    }
    if (isToday(dueDate)) {
      return { label: "Today", color: "text-primary", icon: Clock }
    }
    if (isTomorrow(dueDate)) {
      return { label: "Tomorrow", color: "text-blue-600 dark:text-blue-400", icon: Calendar }
    }
    return { label: format(dueDate, "MMM d"), color: "text-muted-foreground", icon: Calendar }
  }

  const dueDateStatus = getDueDateStatus()

  return (
    <>
      <div
        className={cn(
          "flex items-start gap-4 p-6 hover:bg-muted/30 transition-colors group",
          todo.completed && "opacity-60",
          isDeleting && "opacity-50 pointer-events-none",
        )}
      >
        {/* Checkbox */}
        <div className="flex items-center pt-1">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggle}
            className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "text-lg font-bold leading-tight",
                  todo.completed && "line-through text-muted-foreground",
                )}
              >
                {todo.title}
              </h3>
              {todo.description && (
                <p
                  className={cn("text-sm text-muted-foreground mt-1 leading-relaxed", todo.completed && "line-through")}
                >
                  {todo.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowReminderDialog(true)}>
                  <Bell className="h-4 w-4 mr-2" />
                  Add Reminder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowReminders(!showReminders)}>
                  <Clock className="h-4 w-4 mr-2" />
                  {showReminders ? "Hide" : "Show"} Reminders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Meta information */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Priority Badge */}
            <Badge variant="outline" className={cn("text-xs font-semibold", getPriorityColor(todo.priority))}>
              {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
            </Badge>

            {/* Due Date */}
            {dueDateStatus && (
              <div className={cn("flex items-center gap-1 text-xs font-medium", dueDateStatus.color)}>
                <dueDateStatus.icon className="h-3 w-3" />
                {dueDateStatus.label}
              </div>
            )}

            {/* Reminder indicator */}
            {todo.reminder && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Bell className="h-3 w-3" />
                Reminder set
              </div>
            )}

            {/* Completion status */}
            {todo.completed && (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </div>
            )}
          </div>

          {/* Reminder List */}
          {showReminders && (
            <div className="mt-4">
              <ReminderList
                todoId={todo.id}
                onReminderChange={() => {
                  // Refresh reminders when changed
                  setShowReminders(false)
                  setTimeout(() => setShowReminders(true), 100)
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Reminder Dialog */}
      <ReminderDialog
        open={showReminderDialog}
        onOpenChange={setShowReminderDialog}
        todoId={todo.id}
        todoTitle={todo.title}
        todoDueDate={todo.dueDate}
      />
    </>
  )
}
