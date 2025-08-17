"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ReminderDialog } from "@/components/reminder-dialog"
import { CalendarIcon, Plus, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Todo } from "@/lib/types"

interface AddTodoFormProps {
  onCreateTodo: (todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">) => Promise<Todo>
}

export function AddTodoForm({ onCreateTodo }: AddTodoFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Todo["priority"]>("medium")
  const [dueDate, setDueDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [createdTodoId, setCreatedTodoId] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      const newTodo = await onCreateTodo({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate,
        completed: false,
      })

      setCreatedTodoId(newTodo.id)
      console.log("[v0] Todo created successfully:", newTodo.title)

      setTitle("")
      setDescription("")
      setPriority("medium")
      setDueDate(undefined)
    } catch (error) {
      console.error("Failed to create todo:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddReminder = () => {
    if (createdTodoId) {
      setShowReminderDialog(true)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">Add New Task</h3>
          <p className="text-sm text-muted-foreground">Create a new task to stay organized</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold h-12 bg-background/50 border-border/50 focus:border-primary"
              required
            />
          </div>

          <div className="md:col-span-2">
            <Textarea
              placeholder="Add a description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] bg-background/50 border-border/50 focus:border-primary resize-none"
            />
          </div>

          <div>
            <Select value={priority} onValueChange={(value: Todo["priority"]) => setPriority(value)}>
              <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    Low Priority
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    Medium Priority
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    High Priority
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background/50 border-border/50 focus:border-primary",
                    !dueDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Set due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="flex-1 h-12 text-base font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            {isSubmitting ? "Adding..." : "Add Task"}
          </Button>
          {createdTodoId && (
            <Button
              type="button"
              variant="outline"
              className="h-12 px-4 bg-background/50 border-border/50"
              onClick={handleAddReminder}
            >
              <Clock className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>

      <ReminderDialog
        open={showReminderDialog}
        onOpenChange={setShowReminderDialog}
        todoId={createdTodoId}
        todoTitle={title}
        todoDueDate={dueDate}
      />
    </>
  )
}
