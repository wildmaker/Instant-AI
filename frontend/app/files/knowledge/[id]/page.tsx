"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowLeft, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar/sidebar"
import { EmptyState } from "@/components/files/empty-state"
import { FileUpload } from "@/components/files/FileUpload"
import { knowledgeApi } from "@/lib/api/knowledge"
import type { FileItem } from "@/types/files"

interface KnowledgeFilesPageProps {
  params: {
    id: string
  }
}

export default function KnowledgeFilesPage({ params }: KnowledgeFilesPageProps) {
  const router = useRouter()
  const [knowledgeBase, setKnowledgeBase] = useState<{ id: string; name: string; description?: string }>()
  const { data: files, mutate } = useSWR<FileItem[]>(`/api/knowledge-bases/${params.id}/files`, {
    refreshInterval: 30000,
    fallbackData: []
  })
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    const fetchKnowledgeBase = async () => {
      const { data } = await axios.get(`/api/knowledge-bases/${params.id}`)
      setKnowledgeBase(data)
    }
    fetchKnowledgeBase()
  }, [params.id])

  const handleFileUpload = async (files: File[]) => {
    try {
      await Promise.all(
        files.map(file => knowledgeApi.uploadFile(params.id, file))
      )
      // In a real app, refresh the file list
      mutate() // 触发SWR重新验证数据
      setShowUpload(false)
    } catch (error) {
      console.error("上传文件失败", error)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left navigation sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push('/files?category=知识库')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">{knowledgeBase?.name || '知识库'}</h1>
            {knowledgeBase?.description && (
              <span className="text-sm text-gray-500">{knowledgeBase.description}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-60">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索文件"
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button onClick={() => setShowUpload(true)}>
              <Upload className="w-4 h-4 mr-2" />
              上传文件
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {showUpload ? (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-medium mb-4">上传文件到知识库</h2>
              <FileUpload onUpload={handleFileUpload} />
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setShowUpload(false)}>
                  取消
                </Button>
              </div>
            </div>
          ) : files.length === 0 ? (
            <EmptyState />
          ) : (
            <div>
              <div className="flex items-center justify-between text-sm text-gray-500 pb-2 border-b">
                <div className="flex-1">文件</div>
                <div className="w-32">创建时间</div>
                <div className="w-24">大小</div>
              </div>

              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between py-4 hover:bg-gray-50 rounded-lg">
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <img src="/placeholder.svg?height=40&width=40" alt="" className="w-6 h-6" />
                    </div>
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <div className="w-32 text-sm text-gray-500">{file.createdAt}</div>
                  <div className="w-24 text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}