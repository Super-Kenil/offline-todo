"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { Todo } from "@/lib/types"
import { CheckCircle2, Circle, AlertTriangle, TrendingUp } from "lucide-react"

interface TodoStatsProps {
  todos: Todo[]
}

export function TodoStats({ todos }: TodoStatsProps) {
  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter((todo) => todo.completed).length
    const active = total - completed
    const overdue = todos.filter(
      (todo) => todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed,
    ).length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, active, overdue, completionRate }
  }, [todos])

  const statItems = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: Circle,
      color: "text-muted-foreground",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "Active",
      value: stats.active,
      icon: Circle,
      color: "text-primary",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
    },
  ]

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Overview</h3>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Completion Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Completion Rate</span>
            <span className="text-2xl font-black text-primary">{stats.completionRate}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {statItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black text-foreground">{item.value}</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
