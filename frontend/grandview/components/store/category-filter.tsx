"use client"

import { Button } from "@/components/ui/button"

interface Category {
  id: number
  name: string
  count?: number
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: number | null
  onCategoryChange: (categoryId: number | null) => void
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Categories</h3>
      <div className="space-y-2">
        <Button
          variant={selectedCategory === null ? "default" : "ghost"}
          size="sm"
          onClick={() => onCategoryChange(null)}
          className={`w-full justify-start text-xs ${
            selectedCategory === null ? "bg-gradient-to-r from-primary to-secondary" : "glass hover:bg-white/10"
          }`}
        >
          All Products
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className={`w-full justify-start text-xs ${
              selectedCategory === category.id
                ? "bg-gradient-to-r from-primary to-secondary"
                : "glass hover:bg-white/10"
            }`}
          >
            {category.name}
            {category.count && <span className="ml-auto text-xs opacity-60">{category.count}</span>}
          </Button>
        ))}
      </div>
    </div>
  )
}
