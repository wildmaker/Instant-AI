"use client"

import { useState } from "react"
import { Search, ExternalLink, ChevronDown, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

// 定义侧边栏宽度常量
const KNOWLEDGE_SIDEBAR_WIDTH = "360px";

interface KnowledgeFile {
  id: string
  title: string
  type: string
  date?: string
  icon?: string
  isPDF?: boolean
  url?: string // 新增URL字段用于文件预览链接
}

interface KnowledgeFileSidebarProps {
  className?: string;
}

export function KnowledgeFileSidebar({ className }: KnowledgeFileSidebarProps) {
  const [files, setFiles] = useState<KnowledgeFile[]>([
    {
      id: "1",
      title: "2025年 AI Agent行业报告-20250314-最终版",
      type: "PDF",
      date: "2025.03.14",
      isPDF: true,
      url: "/sample.pdf"
    },
    {
      id: "2",
      title: "2025具身智能技术应用发展报告（一）0.2",
      type: "PDF",
      date: "2025.03.10",
      isPDF: true,
      url: "/sample.pdf"
    },
    {
      id: "3",
      title: "2025OpenStack开放AI服务生态系统.pdf",
      type: "PDF",
      date: "2025.02.28",
      isPDF: true,
      url: "/report.pdf"
    },
    {
      id: "4",
      title: "宇创科技-信息化规划.pdf",
      type: "PDF",
      date: "2025.01.15",
      isPDF: true,
      url: "/contract.pdf"
    },
    {
      id: "5",
      title: "智能不冷-CYANGUPSETS-2025.pdf",
      type: "PDF",
      date: "2025.01.05",
      isPDF: true,
      url: "/sample.pdf"
    },
    {
      id: "6",
      title: "AGI思考发展.黑桥研究院_2025.01.V1.0",
      type: "PDF",
      date: "2025.01.01",
      isPDF: true,
      url: "/report.pdf"
    },
  ])

  const getRandomColor = (id: string) => {
    const colors = [
      "bg-purple-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-pink-500",
    ];
    return colors[parseInt(id) % colors.length];
  };

  return (
    <div className={cn("flex flex-col h-screen w-[360px] border-l", className)}>
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded mr-2 bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <div>
            <h2 className="font-medium">AIGC 研究报告</h2>
            <p className="text-xs text-gray-500">Knowledge Base</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索文件..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between text-sm text-gray-500 py-2">
            <span>全部文件</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {files.map((file) => (
          <div 
            key={file.id} 
            className="mx-4 my-2 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => file.url && window.open(file.url, '_blank')}
          >
            <div className="flex items-start">
              <div className={`w-10 h-12 ${getRandomColor(file.id)} rounded flex items-center justify-center mr-3`}>
                <span className="text-white font-bold text-xs">PDF</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{file.title}</h4>
                <div className="flex items-center mt-1">
                  <span className="inline-block px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-xs mr-2">PDF</span>
                  <span className="text-xs text-gray-500">{file.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      </div>
    </div>
  )
}