"use client"

import { useState, useEffect } from "react"
import { Search, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileSidebar } from "@/components/files/file-sidebar"
import { Sidebar } from "@/components/sidebar/sidebar"
import { EmptyState } from "@/components/files/empty-state"
import { CreateKnowledgeModal } from "@/components/files/CreateKnowledgeModal"
import { FileUploadButton } from "@/components/files/FileUploadButton"
import type { FileCategory, FileItem } from "@/types/files"
import { useSearchParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { formatFileSize } from "@/lib/utils"

export default function FilesPage() {
  const router = useRouter()
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as FileCategory | null;
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>(categoryParam || "全部文件")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Update selected category when URL parameter changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam])

  // 模拟文件数据，实际项目中应该从 API 获取
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: '智能钥匙系统功能清单.png',
      type: 'image/png',
      size: 1.2 * 1024 * 1024, // 1.2 MB
      createdAt: '2023-03-12 10:30',
      category: '图片'
    },
    {
      id: '2',
      name: '产品需求文档.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 2.5 * 1024 * 1024, // 2.5 MB
      createdAt: '2023-03-11 15:45',
      category: '文档'
    },
    {
      id: '3',
      name: '智能家居知识库',
      type: 'knowledge-base',
      size: 5.7 * 1024 * 1024, // 5.7 MB
      createdAt: '2023-03-10 09:15',
      category: '知识库'
    }
  ])

  // 根据选择的分类和搜索关键词过滤文件
  const filteredFiles = files.filter(file => {
    // 分类过滤
    if (selectedCategory !== "全部文件" && file.category !== selectedCategory) {
      return false
    }
    
    // 搜索过滤
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    return true
  })

  const stats = {
    used: 9.4 * 1024 * 1024, // 9.4 MB
    total: 10 * 1024 * 1024, // 10 MB
    items: 3,
    maxItems: 100,
  }

  // 处理文件上传
  const handleFileUpload = async (files: File[]) => {
    // 模拟上传文件
    const newFiles: FileItem[] = files.map((file, index) => ({
      id: Date.now().toString() + index,
      name: file.name,
      type: file.type,
      size: file.size,
      createdAt: new Date().toLocaleString(),
      category: file.type.startsWith('image/') 
        ? '图片' 
        : file.type.includes('audio') 
          ? '语音' 
          : file.type.includes('video') 
            ? '视频' 
            : '文档'
    }))
    
    setFiles(prev => [...newFiles, ...prev])
    return Promise.resolve()
  }

  // 处理文件删除
  const handleDeleteFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  return (
    <div className="flex h-screen">
      {/* Left navigation sidebar - always visible */}
      <Sidebar />

      {/* File sidebar */}
      <FileSidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} stats={stats} />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索文件"
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">⌘ K</div>
          </div>

          {selectedCategory === "知识库" ? (
            <CreateKnowledgeModal />
          ) : (
            <FileUploadButton onUpload={handleFileUpload} />
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {filteredFiles.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-500 pb-2 border-b">
                <div className="flex-1">文件</div>
                <div className="w-32">创建时间</div>
                <div className="w-24">大小</div>
                <div className="w-16"></div>
              </div>

              {filteredFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between py-4 hover:bg-gray-50 rounded-lg px-2">
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      {file.category === '图片' && <img src="/placeholder.svg?height=40&width=40" alt="" className="w-6 h-6" />}
                      {file.category === '文档' && <img src="/placeholder.svg?height=40&width=40" alt="" className="w-6 h-6" />}
                      {file.category === '语音' && <img src="/placeholder.svg?height=40&width=40" alt="" className="w-6 h-6" />}
                      {file.category === '视频' && <img src="/placeholder.svg?height=40&width=40" alt="" className="w-6 h-6" />}
                      {file.category === '知识库' && <img src="/placeholder.svg?height=40&width=40" alt="" className="w-6 h-6" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm">{file.name}</span>
                      <Badge variant="outline" className="w-fit mt-1">{file.category}</Badge>
                    </div>
                  </div>
                  <div className="w-32 text-sm text-gray-500">{file.createdAt}</div>
                  <div className="w-24 text-sm text-gray-500">{formatFileSize(file.size)}</div>
                  <div className="w-16 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

