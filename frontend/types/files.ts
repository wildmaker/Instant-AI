export type FileCategory = "全部文件" | "文档" | "图片" | "语音" | "视频" | "知识库"

export interface FileStats {
  used: number
  total: number
  items: number
  maxItems: number
}

export interface FileItem {
  id: string
  name: string
  type: string
  size: number
  createdAt: string
  category: FileCategory
}

