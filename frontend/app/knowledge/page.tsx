"use client"

import { useState, useEffect } from "react"
import { CreateKnowledgeModal } from "@/components/files/CreateKnowledgeModal"
import { Sidebar } from "@/components/sidebar/sidebar"
import { Button } from "@/components/ui/button"
import { Search, Database, FileText, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatFileSize } from "@/lib/utils"

interface KnowledgeBase {
  id: string
  name: string
  description?: string
  fileCount: number
  size: number
  createdAt: string
}

export default function KnowledgePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  
  // 模拟知识库数据，实际项目中应该从 API 获取
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([
    {
      id: "1",
      name: "智能家居知识库",
      description: "关于智能家居的各种资料和文档",
      fileCount: 12,
      size: 25 * 1024 * 1024, // 25 MB
      createdAt: "2023-03-10 09:15"
    },
    {
      id: "2",
      name: "产品手册集合",
      description: "各种产品的使用手册和说明文档",
      fileCount: 8,
      size: 15 * 1024 * 1024, // 15 MB
      createdAt: "2023-03-08 14:30"
    }
  ])

  // 根据搜索关键词过滤知识库
  const filteredKnowledgeBases = knowledgeBases.filter(kb => {
    if (!searchQuery) return true
    
    return (
      kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (kb.description && kb.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  // 处理删除知识库
  const handleDeleteKnowledgeBase = (id: string) => {
    setKnowledgeBases(prev => prev.filter(kb => kb.id !== id))
  }

  // 处理查看知识库详情
  const handleViewKnowledgeBase = (id: string) => {
    router.push(`/files/knowledge/${id}`)
  }

  return (
    <div className="flex h-screen">
      {/* Left navigation sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <h1 className="text-xl font-semibold">知识库</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索知识库"
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <CreateKnowledgeModal />
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {filteredKnowledgeBases.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-medium">尚未创建任何知识库</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  点击下方按钮开始创建你的第一个知识库
                </p>
              </div>
              <CreateKnowledgeModal />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredKnowledgeBases.map((kb) => (
                <div 
                  key={kb.id} 
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => handleViewKnowledgeBase(kb.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-500" />
                        <h3 className="font-medium text-lg">{kb.name}</h3>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteKnowledgeBase(kb.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {kb.description && (
                      <p className="text-gray-500 text-sm mt-2 line-clamp-2">{kb.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{kb.fileCount} 个文件</span>
                      </div>
                      <div>{formatFileSize(kb.size)}</div>
                    </div>
                  </div>
                  
                  <div className="flex border-t">
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-none py-2 h-10 text-blue-600"
                      onClick={() => handleViewKnowledgeBase(kb.id)}
                    >
                      查看详情
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-none py-2 h-10 border-l"
                      onClick={() => router.push(`/files?category=知识库`)}
                    >
                      管理文件
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* 添加新知识库卡片 */}
              <CreateKnowledgeModal>
                <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow border-dashed h-full flex items-center justify-center cursor-pointer">
                  <div className="flex flex-col items-center justify-center p-6 text-gray-500">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                      <Plus className="h-6 w-6 text-blue-500" />
                    </div>
                    <span className="font-medium">创建新知识库</span>
                  </div>
                </div>
              </CreateKnowledgeModal>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}