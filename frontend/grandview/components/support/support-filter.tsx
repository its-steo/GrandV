"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Filter, ChevronDown } from "lucide-react"

interface SupportFiltersProps {
  selectedCategory: string
  selectedPriority: string
  onCategoryChange: (category: string) => void
  onPriorityChange: (priority: string) => void
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "technical", label: "Technical" },
  { value: "billing", label: "Billing" },
  { value: "general", label: "General" },
  { value: "feature", label: "Feature Request" },
]

const priorities = [
  { value: "all", label: "All Priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

export function SupportFilters({
  selectedCategory,
  selectedPriority,
  onCategoryChange,
  onPriorityChange,
}: SupportFiltersProps) {
  const activeFiltersCount = (selectedCategory !== "all" ? 1 : 0) + (selectedPriority !== "all" ? 1 : 0)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filters:</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            {categories.find((c) => c.value === selectedCategory)?.label}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {categories.map((category) => (
            <DropdownMenuItem
              key={category.value}
              onClick={() => onCategoryChange(category.value)}
              className={selectedCategory === category.value ? "bg-accent" : ""}
            >
              {category.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            {priorities.find((p) => p.value === selectedPriority)?.label}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {priorities.map((priority) => (
            <DropdownMenuItem
              key={priority.value}
              onClick={() => onPriorityChange(priority.value)}
              className={selectedPriority === priority.value ? "bg-accent" : ""}
            >
              {priority.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} active
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onCategoryChange("all")
              onPriorityChange("all")
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
