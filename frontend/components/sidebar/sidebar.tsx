"use client"

import { useState } from "react"
import { Search, Plus, MessageSquare, FolderOpen, Settings, ChevronDown, ChevronRight, ArrowUp } from "lucide-react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { CreateKnowledgeModal } from "@/components/files/CreateKnowledgeModal"
import { AnimatePresence, motion } from "framer-motion"

// Define sidebar width constants based on lobe-chat
const SIDEBAR_NAV_WIDTH = "56px";
const SIDEBAR_WIDTH = "280px";

interface Assistant {
  id: string
  name: string
  avatar?: string
  isActive?: boolean
  timestamp?: string
  category?: string
  type?: 'default' | 'knowledge'
  bgColor?: string
  emoji?: string
  listType?: 'shared' | 'owned'
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [activeAssistant, setActiveAssistant] = useState<string>("3") // 默认选中运营知识库
  const [sharedListOpen, setSharedListOpen] = useState<boolean>(true)
  const [ownedListOpen, setOwnedListOpen] = useState<boolean>(true)
  
  const [assistants, setAssistants] = useState<Assistant[]>([
    {
      id: "1",
      name: "研发知识库",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      emoji: "🤖",
      timestamp: "15:23",
      type: "knowledge",
      listType: "shared"
    },
    {
      id: "2",
      name: "销售知识库",
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
      emoji: "🦾",
      timestamp: "15:23",
      type: "knowledge",
      listType: "shared"
    },
    {
      id: "3",
      name: "运营知识库",
      bgColor: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      emoji: "🧠",
      timestamp: "15:22",
      type: "knowledge",
      listType: "shared"
    },
    {
      id: "4",
      name: "自定义助手 副本",
      bgColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      emoji: "💻",
      timestamp: "15:22",
      type: "default",
      listType: "owned"
    },
    {
      id: "5",
      name: "自定义助手",
      bgColor: "bg-gradient-to-br from-amber-500 to-amber-600",
      emoji: "⚙️",
      timestamp: "03:13",
      type: "default",
      listType: "owned"
    },
    {
      id: "6",
      name: "随便聊聊",
      avatar: "/placeholder.svg?height=40&width=40",
      timestamp: "昨天",
      type: "default",
      listType: "owned"
    },
  ])

  const pathname = usePathname()
  const router = useRouter()
  // Check if we're in the files page
  const isFilesPage = pathname === "/files"

  const handleAssistantClick = (id: string) => {
    setActiveAssistant(id)
    // 实际项目中这里可以添加导航逻辑或状态更新
    // router.push(`/chat?assistant=${id}`)
  }

  // Toggle the shared list open/close state
  const toggleSharedList = () => {
    setSharedListOpen(!sharedListOpen)
  }

  // Toggle the owned list open/close state
  const toggleOwnedList = () => {
    setOwnedListOpen(!ownedListOpen)
  }

  // Filter assistants by list type
  const sharedAssistants = assistants.filter(assistant => assistant.listType === 'shared')
  const ownedAssistants = assistants.filter(assistant => assistant.listType === 'owned')

  // Animation variants for list items
  const listVariants = {
    hidden: { 
      opacity: 0,
      height: 0,
      overflow: 'hidden',
      transition: {
        height: { duration: 0.15, ease: "easeInOut" },
        opacity: { duration: 0.1 }
      }
    },
    visible: { 
      opacity: 1,
      height: 'auto',
      transition: { 
        height: { duration: 0.2, ease: "easeOut" },
        opacity: { duration: 0.15 },
        staggerChildren: 0.02
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -3, transition: { duration: 0.1 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.1 } }
  };

  // If we're in the files page, we only render the left navigation column
  if (isFilesPage) {
    return (
      <div className={cn("flex flex-col items-center py-4 border-r bg-gray-50 w-14 h-screen", className)}>
        <Link href="/chat" className={cn("p-2 mb-2 rounded-md hover:bg-gray-200")}>
          <MessageSquare className="h-5 w-5" />
        </Link>
        <Link href="/files" className={cn("p-2 mb-2 rounded-md bg-gray-200")}>
          <FolderOpen className="h-5 w-5" />
        </Link>
        <button className="p-2 mb-2 rounded-md hover:bg-gray-200">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <div className={cn("flex h-screen", className)}>
      {/* Left navigation column */}
      <div className="flex flex-col items-center py-4 border-r bg-gray-50 w-14">
        <Link href="/chat" className={cn("p-2 mb-2 rounded-md bg-gray-200")}>
          <MessageSquare className="h-5 w-5" />
        </Link>
        <Link href="/files" className={cn("p-2 mb-2 rounded-md hover:bg-gray-200")}>
          <FolderOpen className="h-5 w-5" />
        </Link>
        <button className="p-2 mb-2 rounded-md hover:bg-gray-200">
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Main sidebar content */}
      <div className="flex flex-col h-screen w-[280px] border-r">
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
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">⌘ K</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* 共享给我的知识库列表 */}
          <div className="mx-4 my-2">
            <div 
              className="flex items-center justify-between text-sm text-gray-500 py-2 cursor-pointer" 
              onClick={toggleSharedList}
            >
              <span>共享给我的知识库</span>
              <motion.div
                animate={{ rotate: sharedListOpen ? 0 : -90 }}
                transition={{ duration: 0.15 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </div>
          </div>

          {/* 共享给我的知识库助手列表 */}
          <AnimatePresence>
            {sharedListOpen && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={listVariants}
              >
                {sharedAssistants.map((assistant) => (
                  <motion.div 
                    key={assistant.id}
                    variants={itemVariants}
                    className={cn(
                      "mx-4 my-2 p-3 rounded-lg flex items-center cursor-pointer hover:bg-gray-100",
                      activeAssistant === assistant.id ? "bg-gray-100" : "bg-transparent"
                    )}
                    onClick={() => handleAssistantClick(assistant.id)}
                  >
                    {assistant.avatar ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                        <Image src={assistant.avatar} alt={assistant.name} width={32} height={32} />
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-full overflow-hidden mr-3 ${assistant.bgColor || 'bg-gray-200'} flex items-center justify-center text-white text-lg`}>
                        <span>{assistant.emoji || '🤖'}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">{assistant.name}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 我的知识库列表 */}
          <div className="mx-4 my-2 mt-6">
            <div className="flex items-center justify-between text-sm text-gray-500 py-2">
              <div 
                className="flex-1 cursor-pointer" 
                onClick={toggleOwnedList}
              >
                <span>我的知识库</span>
              </div>
              <div className="flex items-center">
                <CreateKnowledgeModal>
                  <button 
                    className="p-1 rounded-md hover:bg-gray-200 mr-1"
                    aria-label="创建知识库"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </CreateKnowledgeModal>
                <motion.div
                  animate={{ rotate: ownedListOpen ? 0 : -90 }}
                  transition={{ duration: 0.15 }}
                  onClick={toggleOwnedList}
                  className="cursor-pointer"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* 我的知识库助手列表 */}
          <AnimatePresence>
            {ownedListOpen && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={listVariants}
              >
                {ownedAssistants.map((assistant) => (
                  <motion.div 
                    key={assistant.id}
                    variants={itemVariants}
                    className={cn(
                      "mx-4 my-2 p-3 rounded-lg flex items-center cursor-pointer hover:bg-gray-100",
                      activeAssistant === assistant.id ? "bg-gray-100" : "bg-transparent"
                    )}
                    onClick={() => handleAssistantClick(assistant.id)}
                  >
                    {assistant.avatar ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                        <Image src={assistant.avatar} alt={assistant.name} width={32} height={32} />
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-full overflow-hidden mr-3 ${assistant.bgColor || 'bg-gray-200'} flex items-center justify-center text-white text-lg`}>
                        <span>{assistant.emoji || '🤖'}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">{assistant.name}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mx-4 my-2 p-2">
            <button className="w-full flex items-center justify-center py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-100">
              <Plus className="h-4 w-4 mr-2" />
              <span>新建助手</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t">
          <div className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200">
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

