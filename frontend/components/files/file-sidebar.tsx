"use client"

import type React from "react"

import { FileText, Image, Video, Mic, Database, Grid } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FileCategory } from "@/types/files"
import Link from "next/link"

interface FileSidebarProps {
  selectedCategory: FileCategory
  onSelectCategory: (category: FileCategory) => void
  stats: {
    used: number
    total: number
    items: number
    maxItems: number
  }
}

const categories: { id: FileCategory; icon: React.ComponentType<any>; label: string }[] = [
  { id: "全部文件", icon: Grid, label: "全部文件" },
  { id: "文档", icon: FileText, label: "文档" },
  { id: "图片", icon: Image, label: "图片" },
  { id: "语音", icon: Mic, label: "语音" },
  { id: "视频", icon: Video, label: "视频" },
  { id: "知识库", icon: Database, label: "知识库" },
]

export function FileSidebar({ selectedCategory, onSelectCategory, stats }: FileSidebarProps) {
  return (
    <div className="w-60 border-r flex flex-col h-full">
      <div className="p-4">
        <h1 className="text-xl font-semibold">文件</h1>
        <p className="text-sm text-gray-500">管理你的文件与知识库</p>
      </div>

      <div className="flex-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100",
              selectedCategory === category.id && "bg-gray-100",
            )}
          >
            <category.icon className="w-4 h-4" />
            <span className="text-sm">{category.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t space-y-2">
        <div className="flex justify-between text-sm">
          <span>文件用量</span>
          <span>
            {(stats.used / 1024 / 1024).toFixed(1)} MB / {(stats.total / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${(stats.used / stats.total) * 100}%` }} />
        </div>
        <div className="flex justify-between text-sm">
          <span>向量存储</span>
          <span>
            {stats.items} / {stats.maxItems}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${(stats.items / stats.maxItems) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}

