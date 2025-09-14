"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, Smartphone, Laptop, Headphones, Camera, Watch } from "lucide-react"

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

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Electronics: Smartphone,
  Cars: Car,
  Laptops: Laptop,
  Audio: Headphones,
  Cameras: Camera,
  Watches: Watch,
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Categories</h3>

      <div className="space-y-2">
        <Button
          variant={selectedCategory === null ? "default" : "ghost"}
          className={`w-full justify-start ${
            selectedCategory === null ? "bg-gradient-to-r from-primary to-secondary text-white" : "hover:bg-white/5"
          }`}
          onClick={() => onCategoryChange(null)}
        >
          All Products
        </Button>

        {categories.map((category) => {
          const IconComponent = categoryIcons[category.name] || Smartphone
          const isSelected = selectedCategory === category.id

          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "ghost"}
              className={`w-full justify-between ${
                isSelected ? "bg-gradient-to-r from-primary to-secondary text-white" : "hover:bg-white/5"
              }`}
              onClick={() => onCategoryChange(category.id)}
            >
              <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                {category.name}
              </div>
              {category.count && (
                <Badge variant="secondary" className="ml-auto">
                  {category.count}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
