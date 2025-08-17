export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: "low" | "medium" | "high"
  category?: string
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  reminder?: Reminder
}

export interface Reminder {
  id: string
  todoId: string
  reminderTime: Date
  isActive: boolean
  snoozedUntil?: Date
  snoozeCount: number
  notificationSent: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  color: string
  createdAt: Date
}

export interface AppSettings {
  id: string
  theme: "light" | "dark" | "system"
  notificationsEnabled: boolean
  defaultReminderMinutes: number
  soundEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export type TodoFilter = "all" | "active" | "completed" | "today" | "overdue"
export type TodoSort = "created" | "updated" | "priority" | "dueDate" | "title" | 'alphabetical'
