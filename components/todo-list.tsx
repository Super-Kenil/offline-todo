"use client"

import { useMemo } from "react"
import { TodoItem } from "@/components/todo-item"
import type { Todo, TodoFilter, TodoSort } from "@/lib/types"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface TodoListProps {
  todos: Todo[]
  loading: boolean
  filter: TodoFilter
  sort: TodoSort
}

function sortTodos(todos: Todo[], sort: TodoSort): Todo[] {
  const sorted = [...todos]

  switch (sort) {
    case "priority":
      return sorted.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
    case "dueDate":
      return sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.getTime() - b.dueDate.getTime()
      })
    case "alphabetical":
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case "created":
    default:
      return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }
}

export function TodoList({ todos, loading, filter, sort }: TodoListProps) {
  const filteredTodos = useMemo(() => {
    let filtered = todos

    // Apply filter
    if (filter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

      switch (filter) {
        case "active":
          filtered = todos.filter((todo) => !todo.completed)
          break
        case "completed":
          filtered = todos.filter((todo) => todo.completed)
          break
        case "today":
          filtered = todos.filter(
            (todo) => todo.dueDate && todo.dueDate >= today && todo.dueDate < tomorrow && !todo.completed,
          )
          break
        case "overdue":
          filtered = todos.filter((todo) => todo.dueDate && todo.dueDate < now && !todo.completed)
          break
      }
    }

    return filtered
  }, [todos, filter])

  const sortedTodos = useMemo(() => {
    return sortTodos(filteredTodos, sort)
  }, [filteredTodos, sort])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="font-medium">Loading your tasks...</span>
        </div>
      </div>
    )
  }

  if (sortedTodos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        {filter === "all" ? (
          <>
            <CheckCircle2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No tasks yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Start by adding your first task above. Stay organized and productive!
            </p>
          </>
        ) : (
          <>
            <AlertCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground max-w-sm">
              No tasks match the current filter. Try changing your filter or add new tasks.
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/50">
      {sortedTodos.map((todo, index) => (
        <div key={todo.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
          <TodoItem todo={todo} />
        </div>
      ))}
    </div>
  )
}
