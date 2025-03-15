"use client"

import { useState } from "react"
import { Search, Plus, MessageSquare, FolderOpen, Settings, ChevronDown, ArrowUp } from "lucide-react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Assistant {
  id: string
  name: string
  avatar: string
}

export function Sidebar() {
  const [assistants, setAssistants] = useState<Assistant[]>([
    {
      id: "1",
      name: "随便聊聊",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ])

  const pathname = usePathname()
  const router = useRouter()
  // Check if we're in the files page
  const isFilesPage = pathname === "/files"

  // If we're in the files page, we only render the left navigation column
  if (isFilesPage) {
    return (
      <div className="flex flex-col items-center py-4 border-r bg-white w-14 h-screen">
        <Link href="/chat" className={cn("p-2 mb-2 rounded-md hover:bg-gray-100")}>
          <MessageSquare className="h-5 w-5" />
        </Link>
        <Link href="/files" className={cn("p-2 mb-2 rounded-md bg-gray-100")}>
          <FolderOpen className="h-5 w-5" />
        </Link>
        <button className="p-2 mb-2 rounded-md hover:bg-gray-100">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Left navigation column */}
      <div className="flex flex-col items-center py-4 border-r bg-white w-14">
        <Link href="/chat" className={cn(
          "p-2 mb-2 rounded-md bg-gray-100"
        )}>
          <MessageSquare className="h-5 w-5" />
        </Link>
        <Link href="/files" className={cn(
          "p-2 mb-2 rounded-md hover:bg-gray-100"
        )}>
          <FolderOpen className="h-5 w-5" />
        </Link>
        <button className="p-2 mb-2 rounded-md hover:bg-gray-100">
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Main sidebar content */}
      <div className="flex flex-col h-screen w-64 border-r bg-white">
        <div className="p-4 flex items-center">
          <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
            <Image src="/placeholder.svg?height=32&width=32" alt="Logo" width={32} height={32} />
          </div>
          <h1 className="text-xl font-bold">LobeChat</h1>
        </div>

        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索助手..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">⌘ K</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {assistants.map((assistant) => (
            <div key={assistant.id} className="mx-4 my-2 p-4 rounded-lg bg-gray-50 flex items-center cursor-pointer hover:bg-gray-100">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                <Image src={assistant.avatar || "/placeholder.svg"} alt={assistant.name} width={32} height={32} />
              </div>
              <span>{assistant.name}</span>
            </div>
          ))}

          <div className="mx-4 my-2">
            <div className="flex items-center justify-between text-sm text-gray-500 py-2">
              <span>默认列表</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          <div className="mx-4 my-2 p-2">
            <button className="w-full flex items-center justify-center py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50 bg-white shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              <span>新建助手</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t">
          <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
            <div className="flex items-center justify-center">
              <ArrowUp className="h-5 w-5" />
            </div>
            <p className="text-sm text-center mt-2">准备好告别免费计划了吗? 升级以享受高级功能。</p>
            <button className="w-full mt-4 py-2 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-700">查看方案</button>
          </div>
        </div>
      </div>
    </div>
  )
}

