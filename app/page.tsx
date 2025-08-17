"use client"

import { useState } from "react"
import { TodoList } from "@/components/todo-list"
import { AddTodoForm } from "@/components/add-todo-form"
import { TodoFilters } from "@/components/todo-filters"
import { TodoStats } from "@/components/todo-stats"
import { NotificationCenter } from "@/components/notification-center"
import { PWAInstaller } from "@/components/pwa-installer"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTodos } from "@/hooks/use-todos"
import { useReminderScheduler } from "@/hooks/use-reminder-scheduler"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TodoFilter, TodoSort } from "@/lib/types"
import { CheckSquare, Bell, List } from "lucide-react"

export default function HomePage() {
  const { todos, loading, error, createTodo } = useTodos()
  useReminderScheduler()
  const [filter, setFilter] = useState<TodoFilter>("all")
  const [sort, setSort] = useState<TodoSort>("created")

  // console.log("[v0] Current todos count:", todos.length)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
              <CheckSquare className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">TaskFlow</h1>
              <p className="text-sm text-muted-foreground font-medium">Local-First Todo App</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="todos" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Stay Organized, Stay Productive
              </h2>
              <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
                Manage your tasks offline with reminders, priorities, and seamless synchronization across all your
                devices.
              </p>
            </div>

            {/* Add Todo Form */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg">
              <AddTodoForm onCreateTodo={createTodo} />
            </div>

            {/* Stats and Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <TodoStats todos={todos} />
              </div>
              <div className="lg:col-span-2">
                <TodoFilters
                  currentFilter={filter}
                  currentSort={sort}
                  onFilterChange={setFilter}
                  onSortChange={setSort}
                />
              </div>
            </div>

            {/* Todo List */}
            <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-lg">
              {error ? (
                <div className="p-8 text-center">
                  <p className="text-destructive font-semibold">Error: {error}</p>
                </div>
              ) : (
                <TodoList todos={todos} loading={loading} filter={filter} sort={sort} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Notification Settings
              </h2>
              <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
                Configure how and when you receive notifications for your task reminders.
              </p>
            </div>

            <NotificationCenter />
          </TabsContent>
        </Tabs>
      </main>

      {/* PWA Installer */}
      <PWAInstaller />
    </div>
  )
}
