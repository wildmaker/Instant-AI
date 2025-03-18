"use client"

import { useState } from "react"
import { Search, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// 定义侧边栏宽度常量，与主侧边栏保持一致
const TOPIC_SIDEBAR_WIDTH = "280px";

interface Topic {
  id: string
  title: string
  isActive?: boolean
  date?: string
}

interface TopicSidebarProps {
  className?: string;
}

export function TopicSidebar({ className }: TopicSidebarProps) {
  const [topics, setTopics] = useState<Topic[]>([
    {
      id: "1",
      title: "默认话题",
      isActive: true,
      date: "临时",
    },
    {
      id: "2",
      title: "支持多种 AI 服务提供商",
      date: "今天",
    },
  ])

  return (
    <div className={cn("flex flex-col h-screen w-[280px] border-l", className)}>
      <div className="p-4 flex items-center justify-between border-b">
        <h2 className="font-medium">话题</h2>
        <div className="flex items-center">
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <span className="sr-only">More</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </Button>
        </div>
      </div>

      <div className="p-4">
        <button className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
          <div className="flex items-center">
            <span className="mr-2">📝</span>
            <span>默认话题</span>
          </div>
          <span className="text-xs text-gray-500">临时</span>
        </button>
      </div>

      <div className="px-4 py-2">
        <h3 className="text-xs text-gray-500 mb-2">今天</h3>

        <button className="w-full flex items-center p-2 rounded-md hover:bg-gray-100">
          <Star className="h-4 w-4 mr-2" />
          <span>支持多种 AI 服务提供商</span>
        </button>
      </div>
    </div>
  )
}

