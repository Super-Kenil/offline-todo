"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TodoFilter, TodoSort } from "@/lib/types"
import { List, CheckCircle2, Circle, Calendar, AlertTriangle, ArrowUpDown } from "lucide-react"

interface TodoFiltersProps {
  currentFilter: TodoFilter
  currentSort: TodoSort
  onFilterChange: (filter: TodoFilter) => void
  onSortChange: (sort: TodoSort) => void
}

const filterOptions = [
  { value: "all" as const, label: "All Tasks", icon: List },
  { value: "active" as const, label: "Active", icon: Circle },
  { value: "completed" as const, label: "Completed", icon: CheckCircle2 },
  { value: "today" as const, label: "Due Today", icon: Calendar },
  { value: "overdue" as const, label: "Overdue", icon: AlertTriangle },
]

const sortOptions = [
  { value: "created" as const, label: "Date Created" },
  { value: "updated" as const, label: "Last Updated" },
  { value: "priority" as const, label: "Priority" },
  { value: "dueDate" as const, label: "Due Date" },
  { value: "title" as const, label: "Title" },
]

export function TodoFilters({ currentFilter, currentSort, onFilterChange, onSortChange }: TodoFiltersProps) {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Filter & Sort</h3>
        <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Filter Buttons */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Filter by</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {filterOptions.map((option) => {
            const Icon = option.icon
            return (
              <Button
                key={option.value}
                variant={currentFilter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange(option.value)}
                className={`justify-start gap-2 h-9 ${
                  currentFilter === option.value
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md"
                    : "bg-background/50 border-border/50 hover:bg-muted/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{option.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Sort Dropdown */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Sort by</p>
        <Select value={currentSort} onValueChange={(value: TodoSort) => onSortChange(value)}>
          <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
