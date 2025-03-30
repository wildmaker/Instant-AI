import { apiClient } from './apiClient'

// 文档数据接口
export interface Document {
  name: string
  type: 'file'
  id: string
  docId: string
  url: string
  title: string
  createdAt: string
  size: number
  cached: boolean
  pinnedWorkspaces?: string[]
  watched?: boolean
  location?: string
}

// 文件夹数据接口
export interface Folder {
  id: string
  name: string
  type: 'folder'
  documentCount?: number
}

// 文档列表响应接口
export interface DocumentsResponse {
  documents: Document[]
}

// 文件夹列表响应接口
export interface FoldersResponse {
  folders: Folder[]
}

// 获取文档响应接口
export interface GetDocumentResponse {
  document: Document
}

// 文件上传响应接口
export interface UploadResponse {
  success: boolean
  error: string | null
  documents: Array<{
    location: string
    name: string
    url: string
    title: string
    docAuthor: string
    description: string
    docSource: string
    chunkSource: string
    published: string
    wordCount: number
    token_count_estimate: number
  }>
}

// 创建文件夹响应接口
export interface FolderActionResponse {
  success: boolean
  message: string | null
}

// 文件类型响应接口
export interface AcceptedFileTypesResponse {
  types: Record<string, string[]>
}

// 文档API服务
class DocumentApiService {
  // 获取文件夹列表
  async getFolders(): Promise<FoldersResponse> {
    try {
      return apiClient.get<FoldersResponse>('/folders')
    } catch (error) {
      console.error('获取文件夹列表失败:', error)
      return { folders: [] }
    }
  }
  
  // 获取文档列表(可选文件夹)
  async getDocuments(folderId?: string | null): Promise<DocumentsResponse> {
    try {
      const endpoint = folderId 
        ? `/documents?folder=${encodeURIComponent(folderId)}` 
        : '/documents'
      return apiClient.get<DocumentsResponse>(endpoint)
    } catch (error) {
      console.error('获取文档列表失败:', error)
      return { documents: [] }
    }
  }

  // 获取单个文档详情
  async getDocument(docId: string): Promise<GetDocumentResponse> {
    try {
      return apiClient.get<GetDocumentResponse>(`/document/${docId}`)
    } catch (error) {
      console.error(`获取文档(${docId})详情失败:`, error)
      throw error
    }
  }

  // 上传文件
  async uploadFiles(formData: FormData): Promise<UploadResponse> {
    try {
      return apiClient.uploadFile('/document/upload', formData)
    } catch (error) {
      console.error('上传文件失败:', error)
      throw error
    }
  }

  // 删除文档
  async deleteDocument(docId: string): Promise<FolderActionResponse> {
    try {
      return apiClient.delete<FolderActionResponse>(`/document/${docId}`)
    } catch (error) {
      console.error(`删除文档(${docId})失败:`, error)
      throw error
    }
  }

  // 上传链接
  async uploadLink(link: string): Promise<UploadResponse> {
    try {
      return apiClient.post<UploadResponse>('/document/upload-link', { link })
    } catch (error) {
      console.error('上传链接失败:', error)
      throw error
    }
  }

  // 上传原始文本
  async uploadRawText(textContent: string, metadata: { title: string, [key: string]: any }): Promise<UploadResponse> {
    try {
      return apiClient.post<UploadResponse>('/document/raw-text', { textContent, metadata })
    } catch (error) {
      console.error('上传原始文本失败:', error)
      throw error
    }
  }

  // 创建文件夹
  async createFolder(name: string): Promise<FolderActionResponse> {
    try {
      return apiClient.post<FolderActionResponse>('/folder', { name })
    } catch (error) {
      console.error(`创建文件夹(${name})失败:`, error)
      throw error
    }
  }

  // 删除文件夹
  async deleteFolder(folderId: string): Promise<FolderActionResponse> {
    try {
      return apiClient.delete<FolderActionResponse>(`/folder/${folderId}`)
    } catch (error) {
      console.error(`删除文件夹(${folderId})失败:`, error)
      throw error
    }
  }

  // 移动文件
  async moveFiles(files: Array<{ from: string, to: string }>): Promise<FolderActionResponse> {
    try {
      return apiClient.post<FolderActionResponse>('/document/move', { files })
    } catch (error) {
      console.error('移动文件失败:', error)
      throw error
    }
  }

  // 获取支持的文件类型
  async getAcceptedFileTypes(): Promise<AcceptedFileTypesResponse> {
    try {
      return apiClient.get<AcceptedFileTypesResponse>('/document/accepted-file-types')
    } catch (error) {
      console.error('获取支持的文件类型失败:', error)
      // 返回默认支持类型作为后备
      return { 
        types: {
          document: ['.pdf', '.docx', '.txt'],
          audio: ['.mp3', '.wav'],
          video: ['.mp4']
        } 
      }
    }
  }

  // 获取元数据模式
  async getMetadataSchema(): Promise<{ schema: Record<string, string> }> {
    try {
      return apiClient.get<{ schema: Record<string, string> }>('/document/metadata-schema')
    } catch (error) {
      console.error('获取元数据模式失败:', error)
      return { schema: {} }
    }
  }
}

export const documentApi = new DocumentApiService()