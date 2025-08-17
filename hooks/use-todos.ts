"use client"

import { useState, useEffect, useCallback } from "react"
import { db } from "@/lib/database"
import type { Todo, TodoFilter, TodoSort } from "@/lib/types"

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true)
      const allTodos = await db.getTodos()
      setTodos(allTodos)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load todos")
    } finally {
      setLoading(false)
    }
  }, [])

  const createTodo = useCallback(async (todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newTodo = await db.createTodo(todoData)
      setTodos((prev) => [newTodo, ...prev])
      return newTodo
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create todo")
      throw err
    }
  }, [])

  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    try {
      const updatedTodo = await db.updateTodo(id, updates)
      setTodos((prev) => prev.map((todo) => (todo.id === id ? updatedTodo : todo)))
      return updatedTodo
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todo")
      throw err
    }
  }, [])

  const deleteTodo = useCallback(async (id: string) => {
    try {
      await db.deleteTodo(id)
      setTodos((prev) => prev.filter((todo) => todo.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo")
      throw err
    }
  }, [])

  const toggleTodo = useCallback(
    async (id: string) => {
      const todo = todos.find((t) => t.id === id)
      if (todo) {
        await updateTodo(id, { completed: !todo.completed })
      }
    },
    [todos, updateTodo],
  )

  const filterTodos = useCallback(async (filter: TodoFilter) => {
    try {
      const filteredTodos = await db.getTodosByFilter(filter)
      return filteredTodos
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter todos")
      return []
    }
  }, [])

  const sortTodos = useCallback((todos: Todo[], sortBy: TodoSort) => {
    return [...todos].sort((a, b) => {
      switch (sortBy) {
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })
  }, [])

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  return {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    filterTodos,
    sortTodos,
    refetch: loadTodos,
  }
}
